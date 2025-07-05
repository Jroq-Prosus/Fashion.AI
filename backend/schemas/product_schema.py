from pydantic import BaseModel
from typing import List, Optional

class ReviewSchema(BaseModel):
    user: str
    rating: int
    comment: str

class ProductMetadata(BaseModel):
    title: str
    material_info: str
    description: str
    reviews: Optional[List[ReviewSchema]] = []

    class Config:
        orm_mode = True  # Optional, tapi biarin untuk kompatibilitas
