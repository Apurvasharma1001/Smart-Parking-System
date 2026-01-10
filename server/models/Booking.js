const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Customer ID is required'],
  },
  parkingLotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingLot',
    required: [true, 'Parking lot ID is required'],
  },
  slotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Slot',
    required: [true, 'Slot ID is required'],
  },
  startTime: {
    type: Date,
    required: [true, 'Start time is required'],
  },
  endTime: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['BOOKED', 'COMPLETED', 'CANCELLED'],
    default: 'BOOKED',
  },
  totalAmount: {
    type: Number,
    min: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for efficient queries
bookingSchema.index({ customerId: 1, status: 1 });
bookingSchema.index({ parkingLotId: 1, status: 1 });
bookingSchema.index({ slotId: 1, status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
