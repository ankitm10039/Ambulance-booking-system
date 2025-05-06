import { apiClient } from './api.service';

// Get all users (admin only)
export function getAllUsers() {
  return apiClient.get('/users');
}

// Get user by ID (admin only)
export function getUserById(userId) {
  return apiClient.get(`/users/${userId}`);
}

// Update user (admin only)
export function updateUser(userId, userData) {
  return apiClient.put(`/users/${userId}`, userData);
}

// Delete user (admin only)
export function deleteUser(userId) {
  return apiClient.delete(`/users/${userId}`);
}

// Get user bookings
export function getUserBookings() {
  return apiClient.get('/users/bookings/me');
}

// Add emergency contact
export function addEmergencyContact(contactData) {
  return apiClient.post('/users/emergency-contacts', contactData);
}

// Update emergency contact
export function updateEmergencyContact(contactId, contactData) {
  return apiClient.put(`/users/emergency-contacts/${contactId}`, contactData);
}

// Delete emergency contact
export function deleteEmergencyContact(contactId) {
  return apiClient.delete(`/users/emergency-contacts/${contactId}`);
}

// Update medical information
export function updateMedicalInfo(medicalData) {
  return apiClient.put('/users/medical-info', medicalData);
}