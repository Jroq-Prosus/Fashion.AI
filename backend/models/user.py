from pydantic import BaseModel
from datetime import datetime

class User(BaseModel):
    id: str
    email: str
    username: str
    full_name: str
    password: str
    created_at: datetime
    updated_at: datetime

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

class UserProfile(BaseModel):
    user_id: str
    description: str
    created_at: datetime
    updated_at: datetime