/// <reference types="vite/client" />
import type { Product } from '../models/product';
import type { VoiceToTextResponse } from '../models/chat';

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
    body: JSON.stringify({ image: { image_base64: image }, data }),
  });
}

export async function onlineSearchAgent(userQuery: string) {
  return fetcher('/ai/online-search-agent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_query: userQuery }),
  });
}

function getAuthHeaders() {
  const token = localStorage.getItem('auth_token');
  console.log('getAuthHeaders', token);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fashionAdvisorVisual(image_base64: string, user_query: string) {
  return fetcher('/ai/fashion-advisor-visual', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ image_base64, user_query }),
  });
}

export async function fetchTrendGeoStores(product_metadata: Product, user_style_description: string, user_location: string) {
  console.log('fetchTrendGeoStores', product_metadata, user_style_description, user_location);
  return fetcher('/trend-geo/stores', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      product_metadata,
      user_style_description,
      user_location,
    }),
  });
}

export async function voiceToText(file: File): Promise<VoiceToTextResponse> {
  console.log('voiceToText', file);
  const formData = new FormData();
  formData.append('file', file);
  return fetcher('/voice-to-text', {
    method: 'POST',
    body: formData,
  });
}

export async function fashionAdvisorTextOnly(userQuery: string) {
  return fetcher(`/ai/fashion-advisor-text-only?user_query=${encodeURIComponent(userQuery)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({}),
  });
}

export async function login(email: string, password: string) {
  return fetcher('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
}

export async function signup(email: string, password: string) {
  return fetcher('/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
} 