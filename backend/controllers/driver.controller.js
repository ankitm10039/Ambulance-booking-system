const Driver = require('../models/driver.model');
const Vehicle = require('../models/vehicle.model');
const User = require('../models/user.model');
const Booking = require('../models/booking.model');

// Register as a driver
exports.registerDriver = async (req, res, next) => {
  try {
    const { licenseNumber, licenseExpiry, vehicleDetails } = req.body;

    // Check if user is already a driver
    const existingDriver = await Driver.findOne({ user: req.user.id });
    if (existingDriver) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered as a driver'
      });
    }

    // Create vehicle first
    const vehicle = await Vehicle.create({
      ...vehicleDetails,
      status: 'active'
    });

    // Create driver profile
    const driver = await Driver.create({
      user: req.user.id,
      licenseNumber,
      licenseExpiry,
      vehicle: vehicle._id,
      isAvailable: false,
      isVerified: false,
      status: 'pending'
    });

    // Update user role to driver
    await User.findByIdAndUpdate(req.user.id, { role: 'driver' });

    res.status(201).json({
      success: true,
      data: driver
    });
  } catch (error) {
    next(error);
  }
};

// Get all drivers (admin only)
exports.getAllDrivers = async (req, res, next) => {
  try {
    const drivers = await Driver.find()
      .populate('user', 'name email phone')
      .populate('vehicle');

    res.status(200).json({
      success: true,
      count: drivers.length,
      data: drivers
    });
  } catch (error) {
    next(error);
  }
};

// Get driver by ID
exports.getDriverById = async (req, res, next) => {
  try {
    const driver = await Driver.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('vehicle');

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    res.status(200).json({
      success: true,
      data: driver
    });
  } catch (error) {
    next(error);
  }
};

// Get current driver profile
exports.getMyProfile = async (req, res, next) => {
  try {
    const driver = await Driver.findOne({ user: req.user.id })
      .populate('user', 'name email phone')
      .populate('vehicle');

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver profile not found'
      });
    }

    res.status(200).json({
      success: true,
      data: driver
    });
  } catch (error) {
    next(error);
  }
};

// Update driver availability
exports.updateAvailability = async (req, res, next) => {
  try {
    const { isAvailable } = req.body;

    if (isAvailable === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide availability status'
      });
    }

    const driver = await Driver.findOne({ user: req.user.id });

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver profile not found'
      });
    }

    // Check if driver is verified
    if (!driver.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Your account is not verified yet'
      });
    }

    // Check if driver is active
    if (driver.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: `Your account is ${driver.status}`
      });
    }

    driver.isAvailable = isAvailable;
    await driver.save();

    res.status(200).json({
      success: true,
      data: driver
    });
  } catch (error) {
    next(error);
  }
};

// Update driver location
exports.updateLocation = async (req, res, next) => {
  try {
    const { coordinates } = req.body;

    if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid coordinates [longitude, latitude]'
      });
    }

    const driver = await Driver.findOne({ user: req.user.id });

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver profile not found'
      });
    }

    driver.currentLocation.coordinates = coordinates;
    await driver.save();

    res.status(200).json({
      success: true,
      data: driver
    });
  } catch (error) {
    next(error);
  }
};

// Verify driver (admin only)
exports.verifyDriver = async (req, res, next) => {
  try {
    const driver = await Driver.findById(req.params.id);

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    driver.isVerified = true;
    driver.status = 'active';
    await driver.save();

    res.status(200).json({
      success: true,
      data: driver
    });
  } catch (error) {
    next(error);
  }
};

// Suspend driver (admin only)
exports.suspendDriver = async (req, res, next) => {
  try {
    const { reason } = req.body;

    const driver = await Driver.findById(req.params.id);

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    driver.status = 'suspended';
    driver.isAvailable = false;
    await driver.save();

    res.status(200).json({
      success: true,
      message: `Driver suspended. Reason: ${reason || 'Not provided'}`
    });
  } catch (error) {
    next(error);
  }
};

// Get driver's bookings
exports.getDriverBookings = async (req, res, next) => {
  try {
    const driver = await Driver.findOne({ user: req.user.id });

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver profile not found'
      });
    }

    const bookings = await Booking.find({ driver: driver._id })
      .populate('user', 'name phone')
      .populate('vehicle', 'registrationNumber type model');

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

// Get driver's active bookings
exports.getDriverActiveBookings = async (req, res, next) => {
  try {
    const driver = await Driver.findOne({ user: req.user.id });

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver profile not found'
      });
    }

    const activeBookings = await Booking.find({
      driver: driver._id,
      status: { $in: ['confirmed', 'in-progress'] }
    })
      .populate('user', 'name phone')
      .populate('vehicle', 'registrationNumber type model');

    res.status(200).json({
      success: true,
      count: activeBookings.length,
      data: activeBookings
    });
  } catch (error) {
    next(error);
  }
};

// Get driver statistics
exports.getDriverStats = async (req, res, next) => {
  try {
    const driver = await Driver.findOne({ user: req.user.id });

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver profile not found'
      });
    }

    // Total completed trips
    const completedTrips = await Booking.countDocuments({
      driver: driver._id,
      status: 'completed'
    });

    // Total earnings
    const earnings = await Booking.aggregate([
      {
        $match: {
          driver: driver._id,
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$fare.amount' }
        }
      }
    ]);

    // Today's trips and earnings
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayTrips = await Booking.countDocuments({
      driver: driver._id,
      status: 'completed',
      endTime: { $gte: today }
    });

    const todayEarnings = await Booking.aggregate([
      {
        $match: {
          driver: driver._id,
          status: 'completed',
          endTime: { $gte: today }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$fare.amount' }
        }
      }
    ]);

    // This week's trips and earnings
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const weeklyTrips = await Booking.countDocuments({
      driver: driver._id,
      status: 'completed',
      endTime: { $gte: oneWeekAgo }
    });

    const weeklyEarnings = await Booking.aggregate([
      {
        $match: {
          driver: driver._id,
          status: 'completed',
          endTime: { $gte: oneWeekAgo }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$fare.amount' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalTrips: driver.totalTrips,
        rating: driver.rating,
        completedTrips,
        totalEarnings: earnings.length > 0 ? earnings[0].total : 0,
        todayTrips,
        todayEarnings: todayEarnings.length > 0 ? todayEarnings[0].total : 0,
        weeklyTrips,
        weeklyEarnings: weeklyEarnings.length > 0 ? weeklyEarnings[0].total : 0
      }
    });
  } catch (error) {
    next(error);
  }
};