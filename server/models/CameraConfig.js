const mongoose = require('mongoose');

const cameraConfigSchema = new mongoose.Schema({
  parkingLotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingLot',
    required: [true, 'Parking lot ID is required'],
    unique: true,
  },
  cameraUrl: {
    type: String,
    trim: true,
  },
  referenceImage: {
    type: String,
    trim: true,
  },
  threshold: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.15,
  },
  lastSync: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient queries
cameraConfigSchema.index({ parkingLotId: 1 });

module.exports = mongoose.model('CameraConfig', cameraConfigSchema);
