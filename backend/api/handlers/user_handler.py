from fastapi import APIRouter, UploadFile, File, status
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