from fastapi import APIRouter
""" LOADING LIBRARIES """
from llava.constants import IMAGE_TOKEN_INDEX
from llava.conversation import conv_templates, SeparatorStyle
from llava.mm_utils import process_images
from transformers import TextStreamer
from pydantic import BaseModel
from typing import List
from io import BytesIO
import torch
from PIL import Image
from fastapi import Query
from PIL import Image
import torch
import base64
from setup import Initializer
from models.image import ImagePayload
from models.detection import DetectionInput
from models.retrieval import RetrievalOutput
from assets.prompt_template_setup import prompt_template

router = APIRouter(prefix="/ai", tags=["Ai"])

Initializer = Initializer.get_instance()

@router.get("/")
def read_root():
    return {"message": "Hello, FastAPI!"}

# TODO: Move core logics to service layer

@router.post("/object-detector")
def object_detector(payload: ImagePayload):
    # Decode base64 string to bytes
    image_data = base64.b64decode(payload.image_base64.split(",")[-1])
    # Load the image with PIL
    image = Image.open(BytesIO(image_data)).convert("RGB")
    # Object Detection
    with torch.no_grad():
        inputs = Initializer.yolo_image_processor(images=[image], return_tensors="pt")
        outputs = Initializer.yolo_model(**inputs.to(Initializer.device))
        target_sizes = torch.tensor([[image.size[1], image.size[0]]])
        results = Initializer.yolo_image_processor.post_process_object_detection(outputs, threshold=0.85, target_sizes=target_sizes)[0]
    
        items = {"scores":[],"labels":[],"bboxes":[]}
        boxes = []
        for score, label, box in zip(results["scores"], results["labels"], results["boxes"]):
            score = score.item()
            label = label.item()
            box = [i.item() for i in box]
            items["scores"].append(score)
            items["labels"].append(label)
            items["bboxes"].append(box)
    # Output
    return items

@router.post("/image-retrieval")
def image_retrieval(payload: DetectionInput, k: int = Query(...)):
    """ Load the image """
    # Decode base64 string to bytes
    image_data = base64.b64decode(payload.image_base64.split(",")[-1])
    # Load the image with PIL
    image = Image.open(BytesIO(image_data)).convert("RGB")
    
    """ Object Cropping """
    cropped_objects = []
    # Cropping the objects of interest
    for box in payload.items.bboxes:
        a = image.crop(box)
        cropped_objects.append(a)

    """ Searching the image through vector database """
    # Initialize
    image_features = []
    dists, indexes = [], []
    # Perform image feature extraction
    inputs = Initializer.feature_extractor(images = cropped_objects, return_tensors="pt")
    for i in range(inputs['pixel_values'].size(0)):
        feature = inputs['pixel_values'][i].unsqueeze(0)
        image_features = Initializer.clip_model.get_image_features(feature.to(Initializer.device))
        # Normalize the features
        image_features = image_features / image_features.norm(p=2, dim=-1, keepdim=True)  
        image_features = image_features.detach().cpu().numpy()
        # Retrieve the similar image features through cosine similarity
        D, I = Initializer.index.search(image_features, k)
        # Getting the data of distance and index
        dists+= D.tolist()
        indexes += I.tolist()

    """ Getting Image Paths and Scores """
    retrieved_image_paths = []
    scores = []
    for index_,dist_ in zip(indexes,dists):
        for i in range(len(index_)):
            retrieved_image_paths.append(Initializer.image_paths[index_[i]])
            scores.append(round(dist_[i],4))

    """ Return Output """
    return {
        "retrieved_image_paths":retrieved_image_paths,
        "scores":scores}

@router.post("/response-generation")
def response_generation(
    image: ImagePayload, 
    data: RetrievalOutput, 
    user_query: str = Query(...)
):
    """ Load the image """
    # Decode base64 string to bytes
    image_data = base64.b64decode(image.image_base64.split(",")[-1])
    # Load the image with PIL
    main_image = Image.open(BytesIO(image_data)).convert("RGB")
    
    """ Construct the image tensor """
    # Initialize the images vector
    images = [main_image]
    # Add more images 
    for path in data.retrieved_image_paths:
        images.append(Image.open(path).convert("RGB"))
    # Connvert to tensor
    image_tensor = process_images(images, Initializer.image_processor, Initializer.model).to(Initializer.device, dtype=torch.float16)
    image_sizes = [img.size for img in images]
    
    """ Construct the extra_info for prompt_template """
    extra_info = ""
    i = 1
    for path in data.retrieved_image_paths:
        concept = Initializer.database['path_to_concept'].get(path)
        if concept is None:
            # Handle the error, e.g., return a 400 response or a default value
            raise ValueError("Concept is None. Cannot look up name.")
        if concept not in Initializer.database['concept_dict']:
            # Handle missing concept
            raise KeyError(f"Concept '{concept}' not found in concept_dict.")
        name = Initializer.database['concept_dict'][concept]["name"]
        info = Initializer.database['concept_dict'][concept]["info"]
        extra_info += f"{i}. <image>\n"
        for key in Initializer.database['concept_dict']["<anya-forger>"].keys():
            extra_info+=f"{key}: {Initializer.database['concept_dict']['<anya-forger>'][key]}, "
        extra_info += "\n"
        i +=1
        
    """ Change the prompt template """
    prompt_chat = prompt_template.replace("<<extra_info>>",extra_info.rstrip()).replace("<<user_query>>",user_query)

    """ Finalizing Response """
    # Initialize Values
    conv = conv_templates["llava_v0"].copy()
    input_ids = Initializer.tokenizer_image_token(prompt_chat, Initializer.tokenizer, IMAGE_TOKEN_INDEX, return_tensors='pt').unsqueeze(0).to(Initializer.model.device)
    stop_str = conv.sep if conv.sep_style != SeparatorStyle.TWO else conv.sep2
    keywords = [stop_str]
    streamer = TextStreamer(Initializer.tokenizer, skip_prompt=True, skip_special_tokens=True)
    # Model inferencing
    with torch.inference_mode():
        output_ids = Initializer.model.generate(
            input_ids,
            images=image_tensor,
            image_sizes=image_sizes,
            do_sample=False,
            temperature=0,
            max_new_tokens=512,
            streamer=streamer,
            use_cache=True)
    # Decode the output
    response = Initializer.tokenizer.decode(output_ids[0], skip_special_tokens=True)
    print(prompt_chat)

    """ Generate output """
    return {"response": response}
