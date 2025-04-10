const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver'
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle'
  },
  bookingType: {
    type: String,
    enum: ['emergency', 'scheduled', 'transfer'],
    required: [true, 'Booking type is required']
  },
  patientDetails: {
    name: {
      type: String,
      required: [true, 'Patient name is required']
    },
    age: Number,
    gender: String,
    medicalCondition: String,
    additionalNotes: String
  },
  pickupLocation: {
    address: {
      type: String,
      required: [true, 'Pickup address is required']
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    }
  },
  dropLocation: {
    address: {
      type: String,
      required: function() {
        // Only required for scheduled bookings, not for emergency
        return this.bookingType !== 'emergency';
      }
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    }
  },
  scheduledTime: Date,
  requirements: [{
    type: String,
    enum: ['Oxygen', 'Stretcher', 'Wheelchair', 'Medical Staff']
  }],
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  fare: {
    amount: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'INR'
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending'
    },
    paymentMethod: String
  },
  distance: {
    type: Number, // in kilometers
    default: 0
  },
  estimatedTime: {
    type: Number, // in minutes
    default: 0
  },
  actualTime: {
    type: Number, // in minutes
    default: 0
  },
  startTime: Date,
  endTime: Date,
  cancelledBy: {
    type: String,
    enum: ['user', 'driver', 'admin', 'system']
  },
  cancellationReason: String,
  rating: {
    value: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    createdAt: Date
  },
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  }
}, {
  timestamps: true
});

// Index for geospatial queries
bookingSchema.index({ 'pickupLocation.coordinates': '2dsphere' });
bookingSchema.index({ 'dropLocation.coordinates': '2dsphere' });

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;