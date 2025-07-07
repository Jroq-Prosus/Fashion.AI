from pydantic import BaseModel
from typing import List, Optional

class TrendGeoRequest(BaseModel):
    product_metadata: dict
    user_style_description: str
    user_location: str

class StoreLocation(BaseModel):
    name: Optional[str]
    address: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]

class TrendGeoResponse(BaseModel):
    stores: List[StoreLocation] 