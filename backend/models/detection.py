from pydantic import BaseModel
from typing import List


class DetectionItem(BaseModel):
    scores: List[float]
    labels: List[str]
    bboxes: List[List[float]]


class DetectionInput(BaseModel):
    image_base64: str
    items: DetectionItem
