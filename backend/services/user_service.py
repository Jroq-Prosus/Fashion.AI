import os
import uuid
from db.supabase_client import supabase
from models.user import UserImage, UserProfile, User

UPLOAD_DIR = "uploads"
MAX_FILE_SIZE = 2 * 1024 * 1024  # 2MB

# Ensure upload dir exists
os.makedirs(UPLOAD_DIR, exist_ok=True)

def save_image_to_disk(original_filename: str, content: bytes) -> str:
    ext = os.path.splitext(original_filename)[1]
    unique_filename = f"{uuid.uuid4()}{ext}"
    path = os.path.join(UPLOAD_DIR, unique_filename)
    with open(path, "wb") as f:
        f.write(content)
    return unique_filename

def save_image_metadata(user_id: str, filename: str) -> UserImage:
    response = (
        supabase.table("user_images")
        .insert({
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "filename": filename
        })
        .execute()
    )
    if len(response.data) == 0:
        raise Exception("Failed to save image metadata")

    data = response.data[0]
    return UserImage(
        id=data["id"],
        user_id=data["user_id"],
        filename=data["filename"],
        uploaded_at=data["uploaded_at"]
    )

def get_user_by_email(email: str) -> User | None:
    response = supabase.table("users").select("*").eq("email", email).single().execute()
    data = response.data
    if not data:
        return None
    return User(**data)

def get_user_profile(user_id: str) -> UserProfile | None:
    response = supabase.table("user_profile").select("*").eq("user_id", user_id).single().execute()
    data = response.data
    if not data:
        return None
    return UserProfile(**data)