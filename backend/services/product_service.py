from db.supabase_client import supabase
from schemas.product_schema import ProductMetadata
from typing import Optional


def get_product_metadata_from_supabase(product_id: str) -> Optional[ProductMetadata]:
    result = (
        supabase
        .table("products")
        .select(
            "id, name, material_info, description, brand, gender, "
            "category, product_link, image, reviews"
        )
        .eq("id", product_id)
        .single()
        .execute()
    )

    if result.data:
        return ProductMetadata(**result.data)
    return None

def get_all_products_from_supabase(page: int = 1, page_size: int = 6) -> list[ProductMetadata]:
    offset = (page - 1) * page_size
    result = (
        supabase
        .table("products")
        .select(
            "id, name, material_info, description, brand, gender, "
            "category, product_link, image, reviews"
        )
        .range(offset, offset + page_size - 1)
        .execute()
    )

    if result.data:
        return [ProductMetadata(**item) for item in result.data]
    return []
