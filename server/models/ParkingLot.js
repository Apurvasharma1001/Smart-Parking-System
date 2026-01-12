const mongoose = require('mongoose');

const parkingLotSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner ID is required'],
  },
  name: {
    type: String,
    required: [true, 'Parking lot name is required'],
    trim: true,
  },
  address: {
    type: String,
    trim: true,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: function (v) {
          return v.length === 2 && v[0] >= -180 && v[0] <= 180 && v[1] >= -90 && v[1] <= 90;
        },
        message: 'Coordinates must be [longitude, latitude]',
      },
    },
  },
  pricePerHour: {
    type: Number,
    min: 0,
  },
  totalSlots: {
    type: Number,
    min: 0,
  },
  availableSlots: {
    type: Number,
    min: 0,
    default: 0,
  },
  mode: {
    type: String,
    enum: ['MANUAL', 'CAMERA'],
    default: 'MANUAL',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Geospatial index for location queries
parkingLotSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('ParkingLot', parkingLotSchema);
