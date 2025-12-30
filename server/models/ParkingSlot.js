const mongoose = require('mongoose');

const parkingSlotSchema = new mongoose.Schema({
  parkingLot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingLot',
    required: true,
  },
  slotNumber: {
    type: Number,
    required: true,
  },
  isOccupied: {
    type: Boolean,
    default: false,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
  // Detection source: 'camera' or 'manual'
  source: {
    type: String,
    enum: ['camera', 'manual'],
    default: 'manual',
  },
  // Slot region coordinates for camera detection (normalized 0-1)
  coordinates: {
    type: [[Number]], // Array of [x, y] pairs (normalized coordinates)
    default: null,
  },
  // Original image dimensions when coordinates were defined
  imageWidth: {
    type: Number,
    default: null,
  },
  imageHeight: {
    type: Number,
    default: null,
  },
  // Camera detection metadata
  detectionMetadata: {
    confidence: Number,
    timestamp: Date,
    occupancyRatio: Number,
    whitePixelCount: Number,
  },
});

// Compound index for efficient queries
parkingSlotSchema.index({ parkingLot: 1, slotNumber: 1 }, { unique: true });

module.exports = mongoose.model('ParkingSlot', parkingSlotSchema);


