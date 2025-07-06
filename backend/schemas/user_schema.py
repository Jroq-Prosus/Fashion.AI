from pydantic import BaseModel

class ImageUploadResponse(BaseModel):
    filename: str
    user_id: str

class StandardResponseWithImageUpload(BaseModel):
    code: int
    message: str
    data: ImageUploadResponse
