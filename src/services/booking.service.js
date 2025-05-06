import { apiClient } from './api.service';

// Create a new booking
export function createBooking(bookingData) {
  return apiClient.post('/bookings', bookingData);
}

// Get all bookings (admin only)
export function getAllBookings() {
  return apiClient.get('/bookings');
}

// Get booking by ID
export function getBookingById(bookingId) {
  return apiClient.get(`/bookings/${bookingId}`);
}

// Update booking status
export function updateBookingStatus(bookingId, status, cancellationReason) {
  const data = { status };
  if (cancellationReason) {
    data.cancellationReason = cancellationReason;
  }
  return apiClient.put(`/bookings/${bookingId}/status`, data);
}

// Rate a completed booking
export function rateBooking(bookingId, rating, comment) {
  return apiClient.put(`/bookings/${bookingId}/rate`, { rating, comment });
}

// Get user's active bookings
export function getActiveBookings() {
  return apiClient.get('/bookings/active');
}

// Get booking statistics (admin only)
export function getBookingStats() {
  return apiClient.get('/bookings/stats');
}