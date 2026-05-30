import { getToken, logout } from './auth';

export function apiBase() {
  return import.meta.env.VITE_API_BASE || 'http://localhost:4000';
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
  const url = path.startsWith('http') ? path : `${base}${path}`;
  return fetch(url, opts);
}

export async function apiJson(path, opts = {}) {
  const res = await apiFetch(path, opts);
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
