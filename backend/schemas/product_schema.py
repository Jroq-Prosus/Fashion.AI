from pydantic import BaseModel
from typing import List, Optional

# Ini model asli untuk metadata
class Review(BaseModel):
    user: str
    rating: int
    comment: str

class ProductMetadata(BaseModel):
    id: str
    title: str
    material_info: str
    description: str
    reviews: Optional[List[Review]] = []

# Standard response wrapper
class StandardResponseWithMetadata(BaseModel):
    code: int
    message: str
    data: ProductMetadata
