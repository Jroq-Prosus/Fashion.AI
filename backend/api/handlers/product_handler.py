from fastapi import APIRouter, HTTPException
from controllers.products import product_controller
from schemas.product_schema import ProductMetadata, StandardResponseWithMetadata, StandardResponseWithMetadataList
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
    """
    Purpose: Retrieve metadata for a specific product by its ID.
    Input: Path parameter product_id (str)
    Output: JSON with product metadata if found, or 404 error if not found.
    Example Response:
        {
            "code": 200,
            "message": "Successfully retrieved product metadata",
            "data": { ...product metadata... }
        }
    """
    metadata = product_controller.retrieve_product_metadata(product_id)
    if not metadata:
        raise HTTPException(status_code=404, detail="Product not found")
    return standard_response(
        code=200,
        message="Successfully retrieved product metadata",
        data=metadata
    )

@router.get(
    "/all",
    response_model=StandardResponseWithMetadataList,
    status_code=200
)
def get_all_products(page: int = 1):
    """
    Purpose: Retrieve all products with pagination (6 per page).
    Input: Query parameter page (int, default 1)
    Output: JSON with a list of products for the requested page.
    Example Response:
        {
            "code": 200,
            "message": "Successfully retrieved products",
            "data": [ ...list of product metadata... ]
        }
    """
    products = product_controller.retrieve_all_products(page)
    print("products", products)
    return standard_response(
        code=200,
        message="Successfully retrieved products",
        data=products
    )
