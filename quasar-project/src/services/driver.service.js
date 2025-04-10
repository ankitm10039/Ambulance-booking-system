import { apiClient } from './api.service';

// Register as a driver
export function registerDriver(driverData) {
  return apiClient.post('/drivers/register', driverData);
}

// Get all drivers (admin only)
export function getAllDrivers() {
  return apiClient.get('/drivers');
}

// Get driver by ID (admin only)
export function getDriverById(driverId) {
  return apiClient.get(`/drivers/${driverId}`);
}

// Verify driver (admin only)
export function verifyDriver(driverId) {
  return apiClient.put(`/drivers/${driverId}/verify`);
}

// Suspend driver (admin only)
export function suspendDriver(driverId, reason) {
  return apiClient.put(`/drivers/${driverId}/suspend`, { reason });
}

// Get current driver profile
export function getDriverProfile() {
  return apiClient.get('/drivers/profile/me');
}

// Update driver availability
export function updateAvailability(isAvailable) {
  return apiClient.put('/drivers/availability', { isAvailable });
}

// Update driver location
export function updateLocation(coordinates) {
  return apiClient.put('/drivers/location', { coordinates });
}

// Get driver bookings
export function getDriverBookings() {
  return apiClient.get('/drivers/bookings/me');
}

// Get driver active bookings
export function getDriverActiveBookings() {
  return apiClient.get('/drivers/bookings/active');
}

// Get driver statistics
export function getDriverStats() {
  return apiClient.get('/drivers/stats/me');
}