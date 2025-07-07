from pydantic import BaseModel
from typing import List, Optional

class Review(BaseModel):
    user: str
    rating: int
    comment: str

class ProductMetadata(BaseModel):
    id: str
    name: str        # ganti dari title ke name
    material_info: Optional[str] = None  # nullable
    description: Optional[str] = None
    brand: Optional[str] = None
    gender: Optional[str] = None
    category: Optional[str] = None
    product_link: Optional[str] = None
    image: Optional[str] = None
    reviews: Optional[List[Review]] = []

# Standard response wrapper
class StandardResponseWithMetadata(BaseModel):
    code: int
    message: str
    data: ProductMetadata

class StandardResponseWithMetadataList(BaseModel):
    code: int
    message: str
    data: List[ProductMetadata]
