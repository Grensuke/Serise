const TOKEN_KEY = 'serise_token';

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function isAuthenticated() {
  return !!getToken();
}

export function notifyAuthChange() {
  window.dispatchEvent(new Event('auth-changed'));
}

export function login(token) {
  setToken(token);
  notifyAuthChange();
}

export function logout() {
  clearToken();
  notifyAuthChange();
}
