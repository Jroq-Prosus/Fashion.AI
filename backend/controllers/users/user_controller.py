from fastapi import UploadFile, HTTPException
from services import user_service
from models.user import User, UserImage, UserProfile

def handle_upload_image(user_id: str, file: UploadFile) -> UserImage:
    if file.content_type not in ["image/jpeg", "image/png", "image/jpg"]:
        raise HTTPException(status_code=400, detail="Invalid image type")

    contents = file.file.read()
    if len(contents) > user_service.MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="Image size exceeds 2 MB limit")

    filename = user_service.save_image_to_disk(file.filename, contents)
    return user_service.save_image_metadata(user_id, filename)

def handle_get_user_profile(user_id: str) -> UserProfile:
    return user_service.get_user_profile(user_id)

def handle_get_user_by_email(email: str) -> User:
    return user_service.get_user_by_email(email)