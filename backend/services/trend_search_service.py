import os
import requests
from models.trend import WebSearchRequest, WebSearchResponse
from dotenv import load_dotenv
from typing import List, Dict
from uagents_core.envelope import Envelope
from uagents.communication import send_sync_message
import json
from uagents_core.identity import Identity

# Load environment variables
load_dotenv()

ASI_ONE_API_KEY = os.getenv("ASI_ONE_API_KEY")
TAVILY_AGENT_ADDRESS = 'test-agent://agent1qfwasaphvh2vdnchfzm3q7kpz6xerffgu3aflf6hx5ng543rq5e0swvxmcq'
# TAVILY_AGENT_ADDRESS = 'test-agent://agent1qg5w75lu5ylf9valw9yryrd787vfc4zcgxl870ka97wmkytlgd8n76y0re0'
ASI_ONE_URL = "https://api.asi1.ai/v1/chat/completions"


def get_current_trends(style: str) -> dict:
    """
    Use ASI-One chat completion to get current fashion trends and analyze the input style.
    Returns a dict with 'keywords' (list of str) and 'analysis' (str).
    """
    headers = {
        "Authorization": f"bearer {ASI_ONE_API_KEY}",
        "Content-Type": "application/json"
    }
    data = {
        "model": "asi1-mini",
        "messages": [
            {"role": "user", "content": f"What are the current fashion trends for {style}? List keywords and provide a one-line analysis only. Format your response as: Keywords: <comma-separated keywords>\nAnalysis: <one-line analysis>."}
        ],
        "temperature": 0.7,
        "stream": False,
        "max_tokens": 256
    }
    resp = requests.post(ASI_ONE_URL, json=data, headers=headers)
    resp.raise_for_status()
    result = resp.json()
    content = result["choices"][0]["message"]["content"]
    # Parse the content for keywords and analysis
    keywords = []
    analysis = ""
    for line in content.splitlines():
        if line.lower().startswith("keywords:"):
            keywords_str = line.split(":", 1)[1].strip()
            keywords = [k.strip() for k in keywords_str.split(",") if k.strip()]
        elif line.lower().startswith("analysis:"):
            analysis = line.split(":", 1)[1].strip()
    return {"keywords": keywords, "analysis": analysis}

class Response:
    text: str

async def search_similar_products(trend_keywords: str, location: str, style_description: str = "") -> WebSearchResponse:
    """
    Use Tavily agent to search for stores selling similar products near the user's location.
    Returns a list of dicts with store info.
    """
    # This is a placeholder for Tavily agent integration.
    # In production, use uagents or HTTP API as per your infra.
    # Here, we simulate a web search with requests (replace with agent call if needed).
    QUERY = f"stores near {location} selling products matching: {trend_keywords['analysis']}. User is looking for: {style_description}"
    print('QUERY', QUERY)
    # agent1q2pm7q68sxus5jtwge6x9x6eqlp2f2tqh54fqtc9y4e89fnlyeps5mah6wh
    # sender = Identity.from_seed('tavily', 0)
    # address = sender.address
    # print('sender', sender)
    # print('address', address)
    response = await send_sync_message(destination=TAVILY_AGENT_ADDRESS, message=WebSearchRequest(query=QUERY), timeout=60)
    if isinstance(response, Envelope):
        data = json.loads(response.decode_payload())
        print('search_similar_products response', data)
        return data
    print('search_similar_products response', response)
    return response


async def find_nearby_stores_with_metadata(product_metadata: dict, user_style_description: str, user_location: str) -> WebSearchResponse:
    """
    Main function: Given product metadata, user style description, and user location, returns a list of store dicts (name, address, etc) near the user selling similar, on-trend products.
    """
    # 1. Get current trends for the style
    style = product_metadata.get("title") or product_metadata.get("description") or "fashion"
    trend_analysis = get_current_trends(style)
    # 2. Search for similar products/stores using Tavily
    stores = await search_similar_products(trend_analysis, user_location, user_style_description)
    # 3. Return store dicts (with name, address, etc)
    return stores 