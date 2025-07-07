import os
from uagents import Agent, Context, Model
from uagents.experimental.quota import QuotaProtocol, RateLimit
from uagents_core.models import ErrorMessage
from typing import List, Dict
import requests
import json

AGENT_SEED = os.getenv("STORE_EXTRACTOR_AGENT_SEED", "store-extractor-agent")
AGENT_NAME = os.getenv("STORE_EXTRACTOR_AGENT_NAME", "Store Extractor Agent")
PORT = 8010

ASI_ONE_API_KEY = os.getenv("ASI_ONE_API_KEY")
ASI_ONE_URL = "https://api.asi1.ai/v1/chat/completions"

agent = Agent(
    name=AGENT_NAME,
    seed=AGENT_SEED,
    port=PORT,
    endpoint=f"http://localhost:{PORT}/submit",
)

class StoreExtractionRequest(Model):
    results: List[Dict]  # Each dict should have 'title', 'content', 'url'

class StoreExtractionResponse(Model):
    stores: List[str]
    location: str

proto = QuotaProtocol(
    storage_reference=agent.storage,
    name="Store-Extraction-Protocol",
    version="0.1.0",
    default_rate_limit=RateLimit(window_size_minutes=60, max_requests=10),
)

def extract_stores_and_location_with_asi(results: List[Dict]) -> (List[str], str):
    # Concatenate all titles and contents
    combined_text = "\n".join(
        [f"Title: {r.get('title', '')}\nContent: {r.get('content', '')}" for r in results]
    )
    headers = {
        "Authorization": f"bearer {ASI_ONE_API_KEY}",
        "Content-Type": "application/json"
    }
    prompt = (
        "Given the following web search results (each with a title and content), extract the names of stores as a JSON list, "
        "and also extract the city or location as a string. "
        "Return a JSON object with two fields: 'stores' (list of store names) and 'location' (string). "
        "Only return the JSON object, nothing else.\n"
        f"Results: {combined_text}"
    )
    data = {
        "model": "asi1-mini",
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.3,
        "stream": False,
        "max_tokens": 256
    }
    resp = requests.post(ASI_ONE_URL, json=data, headers=headers)
    resp.raise_for_status()
    result = resp.json()
    content = result["choices"][0]["message"]["content"]
    # Try to parse the first JSON object in the response
    try:
        start = content.find('{')
        end = content.rfind('}')
        if start != -1 and end != -1:
            json_str = content[start:end+1]
            data = json.loads(json_str)
            stores = data.get('stores', [])
            location = data.get('location', '')
            if isinstance(stores, list) and isinstance(location, str):
                return [str(s) for s in stores], location
    except Exception:
        pass
    return [], ''

@proto.on_message(StoreExtractionRequest, replies={StoreExtractionResponse, ErrorMessage})
async def handle_request(ctx: Context, sender: str, msg: StoreExtractionRequest):
    ctx.logger.info(f"Received results for extraction")
    try:
        stores, location = extract_stores_and_location_with_asi(msg.results)
        ctx.logger.info(f"Extracted stores: {stores}, location: {location}")
        await ctx.send(sender, StoreExtractionResponse(stores=stores, location=location))
    except Exception as err:
        ctx.logger.error(err)
        await ctx.send(sender, ErrorMessage(error=str(err)))

@proto.on_query(model=StoreExtractionRequest, replies={StoreExtractionResponse, ErrorMessage})
async def handle_query(ctx: Context, sender: str, msg: StoreExtractionRequest):
    ctx.logger.info(f"Received results for extraction (query)")
    try:
        stores, location = extract_stores_and_location_with_asi(msg.results)
        ctx.logger.info(f"Extracted stores: {stores}, location: {location}")
        await ctx.send(sender, StoreExtractionResponse(stores=stores, location=location))
    except Exception as err:
        ctx.logger.error(err)
        await ctx.send(sender, ErrorMessage(error=str(err)))

agent.include(proto, publish_manifest=True)

if __name__ == "__main__":
    agent.run() 