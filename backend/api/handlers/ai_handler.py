""" LOADING LIBRARIES """
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from io import BytesIO
import torch
from PIL import Image
from fastapi import Query
import torch
import base64
import io
from setup import Initializer
from function import groq_llama_completion, compress_and_encode_image
from api.handlers.ai_trend_geo_handler import get_trendy_store_locations_api
from collections import defaultdict
from models.image import ImagePayload
from models.detection import DetectionInput
from models.retrieval import RetrievalOutput
from models.user import FashionAdvisorInput,UserQuery
from fastapi import File, UploadFile
from models.trend_geo import TrendGeoRequest
from assets.prompt_template_setup import *
import os
from utils.utils import translate_url

router = APIRouter(prefix="/ai", tags=["Ai"])

Initializer = Initializer.get_instance()


# -------------------------------
# AI Router Endpoints
# -------------------------------

@router.get("/")
def read_root():
    """
    Purpose: Health check endpoint for the AI router.
    Input: None
    Output: JSON message confirming the API is running.
    Example Response: {"message": "Hello, FastAPI!"}
    """
    return {"message": "Hello, FastAPI!"}


@router.post("/object-detector")
def object_detector(payload: ImagePayload):
    """
    Purpose: Detects objects in a user-uploaded image using a YOLO model.
    Input: JSON body with a base64-encoded image (ImagePayload: { image_base64: str })
    Output: JSON with detected object scores, labels, and bounding boxes.
    Example Response:
        {
            "scores": [0.98, 0.87],
            "labels": ["top", "shoes"],
            "bboxes": [[x1, y1, x2, y2], ...]
        }
    """
    # Decode base64 string to bytes
    image_data = base64.b64decode(payload.image_base64.split(",")[-1])
    # Load the image with PIL
    image = Image.open(BytesIO(image_data)).convert("RGB")
    # Object Detection
    with torch.no_grad():
        inputs = Initializer.yolo_image_processor(images=[image], return_tensors="pt")
        outputs = Initializer.yolo_model(**inputs.to(Initializer.device))
        target_sizes = torch.tensor([[image.size[1], image.size[0]]])
        results = Initializer.yolo_image_processor.post_process_object_detection(
            outputs, threshold=0.85, target_sizes=target_sizes)[0]

        items = {"scores": [], "labels": [], "bboxes": []}
        boxes = []
        for score, label, box in zip(results["scores"], results["labels"], results["boxes"]):
            score = score.item()
            label = label.item()
            box = [i.item() for i in box]
            items["scores"].append(score)
            items["labels"].append(Initializer.yolo_model.config.id2label[label])
            items["bboxes"].append(box)
    # Return Output
    return items


@router.post("/image-retrieval")
def image_retrieval(payload: DetectionInput, k: int = Query(5, description="Number of results per object")):
    """
    Purpose: Retrieves similar images from a vector database for each detected object in the input image.
    Input: JSON body with base64-encoded image and detected items (DetectionInput), query parameter k (number of results per object).
    Output: JSON with lists of retrieved image paths, detected labels, and similarity scores.
    Example Response:
        {
            "retrieved_image_paths": ["/path/to/img1.jpg", ...],
            "detected_labels": ["top", ...],
            "similarity_scores": [0.92, ...]
        }
    """
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
    detected_labels = []
    inputs = Initializer.feature_extractor(
        images=cropped_objects, return_tensors="pt")
    for i in range(inputs['pixel_values'].size(0)):
        feature = inputs['pixel_values'][i].unsqueeze(0)
        image_features = Initializer.clip_model.get_image_features(feature.to(Initializer.device))
        # Normalize the features
        image_features = image_features / \
            image_features.norm(p=2, dim=-1, keepdim=True)
        image_features = image_features.detach().cpu().numpy()
        # Retrieve the similar image features through cosine similarity
        D, I = Initializer.index.search(image_features, k)
        # Getting the data of distance and index
        dists += D.tolist()
        indexes += I.tolist()
        detected_labels += [payload.items.labels[i]]*k

    """ Getting Image Paths and Scores """
    retrieved_image_paths = []
    scores = []
    for index_, dist_ in zip(indexes, dists):
        for i in range(len(index_)):
            retrieved_image_paths.append(Initializer.image_paths[index_[i]])
            scores.append(round(dist_[i], 4))

    # Truncate each list to the first k elements
    retrieved_image_paths = retrieved_image_paths[:k]
    detected_labels = detected_labels[:k]
    scores = scores[:k]

    # Retrieve product metadata for each image path
    products = []
    for path in retrieved_image_paths:
        db_path = translate_url(path)
        response = Initializer.database.table("products").select("*").eq("image", db_path).execute()
        if response.data and len(response.data) > 0:
            products.append(response.data[0])
        else:
            products.append(None)  # or skip, depending on requirements

    """ Return Output """
    return {
        "retrieved_image_paths": retrieved_image_paths,
        "detected_labels": detected_labels,
        "similarity_scores": scores,
        "products": products
    }


@router.post("/response-generation-fasion-advisor") # embed feature session tracking here
def response_generation(
    image: ImagePayload,
    data: RetrievalOutput,
    user_query: str = Query(...)
):
    """
    Purpose: Generates a natural language response as a fashion advisor, based on the user's image, retrieval results, and query.
    Input:
        - image: JSON body with base64-encoded image (ImagePayload)
        - data: RetrievalOutput (retrieved_image_paths, detected_labels, similarity_scores)
        - user_query: string (query parameter)
    Output: JSON with a generated response string from the AI model.
    Example Response:
        {"response": "Based on your outfit, I recommend..."}
    """
    """ Load the image """
    query_image = image.image_base64

    """ Preprocess the Retrieval Output """
    # Step 0: Replace spaces in image paths with %20 and trailing backslash with double backslash

    # Step 1: Combine all data
    combined = list(zip(
        data.retrieved_image_paths,
        data.detected_labels,
        data.similarity_scores
    ))
    # Step 2: Define category priority
    priority_order = ["top", "bottom", "shoes", "hat", "outer", "dress", "bag"]
    best_items_by_label = defaultdict(
        lambda: (None, -1))  # label -> (item, score)
    for item in combined:
        path, label, score = item
        if score > best_items_by_label[label][1]:
            best_items_by_label[label] = (item, score)
    # Step 3: Pick top 3 based on priority order
    selected_items = []
    for label in priority_order:
        if label in best_items_by_label:
            selected_items.append(best_items_by_label[label][0])
        if len(selected_items) == Initializer.max_selected_items_mllm:
            break
    # Step 4: Unpack result
    retrieved_image_paths, detected_labels, similarity_scores = zip(
        *selected_items)
    # Step 5: retrieval result
    retrieval_result = {
        "retrieved_image_paths": list(retrieved_image_paths),
        "detected_labels": list(detected_labels),
        "similarity_scores": list(similarity_scores)
    }

    """ Construct the Prompt Message Payload """
    # Main Query
    content = [{
        "type": "text",
        "text": f"USER's QUERY: {user_query}"
    }]
    # Add the Query from the User
    content.append({
        "type": "text",
        "text": f"This is the user photo in his/her style wearing an outfit."
    })
    # Get Image Url accordingly
    IMAGE_DATA_URL = query_image
    content.append({
        "type": "image_url",
        "image_url": {
            "url": IMAGE_DATA_URL
        }
    })
    # Get Extra Info
    i = 1
    for path in retrieval_result["retrieved_image_paths"]:
        # Query Supabase for the product with this image path
        path = translate_url(path)
        response = Initializer.database.table("products").select("*").eq("image", path).execute()
        if not response.data or len(response.data) == 0:
            raise ValueError(f"No product found for image path: {path}")
        product = response.data[0]
        extra_info = f"{i}. Extra Info on this image reference that matched to the user's outfit (only look at this if you find helpful):\n"
        for key, value in product.items():
            extra_info += f"{key}: {value}\n"
        content.append({
            "type": "text",
            "text": f"{extra_info}"
        })
        # Generate a public URL for the image in Supabase Storage
        # If path is already a public URL, use it directly; otherwise, construct it
        if path.startswith("http://") or path.startswith("https://"):
            image_url = path
        else:
            SUPABASE_URL = Initializer.database.url if hasattr(Initializer.database, 'url') else os.getenv("SUPABASE_URL")
            SUPABASE_BUCKET = "product-images"
            image_url = f"{SUPABASE_URL}/storage/v1/object/public/{SUPABASE_BUCKET}/{path}"
        content.append({
            "type": "image_url",
            "image_url": {
                "url": image_url
            }
        })
        i += 1
    # Construct the Final Message Payload
    messages = [
        {
            "role": "system",
            "content": system_instruction_outfit_advisor
        },
        {
            "role": "user",
            "content": content
        }
    ]

    """ Generate Output """
    return {"response": groq_llama_completion(messages, token=1024)}

@router.post("/fashion-advisor-visual")
def full_fashion_advisor(payload: FashionAdvisorInput):
    """
    Purpose: A full pipeline endpoint that performs object detection,
    image retrieval, and fashion response generation in a single call.
    Input: Base64 image and user query
    Output: Generated fashion advice response
    """
    # Step 1: Object Detection
    detection_payload = ImagePayload(image_base64=payload.image_base64)
    detection_result = object_detector(detection_payload)

    # Step 2: Image Retrieval
    retrieval_payload = DetectionInput(
        image_base64=payload.image_base64,
        items=detection_result
    )
    k = 3
    retrieval_result = image_retrieval(retrieval_payload, k)

    # Step 3: Response Generation
    image_payload = ImagePayload(image_base64=payload.image_base64)
    retrieval_output = RetrievalOutput(**retrieval_result)

    return response_generation(
        image=image_payload,
        data=retrieval_output,
        user_query=payload.user_query
    )

@router.post("/online-search-agent")
async def online_agent(payload: UserQuery):
    # Simplify Query
    messages = [
        {
            "role": "system",
            "content": system_instruction_simplify_prompt
        },
        {
            "role": "user",
            "content": [{
                        "type": "text",
                        "text": f"User Query: {payload.user_query}"
                         }]  
        }
    ]
    simplified_query = groq_llama_completion(messages, token=1024)
    print(simplified_query)
    # Make product description
    messages = [
        {
            "role": "system",
            "content": system_instruction_product_desc
        },
        {
            "role": "user",
            "content": [{
                        "type": "text",
                        "text": f"User Query: {payload.user_query}"
                         }]  
        }
    ]
    description  = groq_llama_completion(messages, token=1024)
    print(description)
    # Get trend score API
    data = {
            "product_metadata": {
                "description":description
            },
            "user_style_description": simplified_query,
            "user_location": "San Francisco, CA"
        }
    result = await get_trendy_store_locations_api(TrendGeoRequest(**data))
    return {"response":result}

