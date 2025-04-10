const User = require('../models/user.model');
const Booking = require('../models/booking.model');

// Get all users (admin only)
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: 'user' });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// Get user by ID
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

// Update user (admin only)
exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

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

// Delete user (admin only)
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get user bookings
exports.getUserBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('driver', 'name phone')
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

// Add emergency contact
exports.addEmergencyContact = async (req, res, next) => {
  try {
    const { name, relationship, phone } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name and phone number'
      });
    }

    const user = await User.findById(req.user.id);

    user.emergencyContacts.push({
      name,
      relationship,
      phone
    });

    await user.save();

    res.status(200).json({
      success: true,
      data: user.emergencyContacts
    });
  } catch (error) {
    next(error);
  }
};

// Update emergency contact
exports.updateEmergencyContact = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const { name, relationship, phone } = req.body;

    const user = await User.findById(req.user.id);

    // Find the contact index
    const contactIndex = user.emergencyContacts.findIndex(
      contact => contact._id.toString() === contactId
    );

    if (contactIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Emergency contact not found'
      });
    }

    // Update the contact
    if (name) user.emergencyContacts[contactIndex].name = name;
    if (relationship) user.emergencyContacts[contactIndex].relationship = relationship;
    if (phone) user.emergencyContacts[contactIndex].phone = phone;

    await user.save();

    res.status(200).json({
      success: true,
      data: user.emergencyContacts
    });
  } catch (error) {
    next(error);
  }
};

// Delete emergency contact
exports.deleteEmergencyContact = async (req, res, next) => {
  try {
    const { contactId } = req.params;

    const user = await User.findById(req.user.id);

    // Filter out the contact to delete
    user.emergencyContacts = user.emergencyContacts.filter(
      contact => contact._id.toString() !== contactId
    );

    await user.save();

    res.status(200).json({
      success: true,
      data: user.emergencyContacts
    });
  } catch (error) {
    next(error);
  }
};

// Update medical information
exports.updateMedicalInfo = async (req, res, next) => {
  try {
    const { bloodType, allergies, medicalConditions, medications } = req.body;

    const user = await User.findById(req.user.id);

    // Initialize medicalInfo if it doesn't exist
    if (!user.medicalInfo) {
      user.medicalInfo = {};
    }

    // Update fields if provided
    if (bloodType) user.medicalInfo.bloodType = bloodType;
    if (allergies) user.medicalInfo.allergies = allergies;
    if (medicalConditions) user.medicalInfo.medicalConditions = medicalConditions;
    if (medications) user.medicalInfo.medications = medications;

    await user.save();

    res.status(200).json({
      success: true,
      data: user.medicalInfo
    });
  } catch (error) {
    next(error);
  }
};