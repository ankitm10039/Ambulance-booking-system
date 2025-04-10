import { apiClient } from './api.service';

// User management
export function getUsers(params) {
  return apiClient.get('/admin/users', { params });
}

export function getUserById(userId) {
  return apiClient.get(`/admin/users/${userId}`);
}

export function createUser(userData) {
  return apiClient.post('/admin/users', userData);
}

export function updateUser(userId, userData) {
  return apiClient.put(`/admin/users/${userId}`, userData);
}

export function updateUserStatus(userId, status) {
  return apiClient.put(`/admin/users/${userId}/status`, { status });
}

export function resetUserPassword(userId) {
  return apiClient.put(`/admin/users/${userId}/reset-password`);
}

export function getUserBookings(userId) {
  return apiClient.get(`/admin/users/${userId}/bookings`);
}

// Driver management
export function getDrivers(params) {
  return apiClient.get('/admin/drivers', { params });
}

export function getDriverById(driverId) {
  return apiClient.get(`/admin/drivers/${driverId}`);
}

export function createDriver(driverData) {
  return apiClient.post('/admin/drivers', driverData);
}

export function updateDriver(driverId, driverData) {
  return apiClient.put(`/admin/drivers/${driverId}`, driverData);
}

export function verifyDriver(driverId) {
  return apiClient.put(`/admin/drivers/${driverId}/verify`);
}

export function updateDriverStatus(driverId, status) {
  return apiClient.put(`/admin/drivers/${driverId}/status`, { status });
}

export function getAvailableDrivers() {
  return apiClient.get('/admin/drivers/available');
}

// Vehicle management
export function getVehicles(params) {
  return apiClient.get('/admin/vehicles', { params });
}

export function getVehicleById(vehicleId) {
  return apiClient.get(`/admin/vehicles/${vehicleId}`);
}

export function createVehicle(vehicleData) {
  return apiClient.post('/admin/vehicles', vehicleData);
}

export function updateVehicle(vehicleId, vehicleData) {
  return apiClient.put(`/admin/vehicles/${vehicleId}`, vehicleData);
}

export function updateVehicleStatus(vehicleId, status) {
  return apiClient.put(`/admin/vehicles/${vehicleId}/status`, { status });
}

export function deleteVehicle(vehicleId) {
  return apiClient.delete(`/admin/vehicles/${vehicleId}`);
}

// Booking management
export function getBookings(params) {
  return apiClient.get('/admin/bookings', { params });
}

export function getBookingById(bookingId) {
  return apiClient.get(`/admin/bookings/${bookingId}`);
}

export function createBooking(bookingData) {
  return apiClient.post('/admin/bookings', bookingData);
}

export function assignDriver(bookingId, driverId) {
  return apiClient.put(`/admin/bookings/${bookingId}/assign-driver`, { driverId });
}

export function cancelBooking(bookingId, cancellationReason) {
  return apiClient.put(`/admin/bookings/${bookingId}/cancel`, { 
    cancellationReason,
    cancelledBy: 'admin'
  });
}

// Dashboard
export function getDashboardStats() {
  return apiClient.get('/admin/dashboard/stats');
}

// Settings
export function getGeneralSettings() {
  return apiClient.get('/admin/settings/general');
}

export function updateGeneralSettings(settings) {
  return apiClient.put('/admin/settings/general', settings);
}

export function getPricingSettings() {
  return apiClient.get('/admin/settings/pricing');
}

export function updatePricingSettings(settings) {
  return apiClient.put('/admin/settings/pricing', settings);
}

// Reports
export function generateReport(params) {
  return apiClient.get('/admin/reports/generate', { params });
}

// Profile
export function getAdminProfile() {
  return apiClient.get('/admin/profile');
}

export function updateAdminProfile(profileData) {
  return apiClient.put('/admin/profile', profileData);
}

export function changeAdminPassword(passwordData) {
  return apiClient.put('/admin/change-password', passwordData);
}