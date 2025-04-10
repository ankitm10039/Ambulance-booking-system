const Booking = require('../models/booking.model');
const Driver = require('../models/driver.model');
const Vehicle = require('../models/vehicle.model');
const User = require('../models/user.model');
const mongoose = require('mongoose');

// Create a booking (admin)
exports.createBooking = async (req, res, next) => {
  try {
    const {
      bookingType,
      patientDetails,
      pickupLocation,
      dropLocation,
      scheduledTime,
      requirements,
      emergencyContact,
      user: userId,
      driver: driverId
    } = req.body;

    // Validate user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Create booking object
    const bookingData = {
      user: userId,
      bookingType,
      patientDetails,
      pickupLocation,
      dropLocation,
      scheduledTime,
      requirements,
      emergencyContact,
      status: 'pending'
    };

    // If driver is provided, assign driver and vehicle
    if (driverId) {
      const driver = await Driver.findById(driverId)
        .populate('vehicle');

      if (!driver) {
        return res.status(404).json({
          success: false,
          message: 'Driver not found'
        });
      }

      // Check if driver is available
      if (!driver.isAvailable) {
        return res.status(400).json({
          success: false,
          message: 'Driver is not available'
        });
      }

      // Assign driver and vehicle
      bookingData.driver = driverId;
      bookingData.vehicle = driver.vehicle._id;
      bookingData.status = 'confirmed';
    }

    // Create booking
    const booking = await Booking.create(bookingData);

    // If driver was assigned, update driver availability
    if (driverId) {
      await Driver.findByIdAndUpdate(driverId, { isAvailable: false });
    }

    // Populate booking with related data
    await booking.populate({
      path: 'driver',
      populate: {
        path: 'user',
        select: 'name phone'
      }
    });
    await booking.populate('vehicle');
    await booking.populate('user', 'name email phone');

    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// Get all bookings with filtering and pagination
exports.getBookings = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sortBy = 'createdAt', 
      sortDesc = true,
      status,
      bookingType,
      fromDate,
      toDate,
      search
    } = req.query;

    // Build query
    const query = {};

    if (status) {
      query.status = status;
    }

    if (bookingType) {
      query.bookingType = bookingType;
    }

    // Date range filter
    if (fromDate || toDate) {
      query.createdAt = {};
      
      if (fromDate) {
        query.createdAt.$gte = new Date(fromDate);
      }
      
      if (toDate) {
        const endDate = new Date(toDate);
        endDate.setHours(23, 59, 59, 999);
        query.createdAt.$lte = endDate;
      }
    }

    // Search filter
    if (search) {
      // Find users matching search
      const users = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      
      const userIds = users.map(user => user._id);
      
      // Find drivers matching search
      const drivers = await Driver.find({
        user: { $in: userIds }
      }).select('_id');
      
      const driverIds = drivers.map(driver => driver._id);
      
      query.$or = [
        { user: { $in: userIds } },
        { driver: { $in: driverIds } },
        { 'patientDetails.name': { $regex: search, $options: 'i' } },
        { 'pickupLocation.address': { $regex: search, $options: 'i' } },
        { 'dropLocation.address': { $regex: search, $options: 'i' } }
      ];
    }

    // Count total documents
    const total = await Booking.countDocuments(query);

    // Get bookings with pagination and sorting
    const bookings = await Booking.find(query)
      .populate('user', 'name email phone')
      .populate({
        path: 'driver',
        populate: {
          path: 'user',
          select: 'name phone'
        }
      })
      .populate('vehicle')
      .sort({ [sortBy]: sortDesc === 'true' ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

// Get booking by ID
exports.getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate({
        path: 'driver',
        populate: {
          path: 'user',
          select: 'name phone'
        }
      })
      .populate('vehicle');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// Assign driver to booking
exports.assignDriver = async (req, res, next) => {
  try {
    const { driverId } = req.body;

    if (!driverId) {
      return res.status(400).json({
        success: false,
        message: 'Driver ID is required'
      });
    }

    // Find booking
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if booking can be assigned
    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot assign driver to a booking with status: ${booking.status}`
      });
    }

    // Find driver
    const driver = await Driver.findById(driverId)
      .populate('vehicle');

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    // Check if driver is available
    if (!driver.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Driver is not available'
      });
    }

    // Assign driver and vehicle to booking
    booking.driver = driverId;
    booking.vehicle = driver.vehicle._id;
    booking.status = 'confirmed';
    await booking.save();

    // Update driver availability
    driver.isAvailable = false;
    await driver.save();

    // Populate booking with related data
    await booking.populate({
      path: 'driver',
      populate: {
        path: 'user',
        select: 'name phone'
      }
    });
    await booking.populate('vehicle');
    await booking.populate('user', 'name email phone');

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// Cancel booking
exports.cancelBooking = async (req, res, next) => {
  try {
    const { cancellationReason } = req.body;

    // Find booking
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if booking can be cancelled
    if (!['pending', 'confirmed'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a booking with status: ${booking.status}`
      });
    }

    // Update booking status
    booking.status = 'cancelled';
    booking.cancellationReason = cancellationReason || 'Cancelled by admin';
    booking.cancelledBy = 'admin';
    await booking.save();

    // If driver was assigned, make them available again
    if (booking.driver) {
      await Driver.findByIdAndUpdate(booking.driver, { isAvailable: true });
    }

    // Populate booking with related data
    await booking.populate({
      path: 'driver',
      populate: {
        path: 'user',
        select: 'name phone'
      }
    });
    await booking.populate('vehicle');
    await booking.populate('user', 'name email phone');

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// Get available drivers
exports.getAvailableDrivers = async (req, res, next) => {
  try {
    const drivers = await Driver.find({
      isAvailable: true,
      isVerified: true,
      status: 'active'
    })
      .populate('user', 'name phone')
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