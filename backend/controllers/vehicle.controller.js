const Vehicle = require('../models/vehicle.model');
const fs = require('fs');
const path = require('path');

// Create a new vehicle
exports.createVehicle = async (req, res, next) => {
  try {
    // Parse features if it's a string (from form-data)
    if (req.body.features && typeof req.body.features === 'string') {
      try {
        req.body.features = JSON.parse(req.body.features);
      } catch (e) {
        req.body.features = [];
      }
    }

    // Create vehicle
    const vehicle = await Vehicle.create({
      registrationNumber: req.body.registrationNumber,
      type: req.body.type,
      model: req.body.model,
      manufacturer: req.body.manufacturer,
      year: req.body.year,
      capacity: req.body.capacity,
      features: req.body.features || [],
      lastMaintenance: req.body.lastMaintenance,
      nextMaintenance: req.body.nextMaintenance,
      status: req.body.status || 'active',
      insuranceExpiry: req.body.insuranceExpiry
    });

    // Handle image upload
    if (req.file) {
      // Save image path to vehicle
      vehicle.image = `/uploads/vehicles/${req.file.filename}`;
      await vehicle.save();
    }

    res.status(201).json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    console.error('Vehicle creation error:', error);
    next(error);
  }
};

// Get all vehicles
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
        { registrationNumber: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { manufacturer: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Count total documents
    const total = await Vehicle.countDocuments(query);
    
    // Get vehicles with pagination and sorting
    const vehicles = await Vehicle.find(query)
      .sort({ [sortBy]: sortDesc === 'true' ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
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

// Get vehicle by ID
exports.getVehicleById = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    
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

// Update vehicle
exports.updateVehicle = async (req, res, next) => {
  try {
    // Parse features if it's a string (from form-data)
    if (req.body.features && typeof req.body.features === 'string') {
      try {
        req.body.features = JSON.parse(req.body.features);
      } catch (e) {
        req.body.features = [];
      }
    }
    
    // Find vehicle
    const vehicle = await Vehicle.findById(req.params.id);
    
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }
    
    // Update vehicle fields
    const fieldsToUpdate = [
      'registrationNumber', 'type', 'model', 'manufacturer', 'year', 
      'capacity', 'features', 'lastMaintenance', 'nextMaintenance', 
      'status', 'insuranceExpiry'
    ];
    
    fieldsToUpdate.forEach(field => {
      if (req.body[field] !== undefined) {
        vehicle[field] = req.body[field];
      }
    });
    
    // Handle image upload
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

// Update vehicle status
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

// Delete vehicle
exports.deleteVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }
    
    // Delete image if exists
    if (vehicle.image) {
      const imagePath = path.join(__dirname, '..', 'public', vehicle.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await vehicle.remove();
    
    res.status(200).json({
      success: true,
      message: 'Vehicle deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};