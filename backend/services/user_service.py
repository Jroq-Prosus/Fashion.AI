import os
import uuid

from fastapi import HTTPException
from schemas.user_schema import RegisterResponse, UserResponse
from db.supabase_client import supabase
from models.user import UserImage

UPLOAD_DIR = "uploads"
MAX_FILE_SIZE = 2 * 1024 * 1024  # 2MB
USERS_TABLE = "users"

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

def is_email_exists(email: str) -> bool:
    """
    Check if an email already exists in the users table
    """
    result = (
        supabase
        .table(USERS_TABLE)
        .select("id")
        .eq("email", email)
        .execute()
    )
    return bool(result.data)


def create_user(user_data: dict) -> dict:
    """
    Insert a new user into the users table
    """
    user_id = str(uuid.uuid4())
    new_user = {
        "id": user_id,
        "email": user_data["email"],
        "username": user_data["username"],
        "password": user_data["password"],
        "full_name": user_data["full_name"]
    }
    response = (
        supabase
        .table(USERS_TABLE)
        .insert(new_user)
        .execute()
    )

    if response.data:
        user_record = response.data[0]
        user_record.pop("password", None)  # Remove password

        return {
            "username": user_record["username"],
            "email": user_record["email"],
            "full_name": user_record["full_name"],
            "created_at": user_record.get("created_at"),
            "updated_at": user_record.get("updated_at")
        }

    raise HTTPException(status_code=500, detail="Failed to create user")
