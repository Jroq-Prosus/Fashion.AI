from fastapi import UploadFile, HTTPException
from schemas.user_schema import RegisterRequest, RegisterResponse
from services import user_service
from models.user import UserImage
from utils.hash import hash_password


def handle_upload_image(user_id: str, file: UploadFile) -> UserImage:
    if file.content_type not in ["image/jpeg", "image/png", "image/jpg"]:
        raise HTTPException(status_code=400, detail="Invalid image type")

    contents = file.file.read()
    if len(contents) > user_service.MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="Image size exceeds 2 MB limit")

    filename = user_service.save_image_to_disk(file.filename, contents)
    return user_service.save_image_metadata(user_id, filename)


def register_user(payload: RegisterRequest) -> dict:
    if user_service.is_email_exists(payload.email):
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pw = hash_password(payload.password)
    user_data = {
        "username": payload.username,
        "email": payload.email,
        "password": hashed_pw,
        "full_name": payload.full_name
    }
    user = user_service.create_user(user_data)
    return user  # Just return dict here
