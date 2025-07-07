from fastapi import APIRouter, HTTPException
from controllers.ai import ai_trend_geo_controller
from models.trend_geo import TrendGeoRequest, StoreLocation, TrendGeoResponse

router = APIRouter(prefix="/trend-geo", tags=["TrendGeo"])

@router.post("/stores", response_model=TrendGeoResponse)
async def get_trendy_store_locations_api(req: TrendGeoRequest):
    try:
        stores = await ai_trend_geo_controller.get_trendy_store_locations(
            req.product_metadata, req.user_style_description, req.user_location
        )
        return {"stores": stores}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 