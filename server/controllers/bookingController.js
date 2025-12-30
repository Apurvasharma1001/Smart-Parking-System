const Booking = require('../models/Booking');
const ParkingLot = require('../models/ParkingLot');
const ParkingSlot = require('../models/ParkingSlot');

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private/Customer
exports.createBooking = async (req, res) => {
  try {
    const { parkingLotId, hours } = req.body;

    if (!parkingLotId || !hours) {
      return res.status(400).json({ message: 'Please provide parking lot ID and hours' });
    }

    const parkingLot = await ParkingLot.findById(parkingLotId);
    if (!parkingLot || !parkingLot.isActive) {
      return res.status(404).json({ message: 'Parking lot not found or inactive' });
    }

    // Use unified service to find available slots
    const slotAvailabilityService = require('../services/slotAvailabilityService');
    
    // Refresh slot status to get latest availability
    try {
      await slotAvailabilityService.refreshSlotStatus(parkingLotId);
    } catch (error) {
      console.error('Failed to refresh slot status:', error.message);
      // Continue with database query as fallback
    }
    
    // Find an available slot
    const availableSlot = await ParkingSlot.findOne({
      parkingLot: parkingLotId,
      isOccupied: false,
    });

    if (!availableSlot) {
      return res.status(400).json({ message: 'No available slots at this parking lot' });
    }

    // Calculate price
    const totalPrice = parkingLot.pricePerHour * parseFloat(hours);

    // Create booking
    const booking = await Booking.create({
      customer: req.user._id,
      parkingLot: parkingLotId,
      parkingSlot: availableSlot._id,
      startTime: new Date(),
      totalPrice,
      status: 'ACTIVE',
    });

    // Mark slot as occupied
    availableSlot.isOccupied = true;
    availableSlot.lastUpdated = new Date();
    await availableSlot.save();

    // Populate references
    await booking.populate('parkingLot', 'name address pricePerHour location');
    await booking.populate('parkingSlot', 'slotNumber');
    await booking.populate('customer', 'name email');

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user bookings
// @route   GET /api/bookings
// @access  Private
exports.getBookings = async (req, res) => {
  try {
    let query = {};

    // Customers see their own bookings, owners see bookings for their lots
    if (req.user.role === 'CUSTOMER') {
      query.customer = req.user._id;
    } else if (req.user.role === 'OWNER') {
      const ownerParkingLots = await ParkingLot.find({ owner: req.user._id });
      query.parkingLot = { $in: ownerParkingLots.map((lot) => lot._id) };
    }

    const bookings = await Booking.find(query)
      .populate('parkingLot', 'name address pricePerHour location')
      .populate('parkingSlot', 'slotNumber')
      .populate('customer', 'name email')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('parkingLot', 'name address pricePerHour location')
      .populate('parkingSlot', 'slotNumber')
      .populate('customer', 'name email');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check authorization
    if (req.user.role === 'CUSTOMER' && booking.customer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (req.user.role === 'OWNER') {
      const parkingLot = await ParkingLot.findById(booking.parkingLot._id);
      if (parkingLot.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private/Customer
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    if (booking.status !== 'ACTIVE') {
      return res.status(400).json({ message: 'Only active bookings can be cancelled' });
    }

    booking.status = 'CANCELLED';
    booking.endTime = new Date();
    await booking.save();

    // Free up the slot
    const slot = await ParkingSlot.findById(booking.parkingSlot);
    if (slot) {
      slot.isOccupied = false;
      slot.lastUpdated = new Date();
      await slot.save();
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Complete booking (for testing/admin)
// @route   PUT /api/bookings/:id/complete
// @access  Private
exports.completeBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status !== 'ACTIVE') {
      return res.status(400).json({ message: 'Only active bookings can be completed' });
    }

    booking.status = 'COMPLETED';
    booking.endTime = new Date();
    await booking.save();

    // Free up the slot
    const slot = await ParkingSlot.findById(booking.parkingSlot);
    if (slot) {
      slot.isOccupied = false;
      slot.lastUpdated = new Date();
      await slot.save();
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


