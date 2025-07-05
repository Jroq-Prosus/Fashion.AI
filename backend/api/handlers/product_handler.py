from fastapi import APIRouter, HTTPException
from controllers import product_controller
from schemas.product_schema import ProductMetadata

router = APIRouter(prefix="/products", tags=["Products"])

@router.get("/{product_id}/metadata", response_model=ProductMetadata)
def get_product_metadata(product_id: str):
    metadata = product_controller.retrieve_product_metadata(product_id)
    if not metadata:
        raise HTTPException(status_code=404, detail="Product not found")
    return metadata
