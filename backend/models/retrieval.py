from pydantic import BaseModel
from typing import List
from models.product_model import Product

class RetrievalOutput(BaseModel):
    retrieved_image_paths: List[str]
    detected_labels: List[str]
    similarity_scores: List[float]
    products: List[Product]
