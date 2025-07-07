/// <reference types="vite/client" />

const BASE_URL = import.meta.env.BACKEND_URL || 'http://localhost:8000'

export async function fetcher(path: string, options?: RequestInit) {
  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`;
  const res = await fetch(url, options);
  if (!res.ok) {
    throw new Error(`Fetch error: ${res.status} ${res.statusText}`);
  }
  return res.json();
} 

// Modular API functions for backend endpoints

export async function detectObjects(imageBase64: string) {
  console.log('imageBase64', imageBase64);
  return fetcher('/ai/object-detector', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image_base64: imageBase64 }),
  });
}

export async function imageRetrieval(payload: any, k: number = 5) {
  return fetcher(`/ai/image-retrieval?k=${k}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function generateFashionAdvisorResponse(image: string | null, data: any, userQuery: string) {
  return fetcher(`/ai/response-generation-fasion-advisor?user_query=${encodeURIComponent(userQuery)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image, data }),
  });
}

export async function onlineSearchAgent(userQuery: string) {
  return fetcher('/ai/online-search-agent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_query: userQuery }),
  });
} 