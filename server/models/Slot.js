const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  parkingLotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingLot',
    required: [true, 'Parking lot ID is required'],
  },
  slotNumber: {
    type: String,
    required: [true, 'Slot number is required'],
    trim: true,
  },
  isOccupied: {
    type: Boolean,
    default: false,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
  cameraRegion: {
    x: {
      type: Number,
      min: 0,
    },
    y: {
      type: Number,
      min: 0,
    },
    width: {
      type: Number,
      min: 0,
    },
    height: {
      type: Number,
      min: 0,
    },
  },
});

// Compound index for efficient queries
slotSchema.index({ parkingLotId: 1, slotNumber: 1 }, { unique: true });

module.exports = mongoose.model('Slot', slotSchema);
