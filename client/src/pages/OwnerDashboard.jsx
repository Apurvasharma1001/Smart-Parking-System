import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { parkingLotAPI } from '../services/api';
import LiveCameraSlotSelector from '../components/LiveCameraSlotSelector';
import LiveOccupancyTracker from '../components/LiveOccupancyTracker';
import LocationAutoFill from '../components/LocationAutoFill';

const OwnerDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [parkingLots, setParkingLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    pricePerHour: '',
    useOpenCV: false,
    totalSlots: '',
    cameraSlots: null, // Will store camera-detected slots
  });
  const [locationData, setLocationData] = useState(null);
  const [showCameraSelector, setShowCameraSelector] = useState(false);
  const [showOccupancyTracker, setShowOccupancyTracker] = useState(false);
  const [selectedLotForTracking, setSelectedLotForTracking] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'OWNER') {
      navigate('/login');
      return;
    }
    fetchParkingLots();
  }, [isAuthenticated, user, navigate]);

  const fetchParkingLots = async () => {
    try {
      setLoading(true);
      const response = await parkingLotAPI.getOwnerLots();
      setParkingLots(response.data);
    } catch (error) {
      console.error('Error fetching parking lots:', error);
      setError('Failed to load parking lots');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });

    // Reset slots when switching between OpenCV and manual
    if (name === 'useOpenCV') {
      setFormData(prev => ({
        ...prev,
        useOpenCV: checked,
        totalSlots: '',
        cameraSlots: null,
      }));
    }
  };

  const handleLocationSet = (location) => {
    setLocationData(location);
    setFormData({
      ...formData,
      address: location.address || formData.address,
      latitude: location.latitude.toString(),
      longitude: location.longitude.toString(),
    });
    setError('');
    setSuccess('Location set successfully!');
  };

  const handleCameraSlotsSelected = (slotData) => {
    setFormData({
      ...formData,
      cameraSlots: slotData,
      totalSlots: slotData.totalSlots.toString(),
    });
    setShowCameraSelector(false);
    setSuccess(`Selected ${slotData.totalSlots} parking slots!`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.name || !formData.address || !formData.latitude || !formData.longitude || !formData.pricePerHour) {
      setError('Please fill all required fields');
      return;
    }

    if (!locationData) {
      setError('Please set the location');
      return;
    }

    if (formData.useOpenCV) {
      if (!formData.cameraSlots || formData.cameraSlots.slots.length === 0) {
        setError('Please select parking slots using camera');
        return;
      }
    } else {
      if (!formData.totalSlots || parseInt(formData.totalSlots) < 1) {
        setError('Please enter number of parking slots');
        return;
      }
    }

    try {
      // Create parking lot
      const createData = {
        name: formData.name,
        address: formData.address,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        pricePerHour: parseFloat(formData.pricePerHour),
        totalSlots: parseInt(formData.totalSlots),
      };

      const response = await parkingLotAPI.create(createData);
      const parkingLotId = response.data._id || response.data.id;

      // If OpenCV is enabled, get slot IDs and define slot coordinates
      if (formData.useOpenCV && formData.cameraSlots) {
        try {
          // Get the created parking lot to access its slots
          const lotResponse = await parkingLotAPI.getById(parkingLotId);
          const createdSlots = lotResponse.data.slots || [];
          
          // Match camera-detected slots with created slots by slot number
          const slotDefinitions = formData.cameraSlots.slots.map(slotDef => {
            const slot = createdSlots.find(s => s.slotNumber === slotDef.slot_number);
            return slot ? {
              slot_id: slot._id,
              slot_number: slotDef.slot_number,
              coordinates: slotDef.coordinates,
              image_width: slotDef.imageWidth,
              image_height: slotDef.imageHeight,
            } : null;
          }).filter(s => s !== null);

          if (slotDefinitions.length > 0) {
            // Define slot coordinates (slots are already created, just adding coordinates)
            await parkingLotAPI.defineSlots(parkingLotId, {
              slots: slotDefinitions,
            });
          }
        } catch (cvError) {
          console.error('OpenCV slot definition error:', cvError);
          // Non-critical - parking lot is created, coordinates can be set later
        }
      }

      setSuccess('Parking lot added successfully!');
      resetForm();
      setShowAddForm(false);
      await fetchParkingLots();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to add parking lot');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      latitude: '',
      longitude: '',
      pricePerHour: '',
      useOpenCV: false,
      totalSlots: '',
      cameraSlots: null,
    });
    setLocationData(null);
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    resetForm();
    setShowAddForm(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this parking lot?')) {
      return;
    }

    try {
      await parkingLotAPI.delete(id);
      setSuccess('Parking lot deleted successfully!');
      fetchParkingLots();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete parking lot');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Owner Dashboard</h1>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            {showAddForm ? 'Cancel' : '+ Add Parking Lot'}
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        {showAddForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            {/* Done and Cancel buttons at the top */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b">
              <h2 className="text-2xl font-bold">Add New Parking Lot</h2>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-300 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-400 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="parking-lot-form"
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition font-semibold"
                >
                  ✓ Done
                </button>
              </div>
            </div>

            <form id="parking-lot-form" onSubmit={handleSubmit} className="space-y-6">
              {/* 1. Parking Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parking Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Downtown Parking"
                  required
                />
              </div>

              {/* 2. Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter parking lot address"
                    required
                  />
                  <LocationAutoFill
                    onLocationSet={handleLocationSet}
                    currentAddress={formData.address}
                  />
                  {locationData && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800 font-semibold">
                        ✓ Location saved: {locationData.address}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        Coordinates: {formData.latitude}, {formData.longitude}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Price per Hour */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price per Hour (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="pricePerHour"
                  value={formData.pricePerHour}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 50.00"
                  required
                />
              </div>

              {/* 4. OpenCV Option */}
              <div className="border-t pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <input
                    type="checkbox"
                    id="useOpenCV"
                    name="useOpenCV"
                    checked={formData.useOpenCV}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="useOpenCV" className="text-lg font-medium text-gray-700 cursor-pointer">
                    Use OpenCV-based Parking Detection
                  </label>
                </div>

                {formData.useOpenCV ? (
                  <div className="ml-8 space-y-4 bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-700">
                      Select parking slots using your camera. Click the button below to open camera and define slots.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowCameraSelector(true)}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
                    >
                      📷 Open Camera & Select Slots
                    </button>
                    {formData.cameraSlots && (
                      <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-lg">
                        <p className="text-sm font-semibold text-green-800">
                          ✓ {formData.cameraSlots.totalSlots} parking slots selected
                        </p>
                        <button
                          type="button"
                          onClick={() => setShowCameraSelector(true)}
                          className="text-sm text-blue-600 hover:text-blue-800 mt-2 underline"
                        >
                          Modify slots
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="ml-8 space-y-4 bg-gray-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700">
                      Number of Parking Slots *
                    </label>
                    <input
                      type="number"
                      min="1"
                      name="totalSlots"
                      value={formData.totalSlots}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 10"
                      required={!formData.useOpenCV}
                    />
                    <p className="text-xs text-gray-600">
                      Slots will be managed based on customer bookings
                    </p>
                  </div>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Parking Lots List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {parkingLots.length === 0 ? (
            <div className="col-span-2 text-center py-12 text-gray-500">
              No parking lots yet. Add your first parking lot to get started!
            </div>
          ) : (
            parkingLots.map((lot) => (
              <div key={lot._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{lot.name}</h3>
                    <p className="text-gray-600 text-sm mt-1">{lot.address}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(lot._id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Price per hour</p>
                    <p className="text-lg font-bold text-green-600">₹{lot.pricePerHour}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Availability</p>
                    <p className={`text-lg font-bold ${lot.availableSlots > 0 ? 'text-blue-600' : 'text-red-600'}`}>
                      {lot.availableSlots} / {lot.totalSlots} available
                    </p>
                  </div>
                </div>

                {lot.slots && lot.slots.length > 0 && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <p className="text-sm font-semibold text-gray-700">Parking Slots:</p>
                      <div className="flex items-center gap-3">
                        <p className="text-xs text-gray-500">
                          {lot.occupiedSlots} occupied • {lot.availableSlots} available
                        </p>
                        {(lot.cameraEnabled || (lot.slots && lot.slots.some(s => s.coordinates && s.coordinates.length > 0))) && (
                          <button
                            onClick={() => {
                              setSelectedLotForTracking(lot);
                              setShowOccupancyTracker(true);
                            }}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-blue-700"
                          >
                            📹 Live Track
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
                      {lot.slots.map((slot) => (
                        <div
                          key={slot._id}
                          className={`p-2 rounded-lg text-center text-xs font-semibold ${
                            slot.isOccupied
                              ? 'bg-red-100 text-red-800 border-2 border-red-300'
                              : 'bg-green-100 text-green-800 border-2 border-green-300'
                          }`}
                        >
                          <div className="text-lg mb-1">{slot.isOccupied ? '🚗' : '🅿️'}</div>
                          <div className="font-bold">#{slot.slotNumber}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Live Camera Slot Selector Modal */}
      {showCameraSelector && (
        <LiveCameraSlotSelector
          onSlotsSelected={handleCameraSlotsSelected}
          onClose={() => setShowCameraSelector(false)}
        />
      )}

      {/* Live Occupancy Tracker Modal */}
      {showOccupancyTracker && selectedLotForTracking && (
        <LiveOccupancyTracker
          parkingLotId={selectedLotForTracking._id}
          slots={(selectedLotForTracking.slots || []).map(slot => ({
            slot_number: slot.slotNumber,
            coordinates: slot.coordinates || [],
            imageWidth: slot.imageWidth,
            imageHeight: slot.imageHeight,
            _id: slot._id,
          }))}
          onClose={() => {
            setShowOccupancyTracker(false);
            setSelectedLotForTracking(null);
          }}
        />
      )}
    </div>
  );
};

export default OwnerDashboard;
