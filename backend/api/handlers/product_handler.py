from fastapi import APIRouter, HTTPException
from controllers.products import product_controller
from schemas.product_schema import ProductMetadata
from utils.response import standard_response

router = APIRouter(prefix="/products", tags=["Products"])

@router.get("/{product_id}/metadata")
def get_product_metadata(product_id: str):
    metadata = product_controller.retrieve_product_metadata(product_id)
    if not metadata:
        raise HTTPException(status_code=404, detail="Product not found")
    return standard_response(
        code=200,
        message="Successfully retrieved product metadata",
        data=metadata
    )