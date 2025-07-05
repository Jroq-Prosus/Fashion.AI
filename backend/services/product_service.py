from db.supabase_client import supabase
from schemas.product_schema import ProductMetadata

def get_product_metadata_from_supabase(product_id: str) -> ProductMetadata:
    result = (
        supabase
        .table("products")
        .select("title, material_info, description, reviews")
        .eq("id", product_id)
        .single()
        .execute()
    )

    if result.data:
        return ProductMetadata(**result.data)
    return None
