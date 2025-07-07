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