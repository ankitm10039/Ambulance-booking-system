const mongoose = require('mongoose');
const User = require('../models/user.model');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ambulance-booking-system')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Check if admin already exists
      const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL });
      
      if (adminExists) {
        console.log('Admin user already exists');
      } else {
        // Create admin user
        const admin = await User.create({
          name: 'Admin User',
          email: process.env.ADMIN_EMAIL,
          password: process.env.ADMIN_PASSWORD,
          phone: '1234567890',
          role: 'admin'
        });
        
        console.log('Admin user created successfully:', admin.email);
      }
    } catch (error) {
      console.error('Error creating admin user:', error);
    } finally {
      // Disconnect from MongoDB
      mongoose.disconnect();
      console.log('Disconnected from MongoDB');
    }
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });