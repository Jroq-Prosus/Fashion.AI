from fastapi import APIRouter, HTTPException
from controllers.products import product_controller
from schemas.product_schema import ProductMetadata, StandardResponseWithMetadata
from utils.response import standard_response
from fastapi import File, UploadFile, status
import shutil
import os

router = APIRouter(prefix="/products", tags=["Products"])

@router.get(
    "/{product_id}/metadata",
    response_model=StandardResponseWithMetadata,
    status_code=200
)
def get_product_metadata(product_id: str):
    metadata = product_controller.retrieve_product_metadata(product_id)
    if not metadata:
        raise HTTPException(status_code=404, detail="Product not found")
    return standard_response(
        code=200,
        message="Successfully retrieved product metadata",
        data=metadata
    )