import os
from typing import Tuple, Optional
from uagents import Agent, Context
import asyncio
from models.geo import GeolocationRequest, GeolocationResponse
from uagents.communication import send_sync_message
from uagents_core.envelope import Envelope
import json

# Google Geo Agent address from knowledge base
GOOGLE_GEO_AGENT_ADDRESS = "test-agent://agent1q0d0xt2yax6zp5jk2qkmj6skjxz5fyt6e3lay2ehcrllcyytvjcqq53yj8c"

async def get_lat_lon_async(address: str, timeout: float = 60.0) -> Optional[Tuple[float, float]]:
    """
    Async: Given an address, return (latitude, longitude) using the Google Geo API agent.
    Returns None if not found or error.
    """
    print('get_lat_lon query', address)
    response = await send_sync_message(
        destination=GOOGLE_GEO_AGENT_ADDRESS,
        message=GeolocationRequest(address=address),
        timeout=timeout
    )

    data = None
    if isinstance(response, Envelope):
        data = json.loads(response.decode_payload())
    elif isinstance(response, str):
        try:
            data = json.loads(response)
        except Exception as e:
            print(f"Geo agent response string could not be parsed as JSON: {response}")
            return None
    elif isinstance(response, dict):
        data = response

    if isinstance(data, dict):
        lat = data.get("latitude")
        lon = data.get("longitude")
        if isinstance(lat, (float, int)) and isinstance(lon, (float, int)):
            return float(lat), float(lon)
        if "error" in data:
            print(f"Geo agent error: {data['error']}")
            return None
        print(f"Geo agent unexpected response dict: {data}")
        return None

    print(f"Geo agent response not understood: {response}")
    return None

# Synchronous wrapper for use in sync code (e.g., FastAPI endpoints)
def get_lat_lon(address: str, timeout: float = 10.0) -> Optional[Tuple[float, float]]:
    """
    Synchronous: Given an address, return (latitude, longitude) using the Google Geo API agent.
    Returns None if not found or error.
    """
    return asyncio.run(get_lat_lon_async(address, timeout=timeout)) 