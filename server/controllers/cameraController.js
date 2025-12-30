/**
 * Camera Controller - Handles live camera feed processing
 */
const ParkingLot = require('../models/ParkingLot');
const ParkingSlot = require('../models/ParkingSlot');
const slotAvailabilityService = require('../services/slotAvailabilityService');
const opencvService = require('../services/opencvService');
const fs = require('fs').promises;
const path = require('path');

// @desc    Process frame from camera for occupancy detection
// @route   POST /api/parking-lots/:id/process-frame
// @access  Private/Owner
exports.processFrame = async (req, res) => {
  try {
    const parkingLot = await ParkingLot.findById(req.params.id);

    if (!parkingLot) {
      return res.status(404).json({ message: 'Parking lot not found' });
    }

    if (parkingLot.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (!parkingLot.cameraEnabled) {
      return res.status(400).json({ message: 'Camera detection is not enabled for this parking lot' });
    }

    const { imageData } = req.body; // Base64 image data

    if (!imageData) {
      return res.status(400).json({ message: 'imageData is required (base64 encoded image)' });
    }

    // Save image temporarily
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const tempDir = path.join(__dirname, '../temp');
    await fs.mkdir(tempDir, { recursive: true });
    const tempFilePath = path.join(tempDir, `frame_${Date.now()}_${parkingLot._id}.jpg`);
    await fs.writeFile(tempFilePath, buffer);

    try {
      // Get slots with coordinates
      const slots = await ParkingSlot.find({ 
        parkingLot: parkingLot._id,
        coordinates: { $exists: true, $ne: null }
      }).sort({ slotNumber: 1 });

      if (slots.length === 0) {
        return res.status(400).json({ message: 'No slots with coordinates defined' });
      }

      // Prepare slots data for OpenCV service
      const slotsData = slots.map(slot => ({
        slotId: slot._id.toString(),
        slotNumber: slot.slotNumber,
        coordinates: slot.coordinates,
        imageWidth: slot.imageWidth,
        imageHeight: slot.imageHeight,
      }));

      // Call OpenCV service for detection (opencvService handles the mapping)
      const detectionResults = await opencvService.detectOccupancy(
        tempFilePath,
        slotsData,
        parkingLot.cameraThreshold
      );

      // Update slots in database
      const updatedSlots = [];
      const slotMap = new Map(slots.map(s => [s._id.toString(), s]));

      for (const result of detectionResults) {
        // Try to find slot by slot_id (MongoDB ID) first, then by slot_number
        let slot = slotMap.get(result.slot_id);
        if (!slot && result.slot_number) {
          slot = Array.from(slotMap.values()).find(s => s.slotNumber === result.slot_number);
        }
        if (!slot) {
          console.warn(`Slot not found for result: slot_id=${result.slot_id}, slot_number=${result.slot_number}`);
          continue;
        }

        const isOccupied = result.status === 'occupied';
        const previousStatus = slot.isOccupied;

        if (previousStatus !== isOccupied || slot.source !== 'camera') {
          slot.isOccupied = isOccupied;
          slot.source = 'camera';
          slot.lastUpdated = new Date();
          slot.detectionMetadata = {
            confidence: result.confidence,
            timestamp: new Date(),
            occupancyRatio: result.occupancy_ratio,
            whitePixelCount: result.white_pixel_count,
          };
          await slot.save();
        }

        updatedSlots.push({
          slot_id: slot._id.toString(),
          slot_number: slot.slotNumber,
          status: result.status,
          confidence: result.confidence,
        });
      }

      // Clean up temp file
      await fs.unlink(tempFilePath).catch(() => {});

      res.json({
        success: true,
        slots: updatedSlots.sort((a, b) => a.slot_number - b.slot_number),
        timestamp: new Date(),
      });
    } catch (error) {
      // Clean up temp file on error
      await fs.unlink(tempFilePath).catch(() => {});
      throw error;
    }
  } catch (error) {
    console.error('Process frame error:', error);
    res.status(500).json({ message: error.message || 'Failed to process frame' });
  }
};

