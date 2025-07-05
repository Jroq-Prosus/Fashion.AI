""" LOADING LIBRARIES """
from setup import *
from prompt_template_setup import *

app = FastAPI()

class ImagePayload(BaseModel):
    image_base64: str

class DetectionItem(BaseModel):
    scores: List[float]
    labels: List[int]
    bboxes: List[List[float]]  

class DetectionInput(BaseModel):
    image_base64: str
    items: DetectionItem

class RetrievalOutput(BaseModel):
    retrieved_image_paths: List[str]
    scores: List[float]


@app.get("/")
def read_root():
    return {"message": "Hello, FastAPI!"}

@app.post("/object-detector")
def object_detector(payload: ImagePayload):
    # Decode base64 string to bytes
    image_data = base64.b64decode(payload.image_base64.split(",")[-1])
    # Load the image with PIL
    image = Image.open(BytesIO(image_data)).convert("RGB")
    # Object Detection
    with torch.no_grad():
        inputs = yolo_image_processor(images=[image], return_tensors="pt")
        outputs = yolo_model(**inputs.to(device))
        target_sizes = torch.tensor([[image.size[1], image.size[0]]])
        results = yolo_image_processor.post_process_object_detection(outputs, threshold=0.85, target_sizes=target_sizes)[0]
    
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

@app.post("/image-retrieval")
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
    inputs = feature_extractor(images = cropped_objects, return_tensors="pt")
    for i in range(inputs['pixel_values'].size(0)):
        feature = inputs['pixel_values'][i].unsqueeze(0)
        image_features = clip_model.get_image_features(feature.to(device))
        # Normalize the features
        image_features = image_features / image_features.norm(p=2, dim=-1, keepdim=True)  
        image_features = image_features.detach().cpu().numpy()
        # Retrieve the similar image features through cosine similarity
        D, I = index.search(image_features, k)
        # Getting the data of distance and index
        dists+= D.tolist()
        indexes += I.tolist()

    """ Getting Image Paths and Scores """
    retrieved_image_paths = []
    scores = []
    for index_,dist_ in zip(indexes,dists):
        for i in range(len(index_)):
            retrieved_image_paths.append(image_paths[index_[i]])
            scores.append(round(dist_[i],4))

    """ Return Output """
    return {
        "retrieved_image_paths":retrieved_image_paths,
        "scores":scores}

@app.post("/response-generation")
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
    image_tensor = process_images(images, image_processor, model).to("cuda:0", dtype=torch.float16)
    image_sizes = [img.size for img in images]
    
    """ Construct the extra_info for prompt_template """
    extra_info = ""
    i = 1
    for path in data.retrieved_image_paths:
        concept = database['path_to_concept'].get(path)
        name = database['concept_dict'][concept]["name"]
        info = database['concept_dict'][concept]["info"]
        extra_info += f"{i}. <image>\n"
        for key in database['concept_dict']["<anya-forger>"].keys():
            extra_info+=f"{key}: {database['concept_dict']['<anya-forger>'][key]}, "
        extra_info += "\n"
        i +=1
        
    """ Change the prompt template """
    prompt_chat = prompt_template.replace("<<extra_info>>",extra_info.rstrip()).replace("<<user_query>>",user_query)

    """ Finalizing Response """
    # Initialize Values
    conv = conv_templates["llava_v0"].copy()
    input_ids = tokenizer_image_token(prompt_chat, tokenizer, IMAGE_TOKEN_INDEX, return_tensors='pt').unsqueeze(0).to(model.device)
    stop_str = conv.sep if conv.sep_style != SeparatorStyle.TWO else conv.sep2
    keywords = [stop_str]
    streamer = TextStreamer(tokenizer, skip_prompt=True, skip_special_tokens=True)
    # Model inferencing
    with torch.inference_mode():
        output_ids = model.generate(
            input_ids,
            images=image_tensor,
            image_sizes=image_sizes,
            do_sample=False,
            temperature=0,
            max_new_tokens=512,
            streamer=streamer,
            use_cache=True)
    # Decode the output
    response = tokenizer.decode(output_ids[0], skip_special_tokens=True)
    print(prompt_chat)

    """ Generate output """
    return {"response": response}
        
    
