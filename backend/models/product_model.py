from pydantic import BaseModel
from typing import List, Optional

class Review(BaseModel):
    user: str
    rating: int
    comment: str

class Product(BaseModel):
    id: str
    name: str        # ganti dari title ke name
    material_info: Optional[str] = None  # sekarang nullable
    description: str
    brand: str
    gender: str
    category: str
    product_link: str
    image: str
    reviews: Optional[List[Review]] = []
