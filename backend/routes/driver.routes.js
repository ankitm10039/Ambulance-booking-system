const express = require('express');
const {
  registerDriver,
  getAllDrivers,
  getDriverById,
  getMyProfile,
  updateAvailability,
  updateLocation,
  verifyDriver,
  suspendDriver,
  getDriverBookings,
  getDriverActiveBookings,
  getDriverStats
} = require('../controllers/driver.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// Driver registration
router.post('/register', protect, registerDriver);

// Admin routes
router.get('/', protect, authorize('admin'), getAllDrivers);
router.get('/:id', protect, authorize('admin'), getDriverById);
router.put('/:id/verify', protect, authorize('admin'), verifyDriver);
router.put('/:id/suspend', protect, authorize('admin'), suspendDriver);

// Driver routes
router.get('/profile/me', protect, authorize('driver'), getMyProfile);
router.put('/availability', protect, authorize('driver'), updateAvailability);
router.put('/location', protect, authorize('driver'), updateLocation);
router.get('/bookings/me', protect, authorize('driver'), getDriverBookings);
router.get('/bookings/active', protect, authorize('driver'), getDriverActiveBookings);
router.get('/stats/me', protect, authorize('driver'), getDriverStats);

module.exports = router;