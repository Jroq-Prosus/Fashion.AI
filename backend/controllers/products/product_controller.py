from services import product_service
from schemas.product_schema import ProductMetadata

def retrieve_product_metadata(product_id: str) -> ProductMetadata:
    return product_service.get_product_metadata_from_supabase(product_id)
