from pydantic import BaseModel, EmailStr, constr
from typing import Optional
from datetime import datetime

class ImageUploadResponse(BaseModel):
    filename: str
    user_id: str

class StandardResponseWithImageUpload(BaseModel):
    code: int
    message: str
    data: ImageUploadResponse

class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str
    full_name: str
class UserResponse(BaseModel):
    username: str
    email: str
    full_name: str
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

class RegisterResponse(BaseModel):
    code: int
    message: str
    data: UserResponse