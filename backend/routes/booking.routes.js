const express = require('express');
const {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  rateBooking,
  getActiveBookings,
  getBookingStats
} = require('../controllers/booking.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// User routes
router.post('/', protect, createBooking);
router.get('/active', protect, getActiveBookings);
router.put('/:id/rate', protect, rateBooking);

// Admin routes
router.get('/', protect, authorize('admin'), getAllBookings);
router.get('/stats', protect, authorize('admin'), getBookingStats);

// Common routes (accessible by users, drivers, and admins)
router.get('/:id', protect, getBookingById);
router.put('/:id/status', protect, updateBookingStatus);

module.exports = router;