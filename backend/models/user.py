from pydantic import BaseModel
from datetime import datetime

class UserImage(BaseModel):
    id: str
    user_id: str
    filename: str
    uploaded_at: datetime

class FashionAdvisorInput(BaseModel):
    image_base64: str
    user_query: str

class UserQuery(BaseModel):
    user_query: str
