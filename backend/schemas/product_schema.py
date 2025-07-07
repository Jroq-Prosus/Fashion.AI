from pydantic import BaseModel
from typing import List, Optional

class Review(BaseModel):
    user: str
    rating: int
    comment: str

class ProductMetadata(BaseModel):
    id: str
    product_id: str  # UUID tambahan
    name: str        # ganti dari title ke name
    material_info: Optional[str] = None  # nullable
    description: str
    brand: str
    gender: str
    category: str
    product_link: str
    image: str
    reviews: Optional[List[Review]] = []

# Standard response wrapper
class StandardResponseWithMetadata(BaseModel):
    code: int
    message: str
    data: ProductMetadata
