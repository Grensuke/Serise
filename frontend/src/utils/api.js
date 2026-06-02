import { getToken, logout } from './auth';

export function apiBase() {
  const configured = (import.meta.env.VITE_API_BASE || '').trim();
  if (configured) return configured.replace(/\/+$/, '');

  // Local development keeps the current default backend origin.
  if (import.meta.env.DEV) return 'http://localhost:4000';

  // Production fallback: same origin (works when backend is mounted on the same Vercel project/domain).
  if (typeof window !== 'undefined') return window.location.origin;

  return 'http://localhost:4000';
}

export function authHeaders(extra = {}) {
  const token = getToken();
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

export async function apiFetch(path, opts = {}) {
  const base = apiBase();
  const safePath = path.startsWith('/') ? path : `/${path}`;
  const url = path.startsWith('http') ? path : `${base}${safePath}`;
  return fetch(url, opts);
}

export async function apiJson(path, opts = {}) {
  let res;
  try {
    res = await apiFetch(path, opts);
  } catch (e) {
    const err = new Error(`Network error. Check API URL: ${apiBase()}`);
    err.cause = e;
    throw err;
  }
  let data = {};
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    if (res.status === 401 && getToken()) {
      logout();
    }
    const err = new Error(data.msg || data.message || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }

  return data;
}
