from pydantic import BaseModel
from datetime import datetime

class UserImage(BaseModel):
    id: str
    user_id: str
    filename: str
    uploaded_at: datetime
