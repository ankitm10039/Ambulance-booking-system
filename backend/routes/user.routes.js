const express = require('express');
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserBookings,
  addEmergencyContact,
  updateEmergencyContact,
  deleteEmergencyContact,
  updateMedicalInfo
} = require('../controllers/user.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// Admin routes
router.get('/', protect, authorize('admin'), getAllUsers);
router.get('/:id', protect, authorize('admin'), getUserById);
router.put('/:id', protect, authorize('admin'), updateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);

// User routes
router.get('/bookings/me', protect, getUserBookings);
router.post('/emergency-contacts', protect, addEmergencyContact);
router.put('/emergency-contacts/:contactId', protect, updateEmergencyContact);
router.delete('/emergency-contacts/:contactId', protect, deleteEmergencyContact);
router.put('/medical-info', protect, updateMedicalInfo);

module.exports = router;