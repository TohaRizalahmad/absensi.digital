import { clearToken, getTokenValue, saveToken } from '../services/api';

export function isLoggedIn() {
  return !!getTokenValue();
}

export function login(token) {
  saveToken(token);
}

export function logout() {
  clearToken();
}
