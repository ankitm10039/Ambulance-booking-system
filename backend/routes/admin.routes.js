const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const adminBookingController = require('../controllers/admin.booking.controller');
const backupController = require('../controllers/backup.controller');
const vehicleController = require('../controllers/vehicle.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

// Special route for backup download without authentication (for development only)
router.get('/backup/download/:id', backupController.downloadBackup);

// Protect all other routes
router.use(protect);
router.use(authorize('admin'));

// Dashboard
router.get('/dashboard/stats', adminController.getDashboardStats);

// User management
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserById);
router.post('/users', upload.single('profileImage'), adminController.createUser);
router.put('/users/:id', upload.single('profileImage'), adminController.updateUser);
router.put('/users/:id/status', adminController.updateUserStatus);
router.put('/users/:id/reset-password', adminController.resetUserPassword);
router.get('/users/:id/bookings', adminController.getUserBookings);

// Driver management
router.get('/drivers', adminController.getDrivers);
router.get('/drivers/available', adminBookingController.getAvailableDrivers); // Available drivers route should be before :id route
router.get('/drivers/:id', adminController.getDriverById);
router.post('/drivers', adminController.createDriver);
router.put('/drivers/:id', adminController.updateDriver);
router.put('/drivers/:id/verify', adminController.verifyDriver);
router.put('/drivers/:id/status', adminController.updateDriverStatus);

// Vehicle management
router.get('/vehicles', vehicleController.getVehicles);
router.get('/vehicles/:id', vehicleController.getVehicleById);
router.post('/vehicles', upload.single('image'), vehicleController.createVehicle);
router.put('/vehicles/:id', upload.single('image'), vehicleController.updateVehicle);
router.put('/vehicles/:id/status', vehicleController.updateVehicleStatus);
router.delete('/vehicles/:id', vehicleController.deleteVehicle);

// Booking management
router.get('/bookings', adminBookingController.getBookings);
router.get('/bookings/:id', adminBookingController.getBookingById);
router.post('/bookings', adminBookingController.createBooking);
router.put('/bookings/:id/assign-driver', adminBookingController.assignDriver);
router.put('/bookings/:id/cancel', adminBookingController.cancelBooking);

// Settings management
router.get('/settings/general', adminController.getGeneralSettings);
router.put('/settings/general', adminController.updateGeneralSettings);
router.get('/settings/pricing', adminController.getPricingSettings);
router.put('/settings/pricing', adminController.updatePricingSettings);
router.get('/settings/notifications', adminController.getNotificationSettings);
router.put('/settings/notifications', adminController.updateNotificationSettings);
router.get('/settings/appearance', adminController.getAppearanceSettings);
router.put('/settings/appearance', upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'favicon', maxCount: 1 }
]), adminController.updateAppearanceSettings);

// Reports and analytics
router.get('/reports/generate', adminController.generateReport);

// Profile management
router.get('/profile', adminController.getProfile);
router.put('/profile', upload.single('profileImage'), adminController.updateProfile);
router.put('/change-password', adminController.changePassword);

// Backup and restore
router.post('/backup/create', adminController.createBackup);
router.post('/backup/restore', upload.single('backupFile'), adminController.restoreBackup);
router.get('/backup/history', adminController.getBackupHistory);

module.exports = router;