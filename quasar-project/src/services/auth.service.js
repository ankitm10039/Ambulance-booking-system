import { apiClient } from './api.service';

// Register a new user
export function register(userData) {
  return apiClient.post('/auth/register', userData);
}

// Login user
export function login(credentials) {
  return apiClient.post('/auth/login', credentials);
}

// Get current user profile
export function getProfile() {
  return apiClient.get('/auth/me');
}

// Update user profile
export function updateProfile(profileData) {
  return apiClient.put('/auth/update-profile', profileData);
}

// Change password
export function changePassword(passwordData) {
  return apiClient.put('/auth/change-password', passwordData);
}