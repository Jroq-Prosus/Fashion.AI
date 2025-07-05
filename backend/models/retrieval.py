from pydantic import BaseModel
from typing import List

class RetrievalOutput(BaseModel):
    retrieved_image_paths: List[str]
    scores: List[float]
