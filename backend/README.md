# Ambulance Booking System - Backend

This is the backend API for the Ambulance Booking System, built with Node.js, Express, and MongoDB.

## Features

- User authentication and authorization
- User, driver, and admin roles
- Ambulance booking and tracking
- Driver management
- Vehicle management
- Real-time location tracking
- Rating and review system
- Emergency contact management
- Medical information storage

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## Installation

1. Clone the repository
2. Navigate to the backend directory
3. Install dependencies:

```bash
npm install
```

4. Create a `.env` file in the root directory with the following variables:

```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ambulance-booking-system
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
```

5. Create an admin user:

```bash
npm run create-admin
```

## Running the Server

### Development mode

```bash
npm run dev
```

### Production mode

```bash
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/update-profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

### Users

- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID (admin only)
- `PUT /api/users/:id` - Update user (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)
- `GET /api/users/bookings/me` - Get user bookings
- `POST /api/users/emergency-contacts` - Add emergency contact
- `PUT /api/users/emergency-contacts/:contactId` - Update emergency contact
- `DELETE /api/users/emergency-contacts/:contactId` - Delete emergency contact
- `PUT /api/users/medical-info` - Update medical information

### Drivers

- `POST /api/drivers/register` - Register as a driver
- `GET /api/drivers` - Get all drivers (admin only)
- `GET /api/drivers/:id` - Get driver by ID (admin only)
- `PUT /api/drivers/:id/verify` - Verify driver (admin only)
- `PUT /api/drivers/:id/suspend` - Suspend driver (admin only)
- `GET /api/drivers/profile/me` - Get current driver profile
- `PUT /api/drivers/availability` - Update driver availability
- `PUT /api/drivers/location` - Update driver location
- `GET /api/drivers/bookings/me` - Get driver bookings
- `GET /api/drivers/bookings/active` - Get driver active bookings
- `GET /api/drivers/stats/me` - Get driver statistics

### Bookings

- `POST /api/bookings` - Create a new booking
- `GET /api/bookings` - Get all bookings (admin only)
- `GET /api/bookings/:id` - Get booking by ID
- `PUT /api/bookings/:id/status` - Update booking status
- `PUT /api/bookings/:id/rate` - Rate a completed booking
- `GET /api/bookings/active` - Get user's active bookings
- `GET /api/bookings/stats` - Get booking statistics (admin only)

## Database Schema

### User
- name
- email
- password
- phone
- role (user, driver, admin)
- address
- emergencyContacts
- medicalInfo

### Driver
- user (reference to User)
- licenseNumber
- licenseExpiry
- vehicle (reference to Vehicle)
- isAvailable
- isVerified
- currentLocation
- rating
- totalTrips
- documents
- status

### Vehicle
- registrationNumber
- type
- model
- manufacturer
- year
- capacity
- features
- lastMaintenance
- nextMaintenance
- status
- insuranceExpiry
- documents

### Booking
- user (reference to User)
- driver (reference to Driver)
- vehicle (reference to Vehicle)
- bookingType
- patientDetails
- pickupLocation
- dropLocation
- scheduledTime
- requirements
- status
- fare
- distance
- estimatedTime
- actualTime
- startTime
- endTime
- cancelledBy
- cancellationReason
- rating
- emergencyContact