from uagents import Model
from typing import Dict, List

class WebSearchRequest(Model):
    query: str


class WebSearchResult(Model):
    title: str
    url: str
    content: str


class WebSearchResponse(Model):
    query: str
    results: List[WebSearchResult]

class StoreExtractionRequest(Model):
    results: List[Dict]  # Each dict should have 'title', 'content', 'url'

class StoreExtractionResponse(Model):
    stores: List[str]
    location: str