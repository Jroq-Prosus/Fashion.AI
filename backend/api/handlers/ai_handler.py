""" LOADING LIBRARIES """
from fastapi import APIRouter, Depends, HTTPException
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
from schemas.product_schema import ProductMetadata
import re
from utils.jwt_util import *

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


@router.post("/response-generation-fasion-advisor")  # embed feature session tracking here
def response_generation(
    image: ImagePayload,
    data: RetrievalOutput,
    user_query: str = Query(...),
    k: int = Query(5, description="Number of results per object"),
    user_id: str = Depends(get_user_id)
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
    # Load the image
    query_image = image.image_base64

    # Preprocess the Retrieval Output
    combined = list(zip(
        data.retrieved_image_paths,
        data.detected_labels,
        data.similarity_scores
    ))

    # Define category priority
    priority_order = ["top", "bottom", "shoes", "hat", "outer", "dress", "bag"]
    best_items_by_label = defaultdict(lambda: (None, -1))  # label -> (item, score)

    for path, label, score in combined:
        if score > best_items_by_label[label][1]:
            best_items_by_label[label] = ((path, label, score), score)

    # Pick top N items based on priority order
    selected_items = []
    for label in priority_order:
        if label in best_items_by_label:
            selected_items.append(best_items_by_label[label][0])
        if len(selected_items) == Initializer.max_selected_items_mllm:
            break

    if not selected_items:
        raise HTTPException(status_code=404, detail="No matching items found")

    retrieved_image_paths, detected_labels, similarity_scores = zip(*selected_items)

    retrieval_result = {
        "retrieved_image_paths": list(retrieved_image_paths),
        "detected_labels": list(detected_labels),
        "similarity_scores": list(similarity_scores)
    }

    # Construct Prompt Message Payload
    content = [{
        "type": "text",
        "text": f"USER's QUERY: {user_query}"
    }, {
        "type": "text",
        "text": "This is the user photo in his/her style wearing an outfit."
    }, {
        "type": "image_url",
        "image_url": {"url": query_image}
    }]

    products = []  # Collect product metadata for response
    i = 1
    for path in retrieval_result["retrieved_image_paths"]:
        path = translate_url(path)
        response = Initializer.database.table("products").select("*").eq("image", path).execute()
        if not response.data or len(response.data) == 0:
            raise ValueError(f"No product found for image path: {path}")
        product = response.data[0]
        products.append(product)

        extra_info = f"{i}. Extra Info on this image reference:\n"
        for key, value in product.items():
            extra_info += f"{key}: {value}\n"
        content.append({"type": "text", "text": extra_info})

        # Add public URL
        if path.startswith(("http://", "https://")):
            image_url = path
        else:
            SUPABASE_URL = Initializer.database.url if hasattr(Initializer.database, 'url') else os.getenv("SUPABASE_URL")
            SUPABASE_BUCKET = "product-images"
            image_url = f"{SUPABASE_URL}/storage/v1/object/public/{SUPABASE_BUCKET}/{path}"
        content.append({"type": "image_url", "image_url": {"url": image_url}})
        i += 1

    messages = [
        {"role": "system", "content": system_instruction_outfit_advisor},
        {"role": "user", "content": content}
    ]

    # Track user session in Supabase
    session_data = {
        "user_id": user_id,
        "query_text": user_query,
        "image_path": query_image,
        "recommendations": [p["image"] for p in products]
    }
    Initializer.database.table("user_sessions").insert(session_data).execute()

    # Generate response
    ai_response = groq_llama_completion(messages, token=1024)

    return {
        "response": ai_response,
        "products": products[:k]
    }

@router.post("/fashion-advisor-visual")
def full_fashion_advisor(
    payload: FashionAdvisorInput,
    user_id: str = Depends(get_user_id)  # Inject user_id from token
):
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
    advisor_response = response_generation(
        image=image_payload,
        data=retrieval_output,
        user_query=payload.user_query,
        k=k
    )

    # ======= EMBED SESSION TRACKING =======
    session_data = {
        "user_id": user_id,  # NULL if anonymous
        "query_text": payload.user_query,
        "image_path": payload.image_base64,  # optionally upload to Supabase Storage
        "recommendations": retrieval_result["retrieved_image_paths"]
    }
    Initializer.database.table("user_sessions").insert(session_data).execute()

    return advisor_response

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

@router.post("/fashion-advisor-text-only")
def fashion_advisor_text_only(
    user_query: str = Query(...), 
    k: int = Query(3, description="Number of top products to return"),
    user_id: str = Depends(get_user_id)  # Get user_id from token if available
):
    """
    Purpose: Generate a fashion recommendation/analysis based only on user_query and all products in the database.
    Input: user_query (string)
    Output: JSON with a generated response string and top k products.
    Example Response:
        {"response": "Based on your query, I recommend...", "products": [ ... ]}
    """
    # Fetch all products (no pagination for now)
    response = Initializer.database.table("products").select("*").execute()
    products = response.data if response.data else []

    # Optionally, convert to ProductMetadata for consistency
    product_objs = [ProductMetadata(**item).dict() for item in products]

    # Use AI to select the top k most relevant products
    # Prepare a string with all product info for the model
    all_product_info = "\n".join([
        f"{i+1}. {p['name']} - {p.get('description', '')} (Brand: {p.get('brand', '')}, Category: {p.get('category', '')})"
        for i, p in enumerate(product_objs)
    ])
    selection_prompt = [
        {"type": "text", "text": f"USER's QUERY: {user_query}"},
        {"type": "text", "text": "Here are all available products in our store:"},
        {"type": "text", "text": all_product_info},
        {"type": "text", "text": f"Please select the top {k} products (by their number) that are most relevant to the user's query. Return ONLY a comma-separated list of numbers, no explanation."}
    ]
    selection_messages = [
        {"role": "system", "content": system_instruction_basic_qna},
        {"role": "user", "content": selection_prompt}
    ]
    selection_response = groq_llama_completion(selection_messages, token=128)
    indices = [int(x.strip())-1 for x in re.findall(r'\d+', selection_response)][:k]
    selected_products = [product_objs[i] for i in indices if 0 <= i < len(product_objs)]

    # Prepare product info for the prompt (only top k)
    product_info = "\n".join([
        f"{i+1}. {p['name']} - {p.get('description', '')} (Brand: {p.get('brand', '')}, Category: {p.get('category', '')})"
        for i, p in enumerate(selected_products)
    ])

    # Construct the prompt
    content = [
        {"type": "text", "text": f"USER's QUERY: {user_query}"},
        {"type": "text", "text": "Here are some available products in our store:"},
        {"type": "text", "text": product_info}
    ]
    messages = [
        {"role": "system", "content": system_instruction_basic_qna},
        {"role": "user", "content": content}
    ]

    # Generate the response
    response_text = groq_llama_completion(messages, token=1024)

    # ======= EMBED SESSION TRACKING =======
    session_data = {
        "user_id": user_id,  # NULL if anonymous
        "query_text": user_query,
        "image_path": None,  # No image in text-only flow
        "recommendations": [p["name"] for p in selected_products]  # Save recommended product names
    }
    Initializer.database.table("user_sessions").insert(session_data).execute()

    return {
        "response": response_text,
        "products": selected_products
    }
