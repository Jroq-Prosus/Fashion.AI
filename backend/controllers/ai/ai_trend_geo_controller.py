from services import trend_search_service, geo_service
from typing import List, Dict
from models.trend import WebSearchResponse, WebSearchResult
import json
from uagents.communication import send_sync_message
from uagents_core.envelope import Envelope

STORE_EXTRACTOR_AGENT_ADDRESS = "test-agent://agent1qfdpqgj0q8qa6m7hzjzdhguu93gvwdpgg50vuskgmz2wu8p8p4ujww6zvpd"

async def get_trendy_store_locations(product_metadata: dict, user_style_description: str, user_location: str) -> List[Dict]:
    """
    Given product metadata, user style description, and user location, returns a list of dicts with store name, address, and lat/lon.
    """
    # 1. Find stores (with name/address) using trend_search_service
    stores = await trend_search_service.find_nearby_stores_with_metadata(
        product_metadata, user_style_description, user_location
    )
    if isinstance(stores, str):
        stores = json.loads(stores)
    print('stores', stores)
    print('stores query', stores.get('query'))
    print('stores results', stores.get('results'))

    # 2. Use the store extractor agent to get the final list of stores and location
    from models.trend import StoreExtractionRequest, StoreExtractionResponse  # define these if not present
    req = StoreExtractionRequest(results=stores.get('results', []))
    response = await send_sync_message(
        destination=STORE_EXTRACTOR_AGENT_ADDRESS,
        message=req,
        timeout=60
    )
    if isinstance(response, Envelope):
        data = json.loads(response.decode_payload())
    elif isinstance(response, str):
        data = json.loads(response)
    else:
        data = {}
    print('data', data)
    extracted_stores = data.get('stores', [])
    extracted_location = data.get('location', '')
    print('extracted_stores', extracted_stores)
    print('extracted_location', extracted_location)

    # 3. Build output list using extracted stores and location
    results = []
    for name in extracted_stores:
        latlon = None
        if extracted_location:
            latlon = await geo_service.get_lat_lon_async(f"{name}, {extracted_location}")
        # Validate latlon
        if (
            isinstance(latlon, (tuple, list)) and len(latlon) == 2 and
            all(isinstance(x, (float, int)) for x in latlon)
        ):
            latitude, longitude = float(latlon[0]), float(latlon[1])
        else:
            latitude, longitude = None, None
        results.append({
            "name": name,
            "address": extracted_location,
            "latitude": latitude,
            "longitude": longitude
        })
    print("results", results)
    return results 