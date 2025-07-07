from pydantic import BaseModel
from typing import List, Optional


class MultimodalChatMessage(BaseModel):
    role: str = "user"
    text: str
    image_base64: Optional[str] = None
    timestamp: float


class MultimodalChatRequest(BaseModel):
    user_id: str
    message: MultimodalChatMessage


class MultimodalChatResponse(BaseModel):
    messages: List[MultimodalChatMessage]
