from pydantic import BaseModel
from typing import List, Optional

class Review(BaseModel):
    user: str
    rating: int
    comment: str

class Product(BaseModel):
    id: str
    title: str
    material_info: str
    description: str
    reviews: Optional[List[Review]] = []
