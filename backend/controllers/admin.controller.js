const User = require('../models/user.model');
const Driver = require('../models/driver.model');
const Vehicle = require('../models/vehicle.model');
const Booking = require('../models/booking.model');
const Setting = require('../models/setting.model');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Dashboard statistics
exports.getDashboardStats = async (req, res, next) => {
  try {
    // Get total users
    const totalUsers = await User.countDocuments({ role: 'user' });
    
    // Get new users in the last 7 days
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const newUsers = await User.countDocuments({ 
      role: 'user',
      createdAt: { $gte: lastWeek }
    });
    
    // Get active drivers
    const activeDrivers = await Driver.countDocuments({ 
      status: 'active',
      isAvailable: true
    });
    
    // Get total drivers
    const totalDrivers = await Driver.countDocuments();
    
    // Get today's bookings
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayBookings = await Booking.countDocuments({
      createdAt: { $gte: today }
    });
    
    // Get pending bookings
    const pendingBookings = await Booking.countDocuments({
      status: 'pending'
    });
    
    // Get revenue for current month
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const revenue = await Booking.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: firstDayOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$fare.amount' }
        }
      }
    ]);
    
    // Get active bookings
    const activeBookings = await Booking.find({
      status: { $in: ['pending', 'confirmed', 'in-progress'] }
    })
    .populate('user', 'name')
    .populate({
      path: 'driver',
      populate: {
        path: 'user',
        select: 'name'
      }
    })
    .sort({ createdAt: -1 })
    .limit(5);
    
    // Get recent notifications
    const recentNotifications = [
      {
        id: 1,
        message: 'New driver registration request',
        time: '5 minutes ago',
        icon: 'person_add',
        color: 'primary'
      },
      {
        id: 2,
        message: 'Emergency booking #BK001',
        time: '15 minutes ago',
        icon: 'warning',
        color: 'negative'
      },
      {
        id: 3,
        message: 'Payment received for booking #BK002',
        time: '1 hour ago',
        icon: 'payment',
        color: 'positive'
      }
    ];
    
    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          newUsers,
          activeDrivers,
          totalDrivers,
          todayBookings,
          pendingBookings,
          revenue: revenue.length > 0 ? revenue[0].total : 0
        },
        activeBookings,
        notifications: recentNotifications
      }
    });
  } catch (error) {
    next(error);
  }
};

// User management
exports.getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortDesc = true, role, status, search } = req.query;
    
    // Build query
    const query = {};
    
    if (role) {
      query.role = role;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Count total documents
    const total = await User.countDocuments(query);
    
    // Get users with pagination and sorting
    const users = await User.find(query)
      .sort({ [sortBy]: sortDesc === 'true' ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      data: users
    });
  } catch (error) {
    next(error);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, phone, role, status, isEmailVerified, address } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }
    
    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: role || 'user',
      status: status || 'active',
      isEmailVerified: isEmailVerified || false,
      address
    });
    
    // Handle profile image upload
    if (req.file) {
      user.profileImage = `/uploads/profiles/${req.file.filename}`;
      await user.save();
    }
    
    res.status(201).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { name, email, phone, role, status, isEmailVerified, address } = req.body;
    
    // Find user
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update user fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (role) user.role = role;
    if (status) user.status = status;
    if (isEmailVerified !== undefined) user.isEmailVerified = isEmailVerified;
    if (address) user.address = address;
    
    // Handle profile image upload
    if (req.file) {
      // Delete old profile image if exists
      if (user.profileImage) {
        const oldImagePath = path.join(__dirname, '..', 'public', user.profileImage);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      
      user.profileImage = `/uploads/profiles/${req.file.filename}`;
    }
    
    await user.save();
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

exports.updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

exports.resetUserPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { password: hashedPassword },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    next(error);
  }
};

exports.getUserBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.params.id })
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.status(200).json({
      success: true,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

// Driver management
exports.getDrivers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortDesc = true, status, isVerified, isAvailable, search } = req.query;
    
    // Build query
    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (isVerified !== undefined) {
      query.isVerified = isVerified === 'true';
    }
    
    if (isAvailable !== undefined) {
      query.isAvailable = isAvailable === 'true';
    }
    
    if (search) {
      // We need to find drivers where the user's name or email matches the search
      const users = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      
      const userIds = users.map(user => user._id);
      
      query.$or = [
        { user: { $in: userIds } },
        { licenseNumber: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Count total documents
    const total = await Driver.countDocuments(query);
    
    // Get drivers with pagination and sorting
    const drivers = await Driver.find(query)
      .populate('user', 'name email phone profileImage')
      .populate('vehicle')
      .sort({ [sortBy]: sortDesc === 'true' ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      data: drivers
    });
  } catch (error) {
    next(error);
  }
};

exports.getDriverById = async (req, res, next) => {
  try {
    const driver = await Driver.findById(req.params.id)
      .populate('user', 'name email phone profileImage')
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

exports.createDriver = async (req, res, next) => {
  let createdVehicle = null;
  let createdUser = null;
  
  try {
    const { user: userData, licenseNumber, licenseExpiry, status, isVerified, isAvailable, vehicle: vehicleData } = req.body;
    
    // Create or find user
    let user;
    
    if (userData._id) {
      // Find existing user
      user = await User.findById(userData._id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // Update user role to driver if not already
      if (user.role !== 'driver') {
        user.role = 'driver';
        await user.save();
      }
    } else {
      // Check if user with this email already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }
      
      // Create new user
      user = await User.create({
        name: userData.name,
        email: userData.email,
        password: userData.password || 'password123', // Default password
        phone: userData.phone,
        role: 'driver'
      });
      
      createdUser = user; // Track the created user for cleanup in case of error
    }
    
    // Create vehicle
    const vehicle = await Vehicle.create({
      make: vehicleData.make,
      model: vehicleData.model,
      manufacturer: vehicleData.manufacturer,
      registrationNumber: vehicleData.registrationNumber,
      type: vehicleData.type,
      year: vehicleData.year,
      insuranceExpiry: vehicleData.insuranceExpiry,
      capacity: vehicleData.capacity || 2,
      status: 'active'
    });
    
    createdVehicle = vehicle; // Track the created vehicle for cleanup in case of error
    
    // Create driver
    const driver = await Driver.create({
      user: user._id,
      licenseNumber,
      licenseExpiry,
      vehicle: vehicle._id,
      status: status || 'pending',
      isVerified: isVerified || false,
      isAvailable: isAvailable || false
    });
    
    // Populate driver with user and vehicle
    const populatedDriver = await Driver.findById(driver._id)
      .populate('user', 'name email phone profileImage')
      .populate('vehicle');
    
    res.status(201).json({
      success: true,
      data: populatedDriver
    });
  } catch (error) {
    // Manual cleanup in case of error
    try {
      // If we created a vehicle but failed to create a driver, delete the vehicle
      if (createdVehicle) {
        await Vehicle.findByIdAndDelete(createdVehicle._id);
      }
      
      // If we created a user but failed to create a driver or vehicle, delete the user
      if (createdUser) {
        await User.findByIdAndDelete(createdUser._id);
      }
    } catch (cleanupError) {
      console.error('Error during cleanup:', cleanupError);
    }
    
    console.error('Error creating driver:', error);
    next(error);
  }
};

exports.updateDriver = async (req, res, next) => {
  try {
    const { user: userData, licenseNumber, licenseExpiry, status, isVerified, isAvailable, vehicle: vehicleData } = req.body;
    
    // Find driver
    const driver = await Driver.findById(req.params.id);
    
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }
    
    // Update driver fields
    if (licenseNumber) driver.licenseNumber = licenseNumber;
    if (licenseExpiry) driver.licenseExpiry = licenseExpiry;
    if (status) driver.status = status;
    if (isVerified !== undefined) driver.isVerified = isVerified;
    if (isAvailable !== undefined) driver.isAvailable = isAvailable;
    
    await driver.save();
    
    // Update user if provided
    if (userData) {
      const user = await User.findById(driver.user);
      
      if (user) {
        if (userData.name) user.name = userData.name;
        if (userData.email) user.email = userData.email;
        if (userData.phone) user.phone = userData.phone;
        
        await user.save();
      }
    }
    
    // Update vehicle if provided
    if (vehicleData) {
      const vehicle = await Vehicle.findById(driver.vehicle);
      
      if (vehicle) {
        if (vehicleData.make) vehicle.make = vehicleData.make;
        if (vehicleData.model) vehicle.model = vehicleData.model;
        if (vehicleData.manufacturer) vehicle.manufacturer = vehicleData.manufacturer;
        if (vehicleData.registrationNumber) vehicle.registrationNumber = vehicleData.registrationNumber;
        if (vehicleData.type) vehicle.type = vehicleData.type;
        if (vehicleData.year) vehicle.year = vehicleData.year;
        if (vehicleData.insuranceExpiry) vehicle.insuranceExpiry = vehicleData.insuranceExpiry;
        if (vehicleData.capacity) vehicle.capacity = vehicleData.capacity;
        
        await vehicle.save();
      }
    }
    
    // Get updated driver with populated fields
    const updatedDriver = await Driver.findById(req.params.id)
      .populate('user', 'name email phone profileImage')
      .populate('vehicle');
    
    res.status(200).json({
      success: true,
      data: updatedDriver
    });
  } catch (error) {
    next(error);
  }
};

exports.verifyDriver = async (req, res, next) => {
  try {
    const { isVerified } = req.body;
    
    if (isVerified === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Verification status is required'
      });
    }
    
    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      { isVerified },
      { new: true }
    )
    .populate('user', 'name email phone profileImage')
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

exports.updateDriverStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }
    
    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
    .populate('user', 'name email phone profileImage')
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

// Vehicle management
exports.getVehicles = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortDesc = true, type, status, assigned, search } = req.query;
    
    // Build query
    const query = {};
    
    if (type) {
      query.type = type;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { make: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { registrationNumber: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Count total documents
    const total = await Vehicle.countDocuments(query);
    
    // Get vehicles with pagination and sorting
    let vehicles = await Vehicle.find(query)
      .sort({ [sortBy]: sortDesc === 'true' ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    // Find which vehicles are assigned to drivers
    const drivers = await Driver.find({}).select('vehicle');
    const assignedVehicleIds = drivers.map(driver => driver.vehicle.toString());
    
    // Add driver information to vehicles
    vehicles = await Promise.all(vehicles.map(async (vehicle) => {
      const isAssigned = assignedVehicleIds.includes(vehicle._id.toString());
      
      // If assigned and we need to filter by assignment status
      if (assigned !== undefined) {
        const assignedBool = assigned === 'true';
        if (assignedBool !== isAssigned) {
          return null; // Skip this vehicle
        }
      }
      
      // If assigned, get driver information
      let driver = null;
      if (isAssigned) {
        driver = await Driver.findOne({ vehicle: vehicle._id })
          .populate('user', 'name phone');
      }
      
      return {
        ...vehicle.toObject(),
        driver
      };
    }));
    
    // Filter out null values (vehicles that didn't match assignment filter)
    vehicles = vehicles.filter(vehicle => vehicle !== null);
    
    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      data: vehicles
    });
  } catch (error) {
    next(error);
  }
};

exports.getVehicleById = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }
    
    // Check if vehicle is assigned to a driver
    const driver = await Driver.findOne({ vehicle: vehicle._id })
      .populate('user', 'name phone');
    
    res.status(200).json({
      success: true,
      data: {
        ...vehicle.toObject(),
        driver
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.createVehicle = async (req, res, next) => {
  try {
    const { make, model, registrationNumber, type, year, capacity, status, features } = req.body;
    
    // Create vehicle
    const vehicle = await Vehicle.create({
      make,
      model,
      registrationNumber,
      type,
      year,
      capacity,
      status: status || 'active',
      features: features ? JSON.parse(features) : [],
      lastMaintenance: req.body.lastMaintenance
    });
    
    // Handle vehicle image upload
    if (req.file) {
      vehicle.image = `/uploads/vehicles/${req.file.filename}`;
      await vehicle.save();
    }
    
    res.status(201).json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    next(error);
  }
};

exports.updateVehicle = async (req, res, next) => {
  try {
    const { make, model, registrationNumber, type, year, capacity, status, features } = req.body;
    
    // Find vehicle
    const vehicle = await Vehicle.findById(req.params.id);
    
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }
    
    // Update vehicle fields
    if (make) vehicle.make = make;
    if (model) vehicle.model = model;
    if (registrationNumber) vehicle.registrationNumber = registrationNumber;
    if (type) vehicle.type = type;
    if (year) vehicle.year = year;
    if (capacity) vehicle.capacity = capacity;
    if (status) vehicle.status = status;
    if (features) vehicle.features = JSON.parse(features);
    if (req.body.lastMaintenance) vehicle.lastMaintenance = req.body.lastMaintenance;
    
    // Handle vehicle image upload
    if (req.file) {
      // Delete old image if exists
      if (vehicle.image) {
        const oldImagePath = path.join(__dirname, '..', 'public', vehicle.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      
      vehicle.image = `/uploads/vehicles/${req.file.filename}`;
    }
    
    await vehicle.save();
    
    res.status(200).json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    next(error);
  }
};

exports.updateVehicleStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }
    
    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteVehicle = async (req, res, next) => {
  try {
    // Check if vehicle is assigned to any driver
    const driver = await Driver.findOne({ vehicle: req.params.id });
    
    if (driver) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete vehicle that is assigned to a driver'
      });
    }
    
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }
    
    // Delete vehicle image if exists
    if (vehicle.image) {
      const imagePath = path.join(__dirname, '..', 'public', vehicle.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// Booking management
exports.getBookings = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortDesc = true, status, bookingType, fromDate, toDate, search } = req.query;
    
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
    
    if (search) {
      // Search in patient name, pickup location, or drop location
      query.$or = [
        { 'patientDetails.name': { $regex: search, $options: 'i' } },
        { 'pickupLocation.address': { $regex: search, $options: 'i' } },
        { 'dropLocation.address': { $regex: search, $options: 'i' } }
      ];
      
      // Also search for users by name or phone
      const users = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      
      if (users.length > 0) {
        const userIds = users.map(user => user._id);
        query.$or.push({ user: { $in: userIds } });
      }
      
      // Search for drivers by name
      const drivers = await Driver.find({})
        .populate({
          path: 'user',
          match: { name: { $regex: search, $options: 'i' } },
          select: '_id'
        })
        .select('_id');
      
      const driverIds = drivers
        .filter(driver => driver.user) // Filter out drivers whose users didn't match
        .map(driver => driver._id);
      
      if (driverIds.length > 0) {
        query.$or.push({ driver: { $in: driverIds } });
      }
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
    
    // Find driver
    const driver = await Driver.findById(driverId);
    
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
    
    // Check if driver is verified and active
    if (!driver.isVerified || driver.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Driver is not verified or active'
      });
    }
    
    // Update booking with driver and vehicle
    booking.driver = driver._id;
    booking.vehicle = driver.vehicle;
    booking.status = 'confirmed';
    await booking.save();
    
    // Update driver availability
    driver.isAvailable = false;
    await driver.save();
    
    // Get updated booking with populated fields
    const updatedBooking = await Booking.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate({
        path: 'driver',
        populate: {
          path: 'user',
          select: 'name phone'
        }
      })
      .populate('vehicle');
    
    res.status(200).json({
      success: true,
      data: updatedBooking
    });
  } catch (error) {
    next(error);
  }
};

exports.cancelBooking = async (req, res, next) => {
  try {
    const { cancellationReason, cancelledBy } = req.body;
    
    if (!cancellationReason) {
      return res.status(400).json({
        success: false,
        message: 'Cancellation reason is required'
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
    
    // Check if booking can be cancelled
    if (!['pending', 'confirmed'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `Booking cannot be cancelled in ${booking.status} status`
      });
    }
    
    // Update booking status
    booking.status = 'cancelled';
    booking.cancellationReason = cancellationReason;
    booking.cancelledBy = cancelledBy || 'admin';
    await booking.save();
    
    // If driver was assigned, make them available again
    if (booking.driver) {
      const driver = await Driver.findById(booking.driver);
      
      if (driver) {
        driver.isAvailable = true;
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

// Settings management
exports.getGeneralSettings = async (req, res, next) => {
  try {
    let settings = await Setting.findOne({ type: 'general' });
    
    if (!settings) {
      // Create default settings if not exists
      settings = await Setting.create({
        type: 'general',
        data: {
          appName: 'Ambulance Booking System',
          contactEmail: 'contact@ambulancebooking.com',
          contactPhone: '+91 1234567890',
          emergencyNumber: '108',
          address: '123 Healthcare Street, Medical District, City - 110001',
          timezone: 'Asia/Kolkata',
          dateFormat: 'DD/MM/YYYY',
          enableRegistration: true,
          requireEmailVerification: true
        }
      });
    }
    
    res.status(200).json({
      success: true,
      data: settings.data
    });
  } catch (error) {
    next(error);
  }
};

exports.updateGeneralSettings = async (req, res, next) => {
  try {
    const settings = await Setting.findOneAndUpdate(
      { type: 'general' },
      { data: req.body },
      { new: true, upsert: true }
    );
    
    res.status(200).json({
      success: true,
      data: settings.data
    });
  } catch (error) {
    next(error);
  }
};

exports.getPricingSettings = async (req, res, next) => {
  try {
    let settings = await Setting.findOne({ type: 'pricing' });
    
    if (!settings) {
      // Create default settings if not exists
      settings = await Setting.create({
        type: 'pricing',
        data: {
          basePrice: 200,
          pricePerKm: 15,
          emergencySurcharge: 100,
          nightSurcharge: 50,
          waitingChargePerMinute: 2,
          cancellationFee: 100,
          currency: 'INR',
          enableDynamicPricing: false,
          additionalServices: [
            { name: 'Oxygen Support', price: 150 },
            { name: 'Medical Staff', price: 300 },
            { name: 'Advanced Life Support', price: 500 }
          ]
        }
      });
    }
    
    res.status(200).json({
      success: true,
      data: settings.data
    });
  } catch (error) {
    next(error);
  }
};

exports.updatePricingSettings = async (req, res, next) => {
  try {
    const settings = await Setting.findOneAndUpdate(
      { type: 'pricing' },
      { data: req.body },
      { new: true, upsert: true }
    );
    
    res.status(200).json({
      success: true,
      data: settings.data
    });
  } catch (error) {
    next(error);
  }
};

exports.getNotificationSettings = async (req, res, next) => {
  try {
    let settings = await Setting.findOne({ type: 'notifications' });
    
    if (!settings) {
      // Create default settings if not exists
      settings = await Setting.create({
        type: 'notifications',
        data: {
          enableEmailNotifications: true,
          enableSmsNotifications: true,
          enablePushNotifications: false,
          adminAlertNewBooking: true,
          emailTemplates: {
            bookingConfirmation: {
              subject: 'Your Ambulance Booking Confirmation - {bookingId}',
              body: 'Dear {userName},\n\nYour ambulance booking has been confirmed. Your booking ID is {bookingId}.\n\nPickup Location: {pickupLocation}\nDrop Location: {dropLocation}\nScheduled Time: {scheduledTime}\nEstimated Fare: {fare}\n\nWe will notify you once a driver is assigned to your booking.\n\nThank you for using our service.\n\nRegards,\nAmbulance Booking Team'
            },
            driverAssignment: {
              subject: 'Driver Assigned for Your Ambulance Booking - {bookingId}',
              body: 'Dear {userName},\n\nA driver has been assigned to your ambulance booking {bookingId}.\n\nDriver Name: {driverName}\nDriver Phone: {driverPhone}\nVehicle Details: {vehicleDetails}\nEstimated Arrival: {estimatedArrival}\n\nYou can track your ambulance in real-time through our app.\n\nRegards,\nAmbulance Booking Team'
            },
            bookingCancellation: {
              subject: 'Your Ambulance Booking Has Been Cancelled - {bookingId}',
              body: 'Dear {userName},\n\nYour ambulance booking {bookingId} has been cancelled.\n\nCancellation Reason: {cancellationReason}\nRefund Amount: {refundAmount}\n\nIf you did not request this cancellation, please contact our support team immediately.\n\nRegards,\nAmbulance Booking Team'
            }
          },
          smsTemplates: {
            bookingConfirmation: 'Your ambulance booking is confirmed. Booking ID: {bookingId}. Pickup: {pickupLocation}. Time: {scheduledTime}.',
            driverAssignment: 'Driver {driverName} ({driverPhone}) has been assigned to your booking. Vehicle: {vehicleNumber}. ETA: {estimatedArrival}.'
          }
        }
      });
    }
    
    res.status(200).json({
      success: true,
      data: settings.data
    });
  } catch (error) {
    next(error);
  }
};

exports.updateNotificationSettings = async (req, res, next) => {
  try {
    const settings = await Setting.findOneAndUpdate(
      { type: 'notifications' },
      { data: req.body },
      { new: true, upsert: true }
    );
    
    res.status(200).json({
      success: true,
      data: settings.data
    });
  } catch (error) {
    next(error);
  }
};

exports.getAppearanceSettings = async (req, res, next) => {
  try {
    let settings = await Setting.findOne({ type: 'appearance' });
    
    if (!settings) {
      // Create default settings if not exists
      settings = await Setting.create({
        type: 'appearance',
        data: {
          primaryColor: '#1976D2',
          secondaryColor: '#26A69A',
          accentColor: '#9C27B0',
          theme: 'light',
          enableDarkMode: true,
          showLogo: true,
          logoUrl: '',
          faviconUrl: ''
        }
      });
    }
    
    res.status(200).json({
      success: true,
      data: settings.data
    });
  } catch (error) {
    next(error);
  }
};

exports.updateAppearanceSettings = async (req, res, next) => {
  try {
    // Get current settings
    let settings = await Setting.findOne({ type: 'appearance' });
    
    if (!settings) {
      settings = {
        type: 'appearance',
        data: {
          primaryColor: '#1976D2',
          secondaryColor: '#26A69A',
          accentColor: '#9C27B0',
          theme: 'light',
          enableDarkMode: true,
          showLogo: true,
          logoUrl: '',
          faviconUrl: ''
        }
      };
    }
    
    // Update settings with request body
    const updatedData = { ...settings.data, ...req.body };
    
    // Handle logo upload
    if (req.files && req.files.logo) {
      // Delete old logo if exists
      if (settings.data.logoUrl) {
        const oldLogoPath = path.join(__dirname, '..', 'public', settings.data.logoUrl);
        if (fs.existsSync(oldLogoPath)) {
          fs.unlinkSync(oldLogoPath);
        }
      }
      
      updatedData.logoUrl = `/uploads/settings/${req.files.logo[0].filename}`;
    }
    
    // Handle favicon upload
    if (req.files && req.files.favicon) {
      // Delete old favicon if exists
      if (settings.data.faviconUrl) {
        const oldFaviconPath = path.join(__dirname, '..', 'public', settings.data.faviconUrl);
        if (fs.existsSync(oldFaviconPath)) {
          fs.unlinkSync(oldFaviconPath);
        }
      }
      
      updatedData.faviconUrl = `/uploads/settings/${req.files.favicon[0].filename}`;
    }
    
    // Save updated settings
    settings = await Setting.findOneAndUpdate(
      { type: 'appearance' },
      { data: updatedData },
      { new: true, upsert: true }
    );
    
    res.status(200).json({
      success: true,
      data: settings.data
    });
  } catch (error) {
    next(error);
  }
};

// Reports and analytics
exports.generateReport = async (req, res, next) => {
  try {
    const { reportType, startDate, endDate } = req.query;
    
    // Validate dates
    const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);
    
    // Initialize response data
    const responseData = {
      summary: {},
      chartData: {
        labels: [],
        datasets: []
      },
      bookingTypes: {
        labels: [],
        datasets: []
      },
      topAreas: {
        labels: [],
        datasets: []
      },
      tableData: []
    };
    
    // Generate date labels for chart
    const dateLabels = [];
    const currentDate = new Date(start);
    
    while (currentDate <= end) {
      dateLabels.push(new Date(currentDate).toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    responseData.chartData.labels = dateLabels;
    
    // Get previous period for comparison
    const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const prevStart = new Date(start);
    prevStart.setDate(prevStart.getDate() - daysDiff);
    const prevEnd = new Date(start);
    prevEnd.setDate(prevEnd.getDate() - 1);
    
    switch (reportType) {
      case 'bookings':
        // Get bookings for current period
        const bookings = await Booking.find({
          createdAt: { $gte: start, $lte: end }
        });
        
        // Get bookings for previous period
        const prevBookings = await Booking.find({
          createdAt: { $gte: prevStart, $lte: prevEnd }
        });
        
        // Calculate summary data
        const totalBookings = bookings.length;
        const bookingGrowth = prevBookings.length > 0 
          ? Math.round(((totalBookings - prevBookings.length) / prevBookings.length) * 100) 
          : 100;
        
        const completedBookings = bookings.filter(b => b.status === 'completed').length;
        const completionRate = totalBookings > 0 ? Math.round((completedBookings / totalBookings) * 100) : 0;
        
        const prevCompletedBookings = prevBookings.filter(b => b.status === 'completed').length;
        const prevCompletionRate = prevBookings.length > 0 ? Math.round((prevCompletedBookings / prevBookings.length) * 100) : 0;
        const completionRateChange = prevCompletionRate > 0 
          ? Math.round(((completionRate - prevCompletionRate) / prevCompletionRate) * 100) 
          : 0;
        
        // Calculate total revenue
        const totalRevenue = bookings.reduce((sum, booking) => {
          return sum + (booking.fare?.amount || 0);
        }, 0);
        
        const prevTotalRevenue = prevBookings.reduce((sum, booking) => {
          return sum + (booking.fare?.amount || 0);
        }, 0);
        
        const revenueGrowth = prevTotalRevenue > 0 
          ? Math.round(((totalRevenue - prevTotalRevenue) / prevTotalRevenue) * 100) 
          : 100;
        
        // Calculate average response time
        const responseTimes = bookings
          .filter(b => b.startTime && b.createdAt)
          .map(b => Math.round((new Date(b.startTime) - new Date(b.createdAt)) / (1000 * 60)));
        
        const avgResponseTime = responseTimes.length > 0 
          ? Math.round(responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length) 
          : 0;
        
        const prevResponseTimes = prevBookings
          .filter(b => b.startTime && b.createdAt)
          .map(b => Math.round((new Date(b.startTime) - new Date(b.createdAt)) / (1000 * 60)));
        
        const prevAvgResponseTime = prevResponseTimes.length > 0 
          ? Math.round(prevResponseTimes.reduce((sum, time) => sum + time, 0) / prevResponseTimes.length) 
          : 0;
        
        const responseTimeChange = prevAvgResponseTime > 0 
          ? Math.round(((avgResponseTime - prevAvgResponseTime) / prevAvgResponseTime) * 100) 
          : 0;
        
        // Set summary data
        responseData.summary = {
          totalBookings,
          bookingGrowth,
          totalRevenue,
          revenueGrowth,
          avgResponseTime,
          responseTimeChange,
          completionRate,
          completionRateChange
        };
        
        // Prepare chart data
        const bookingsByDate = {};
        dateLabels.forEach(date => {
          bookingsByDate[date] = {
            total: 0,
            emergency: 0,
            scheduled: 0,
            transfer: 0,
            completed: 0,
            cancelled: 0
          };
        });
        
        bookings.forEach(booking => {
          const bookingDate = new Date(booking.createdAt).toISOString().split('T')[0];
          
          if (bookingsByDate[bookingDate]) {
            bookingsByDate[bookingDate].total++;
            
            if (booking.bookingType) {
              bookingsByDate[bookingDate][booking.bookingType]++;
            }
            
            if (booking.status === 'completed') {
              bookingsByDate[bookingDate].completed++;
            } else if (booking.status === 'cancelled') {
              bookingsByDate[bookingDate].cancelled++;
            }
          }
        });
        
        // Set chart datasets
        responseData.chartData.datasets = [
          {
            label: 'Total Bookings',
            data: dateLabels.map(date => bookingsByDate[date].total),
            borderColor: '#1976D2',
            backgroundColor: 'rgba(25, 118, 210, 0.1)',
            fill: true
          },
          {
            label: 'Emergency',
            data: dateLabels.map(date => bookingsByDate[date].emergency),
            borderColor: '#F44336',
            backgroundColor: 'rgba(244, 67, 54, 0.1)',
            fill: true
          },
          {
            label: 'Scheduled',
            data: dateLabels.map(date => bookingsByDate[date].scheduled),
            borderColor: '#4CAF50',
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            fill: true
          }
        ];
        
        // Prepare booking types pie chart
        const bookingTypeCount = {
          emergency: bookings.filter(b => b.bookingType === 'emergency').length,
          scheduled: bookings.filter(b => b.bookingType === 'scheduled').length,
          transfer: bookings.filter(b => b.bookingType === 'transfer').length
        };
        
        responseData.bookingTypes = {
          labels: ['Emergency', 'Scheduled', 'Transfer'],
          datasets: [
            {
              data: [bookingTypeCount.emergency, bookingTypeCount.scheduled, bookingTypeCount.transfer],
              backgroundColor: ['#F44336', '#4CAF50', '#2196F3']
            }
          ]
        };
        
        // Prepare top areas bar chart
        const areaCount = {};
        
        bookings.forEach(booking => {
          if (booking.pickupLocation && booking.pickupLocation.address) {
            // Extract area from address (simplified)
            const addressParts = booking.pickupLocation.address.split(',');
            const area = addressParts.length > 1 ? addressParts[addressParts.length - 2].trim() : addressParts[0].trim();
            
            if (!areaCount[area]) {
              areaCount[area] = 0;
            }
            
            areaCount[area]++;
          }
        });
        
        // Sort areas by count and take top 5
        const topAreas = Object.entries(areaCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5);
        
        responseData.topAreas = {
          labels: topAreas.map(([area]) => area),
          datasets: [
            {
              label: 'Bookings',
              data: topAreas.map(([, count]) => count),
              backgroundColor: '#9C27B0'
            }
          ]
        };
        
        // Prepare table data
        responseData.tableData = dateLabels.map(date => ({
          date,
          total: bookingsByDate[date].total,
          emergency: bookingsByDate[date].emergency,
          scheduled: bookingsByDate[date].scheduled,
          transfer: bookingsByDate[date].transfer,
          completed: bookingsByDate[date].completed,
          cancelled: bookingsByDate[date].cancelled
        }));
        
        break;
        
      case 'revenue':
        // Similar implementation for revenue report
        // ...
        break;
        
      case 'response-time':
        // Similar implementation for response time report
        // ...
        break;
        
      case 'driver-performance':
        // Similar implementation for driver performance report
        // ...
        break;
        
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid report type'
        });
    }
    
    res.status(200).json({
      success: true,
      data: responseData
    });
  } catch (error) {
    next(error);
  }
};

// Profile management
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email, phone } = req.body;
    
    // Find user
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update user fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    
    // Handle profile image upload
    if (req.file) {
      // Delete old profile image if exists
      if (user.profileImage) {
        const oldImagePath = path.join(__dirname, '..', 'public', user.profileImage);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      
      user.profileImage = `/uploads/profiles/${req.file.filename}`;
    }
    
    await user.save();
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password'
      });
    }
    
    // Find user
    const user = await User.findById(req.user.id).select('+password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if current password matches
    const isMatch = await user.matchPassword(currentPassword);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Backup and restore
exports.createBackup = async (req, res, next) => {
  try {
    // In a real implementation, this would create a database backup
    // For this example, we'll just return a success message
    
    res.status(200).json({
      success: true,
      message: 'Backup created successfully'
    });
  } catch (error) {
    next(error);
  }
};

exports.restoreBackup = async (req, res, next) => {
  try {
    // In a real implementation, this would restore from a backup file
    // For this example, we'll just return a success message
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a backup file'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Backup restored successfully'
    });
  } catch (error) {
    next(error);
  }
};

exports.getBackupHistory = async (req, res, next) => {
  try {
    // In a real implementation, this would fetch backup history from database
    // For this example, we'll return mock data
    
    const backupHistory = [
      {
        id: 1,
        name: 'Full Backup - 2023-04-15',
        size: '5.2 MB',
        date: '2023-04-15 14:30:00',
        type: 'full'
      },
      {
        id: 2,
        name: 'Full Backup - 2023-04-01',
        size: '4.8 MB',
        date: '2023-04-01 10:15:00',
        type: 'full'
      },
      {
        id: 3,
        name: 'Settings Backup - 2023-03-15',
        size: '0.5 MB',
        date: '2023-03-15 09:45:00',
        type: 'settings'
      }
    ];
    
    res.status(200).json({
      success: true,
      data: backupHistory
    });
  } catch (error) {
    next(error);
  }
};