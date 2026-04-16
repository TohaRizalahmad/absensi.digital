import { clearToken, getTokenValue, saveToken } from '../services/api';

export function isLoggedIn() {
  return !!getTokenValue();
}

export function isSchoolLoggedIn() {
  return !!localStorage.getItem('school_token');
}

export function saveSchoolToken(token) {
  localStorage.setItem('school_token', token);
}

export function login(token, user) {
  saveToken(token);
  if (user) {
    localStorage.setItem('absensi_user', JSON.stringify(user));
  }
}

export function getUser() {
  const user = localStorage.getItem('absensi_user');
  return user ? JSON.parse(user) : null;
}

export function logout() {
  clearToken();
  localStorage.removeItem('absensi_user');
  localStorage.removeItem('school_token');
}
