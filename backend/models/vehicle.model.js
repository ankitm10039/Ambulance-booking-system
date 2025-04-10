const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  registrationNumber: {
    type: String,
    required: [true, 'Registration number is required'],
    unique: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['Basic Life Support', 'Advanced Life Support', 'Patient Transport', 'Neonatal'],
    required: [true, 'Vehicle type is required']
  },
  model: {
    type: String,
    required: [true, 'Vehicle model is required'],
    trim: true
  },
  manufacturer: {
    type: String,
    required: [true, 'Manufacturer is required'],
    trim: true
  },
  year: {
    type: Number,
    required: [true, 'Year is required']
  },
  capacity: {
    type: Number,
    default: 1
  },
  features: [{
    type: String,
    enum: ['Oxygen', 'Ventilator', 'Defibrillator', 'Stretcher', 'Wheelchair', 'ECG Monitor', 'Suction Unit']
  }],
  lastMaintenance: {
    type: Date,
    default: Date.now
  },
  nextMaintenance: Date,
  status: {
    type: String,
    enum: ['active', 'maintenance', 'out-of-service'],
    default: 'active'
  },
  insuranceExpiry: {
    type: Date,
    required: [true, 'Insurance expiry date is required']
  },
  image: {
    type: String,
    default: null
  },
  documents: [
    {
      url: String,
      documentType: {
        type: String,
        enum: ['registration', 'insurance', 'fitness', 'other']
      },
      verified: {
        type: Boolean,
        default: false
      },
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }
  ]
}, {
  timestamps: true
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

module.exports = Vehicle;