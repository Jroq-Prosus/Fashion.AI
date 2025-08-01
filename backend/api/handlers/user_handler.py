from fastapi import APIRouter, UploadFile, File, status
from models.user import User, UserProfile
from controllers.users import user_controller
from schemas.user_schema import ImageUploadResponse, StandardResponseWithImageUpload
from fastapi.responses import JSONResponse
from utils.response import standard_response

router = APIRouter(prefix="/users", tags=["Users"])


@router.post(
    "/{user_id}/upload-image",
    response_model=StandardResponseWithImageUpload,
    status_code=status.HTTP_201_CREATED
)
async def upload_image(user_id: str, file: UploadFile = File(...)):
    """
    Purpose: Upload a user image for a specific user.
    Input: Path parameter user_id (str), multipart file upload (image file)
    Output: JSON with upload status and file info, or error if upload fails.
    Example Response:
        {
            "code": 201,
            "message": "Image uploaded successfully",
            "data": {
                "filename": "user123.jpg",
                "user_id": "user123"
            }
        }
    """
    user_image = user_controller.handle_upload_image(user_id, file)
    response_data = ImageUploadResponse(
        filename=user_image.filename,
        user_id=user_image.user_id
    )
    return standard_response(
        data=response_data,
        message="Image uploaded successfully",
        code=status.HTTP_201_CREATED
    )

@router.get("/{user_id}/profile", response_model=UserProfile)
def get_user_profile(user_id: str):
    profile = user_controller.handle_get_user_profile(user_id)
    if not profile:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="User profile not found")
    return profile

@router.get("/{email}/user", response_model=User)
def get_user_by_email(email: str):
    user = user_controller.handle_get_user_by_email(email)
    if not user:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="User not found")
    return user