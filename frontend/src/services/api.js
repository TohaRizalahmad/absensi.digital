const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

function getToken() {
  return localStorage.getItem('absensi_token');
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...(options.headers || {}),
    },
    ...options,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }
  return data;
}

export function saveToken(token) {
  localStorage.setItem('absensi_token', token);
}

export function clearToken() {
  localStorage.removeItem('absensi_token');
}

export function getTokenValue() {
  return getToken();
}
