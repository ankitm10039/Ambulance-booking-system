const Booking = require('../models/booking.model');
const Driver = require('../models/driver.model');
const Vehicle = require('../models/vehicle.model');

// Create a new booking
exports.createBooking = async (req, res, next) => {
  try {
    const {
      bookingType,
      patientDetails,
      pickupLocation,
      dropLocation,
      scheduledTime,
      requirements,
      emergencyContact
    } = req.body;

    // Create booking
    const booking = await Booking.create({
      user: req.user.id,
      bookingType,
      patientDetails,
      pickupLocation,
      dropLocation,
      scheduledTime,
      requirements,
      emergencyContact,
      status: 'pending'
    });

    // If it's an emergency booking, find the nearest available driver
    if (bookingType === 'emergency') {
      // Find available drivers
      let availableDriversQuery = Driver.find({
        isAvailable: true,
        isVerified: true,
        status: 'active'
      });
      
      // If coordinates are provided, find the nearest driver
      if (pickupLocation.coordinates && 
          Array.isArray(pickupLocation.coordinates) && 
          pickupLocation.coordinates.length === 2 &&
          pickupLocation.coordinates[0] !== 0 && 
          pickupLocation.coordinates[1] !== 0) {
        
        availableDriversQuery = availableDriversQuery
          .where('currentLocation')
          .near({
            center: {
              type: 'Point',
              coordinates: pickupLocation.coordinates
            },
            maxDistance: 10000, // 10km in meters
            spherical: true
          });
      }
      
      // Get the drivers
      const nearestDrivers = await availableDriversQuery
        .limit(1)
        .populate('vehicle');

      if (nearestDrivers.length > 0) {
        const driver = nearestDrivers[0];

        // Update booking with driver and vehicle
        booking.driver = driver._id;
        booking.vehicle = driver.vehicle._id;
        booking.status = 'confirmed';
        await booking.save();

        // Update driver availability
        driver.isAvailable = false;
        await driver.save();
      }
    }

    // Populate driver and vehicle details
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

// Get all bookings (admin only)
exports.getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email phone')
      .populate({
        path: 'driver',
        populate: {
          path: 'user',
          select: 'name phone'
        }
      })
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
      .populate('vehicle', 'registrationNumber type model');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user is authorized to view this booking
    if (
      req.user.role !== 'admin' &&
      booking.user._id.toString() !== req.user.id &&
      (!booking.driver || booking.driver.user._id.toString() !== req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this booking'
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

// Update booking status
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide status'
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user is authorized to update this booking
    if (
      req.user.role !== 'admin' &&
      booking.user.toString() !== req.user.id &&
      (!booking.driver || booking.driver.toString() !== req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this booking'
      });
    }

    // Update booking status
    booking.status = status;

    // If status is 'in-progress', set startTime
    if (status === 'in-progress') {
      booking.startTime = new Date();
    }

    // If status is 'completed', set endTime and calculate actualTime
    if (status === 'completed') {
      booking.endTime = new Date();
      if (booking.startTime) {
        const durationMs = booking.endTime - booking.startTime;
        booking.actualTime = Math.round(durationMs / (1000 * 60)); // Convert to minutes
      }
    }

    // If status is 'cancelled', set cancellation details
    if (status === 'cancelled') {
      const { cancellationReason } = req.body;
      booking.cancellationReason = cancellationReason || 'No reason provided';

      // Set who cancelled the booking
      if (req.user.role === 'admin') {
        booking.cancelledBy = 'admin';
      } else if (booking.user.toString() === req.user.id) {
        booking.cancelledBy = 'user';
      } else {
        booking.cancelledBy = 'driver';
      }

      // If there's a driver assigned, make them available again
      if (booking.driver) {
        const driver = await Driver.findById(booking.driver);
        if (driver) {
          driver.isAvailable = true;
          await driver.save();
        }
      }
    }

    await booking.save();

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// Rate a completed booking
exports.rateBooking = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid rating between 1 and 5'
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if booking is completed
    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only rate completed bookings'
      });
    }

    // Check if user is authorized to rate this booking
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to rate this booking'
      });
    }

    // Check if booking is already rated
    if (booking.rating && booking.rating.value) {
      return res.status(400).json({
        success: false,
        message: 'Booking is already rated'
      });
    }

    // Add rating to booking
    booking.rating = {
      value: rating,
      comment: comment || '',
      createdAt: new Date()
    };

    await booking.save();

    // Update driver's average rating
    if (booking.driver) {
      const driver = await Driver.findById(booking.driver);
      
      if (driver) {
        // Get all completed and rated bookings for this driver
        const ratedBookings = await Booking.find({
          driver: driver._id,
          status: 'completed',
          'rating.value': { $exists: true }
        });

        // Calculate average rating
        const totalRating = ratedBookings.reduce((sum, booking) => sum + booking.rating.value, 0);
        const averageRating = totalRating / ratedBookings.length;

        // Update driver rating
        driver.rating = parseFloat(averageRating.toFixed(1));
        driver.totalTrips += 1;
        await driver.save();
      }
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// Get user's active bookings
exports.getActiveBookings = async (req, res, next) => {
  try {
    const activeBookings = await Booking.find({
      user: req.user.id,
      status: { $in: ['pending', 'confirmed', 'in-progress'] }
    })
      .populate({
        path: 'driver',
        populate: {
          path: 'user',
          select: 'name phone'
        }
      })
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

// Get booking statistics (admin only)
exports.getBookingStats = async (req, res, next) => {
  try {
    // Total bookings
    const totalBookings = await Booking.countDocuments();

    // Bookings by status
    const bookingsByStatus = await Booking.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Bookings by type
    const bookingsByType = await Booking.aggregate([
      {
        $group: {
          _id: '$bookingType',
          count: { $sum: 1 }
        }
      }
    ]);

    // Today's bookings
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayBookings = await Booking.countDocuments({
      createdAt: { $gte: today }
    });

    // This week's bookings
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const weeklyBookings = await Booking.countDocuments({
      createdAt: { $gte: oneWeekAgo }
    });

    // This month's bookings
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const monthlyBookings = await Booking.countDocuments({
      createdAt: { $gte: oneMonthAgo }
    });

    res.status(200).json({
      success: true,
      data: {
        totalBookings,
        bookingsByStatus,
        bookingsByType,
        todayBookings,
        weeklyBookings,
        monthlyBookings
      }
    });
  } catch (error) {
    next(error);
  }
};