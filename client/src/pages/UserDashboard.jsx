import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { parkingLotAPI, bookingAPI } from '../services/api';
import useGeoLocation from '../hooks/useGeoLocation';
import MapView from '../components/MapView';
import ParkingCard from '../components/ParkingCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { 
  MapPin, Navigation, Clock, Calendar, CheckCircle, XCircle, AlertCircle,
  Filter, SlidersHorizontal, X, Car, DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const UserDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const { showToast, success, error: showError } = useToast();
  const navigate = useNavigate();
  const { location, loading: geoLoading, error: geoError, getCurrentPosition } = useGeoLocation();
  
  const [parkingLots, setParkingLots] = useState([]);
  const [filteredLots, setFilteredLots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedParkingLot, setSelectedParkingLot] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingHours, setBookingHours] = useState(1);
  const [bookings, setBookings] = useState([]);
  
  // Filter states
  const [filters, setFilters] = useState({
    maxDistance: 10, // km
    minPrice: 0,
    maxPrice: 1000,
    showAvailableOnly: false,
  });

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'CUSTOMER') {
      navigate('/login');
      return;
    }
    fetchBookings();
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (location) {
      fetchParkingLots();
    }
  }, [location]);

  useEffect(() => {
    applyFilters();
  }, [parkingLots, filters]);

  const applyFilters = () => {
    let filtered = [...parkingLots];

    // Distance filter
    if (filters.maxDistance) {
      filtered = filtered.filter(lot => {
        if (!lot.distance) return false;
        return lot.distance <= filters.maxDistance * 1000; // Convert km to meters
      });
    }

    // Price filter
    filtered = filtered.filter(lot => {
      const price = lot.pricePerHour || 0;
      return price >= filters.minPrice && price <= filters.maxPrice;
    });

    // Availability filter
    if (filters.showAvailableOnly) {
      filtered = filtered.filter(lot => lot.availableSlots > 0);
    }

    setFilteredLots(filtered);
  };

  const handleDetectLocation = () => {
    getCurrentPosition();
  };

  const fetchParkingLots = async () => {
    if (!location) return;
    
    try {
      setLoading(true);
      setError('');
      
      const response = await parkingLotAPI.getNearby(
        location.latitude,
        location.longitude,
        filters.maxDistance * 1000
      );

      const lotsWithDistance = response.data.map((lot) => {
        const coords = lot.location?.coordinates;
        if (!coords || coords.length !== 2) return { ...lot, distance: Infinity };

        const distance = calculateDistance(
          location.latitude,
          location.longitude,
          coords[1], // latitude
          coords[0]  // longitude
        );
        return { ...lot, distance };
      });

      lotsWithDistance.sort((a, b) => a.distance - b.distance);
      setParkingLots(lotsWithDistance);
      
      if (lotsWithDistance.length === 0) {
        showToast('No parking lots found nearby. Try increasing the search distance.', 'info');
      }
    } catch (err) {
      console.error('Error fetching parking lots:', err);
      const errorMsg = err.response?.data?.message || 'Failed to load parking lots';
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await bookingAPI.getAll();
      setBookings(response.data);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    }
  };

  const fetchSlots = async (parkingLotId) => {
    try {
      const response = await parkingLotAPI.getSlots(parkingLotId);
      const available = response.data.filter(slot => !slot.isOccupied);
      setAvailableSlots(available);
      if (available.length === 0) {
        showError('No available slots at this parking lot');
      }
    } catch (err) {
      console.error('Error fetching slots:', err);
      showError('Failed to load available slots');
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const handleBook = async (parkingLot) => {
    setSelectedParkingLot(parkingLot);
    await fetchSlots(parkingLot._id);
    setShowBookingModal(true);
  };

  const handleBookingSubmit = async () => {
    if (!selectedSlot) {
      showError('Please select a parking slot');
      return;
    }

    try {
      setError('');
      const response = await bookingAPI.create({
        parkingLotId: selectedParkingLot._id,
        slotId: selectedSlot._id,
        hours: bookingHours,
      });

      setShowBookingModal(false);
      setSelectedParkingLot(null);
      setSelectedSlot(null);
      setBookingHours(1);
      success(`Booking confirmed! Total: ₹${response.data.totalAmount?.toFixed(2) || '0.00'}`);
      fetchParkingLots();
      fetchBookings();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to create booking';
      setError(errorMsg);
      showError(errorMsg);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await bookingAPI.cancel(bookingId);
      success('Booking cancelled successfully!');
      fetchBookings();
      fetchParkingLots();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to cancel booking';
      showError(errorMsg);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Find & Book Parking</h1>
            <p className="text-slate-500 mt-1">Discover nearby parking spaces</p>
          </div>
          <button
            onClick={handleDetectLocation}
            disabled={geoLoading}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Navigation className={`w-5 h-5 ${geoLoading ? 'animate-spin' : ''}`} />
            {geoLoading ? 'Detecting...' : 'Detect My Location'}
          </button>
        </div>

        {/* Location Status */}
        {geoError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {geoError}
          </div>
        )}

        {location && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            Location detected: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
          </div>
        )}

        {!location && !geoLoading && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl mb-6 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            Click "Detect My Location" to find nearby parking lots
          </div>
        )}

        {/* Filters */}
        {location && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold text-slate-900">Filters</h2>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 hover:bg-slate-100 rounded-lg transition"
              >
                <SlidersHorizontal className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-4 gap-4 overflow-hidden"
                >
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Max Distance: {filters.maxDistance} km
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="50"
                      value={filters.maxDistance}
                      onChange={(e) => setFilters({ ...filters, maxDistance: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Min Price: ₹{filters.minPrice}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={filters.minPrice}
                      onChange={(e) => setFilters({ ...filters, minPrice: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Max Price: ₹{filters.maxPrice}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters({ ...filters, maxPrice: parseFloat(e.target.value) || 1000 })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    />
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.showAvailableOnly}
                        onChange={(e) => setFilters({ ...filters, showAvailableOnly: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="text-sm font-medium text-slate-700">Available only</span>
                    </label>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {location && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-1 mb-4 overflow-hidden">
                <MapView
                  userLocation={location.coordinates}
                  parkingLots={filteredLots}
                  height="600px"
                  onParkingLotClick={handleBook}
                />
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 h-full flex flex-col">
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                  Nearby Spots ({filteredLots.length})
                </h2>
                {loading ? (
                  <LoadingSkeleton type="list" count={3} />
                ) : (
                  <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1 max-h-[600px]">
                    {filteredLots.length === 0 ? (
                      <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <Car className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500 font-medium">No parking lots found</p>
                        <p className="text-slate-400 text-sm mt-1">Try adjusting your filters</p>
                      </div>
                    ) : (
                      filteredLots.map((lot) => (
                        <ParkingCard
                          key={lot._id}
                          parkingLot={lot}
                          onBook={handleBook}
                          distance={lot.distance}
                        />
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* My Bookings Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
            <Calendar className="w-6 h-6 mr-3 text-blue-600" />
            My Bookings
          </h2>
          {bookings.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No bookings yet</p>
              <p className="text-slate-400 text-sm mt-1">Your upcoming reservations will appear here</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookings.map((booking) => (
                <div
                  key={booking._id}
                  className="group bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-blue-200 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4">
                    <div className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${
                      booking.status === 'BOOKED' ? 'bg-green-100 text-green-700' :
                      booking.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {booking.status}
                    </div>
                  </div>

                  <h3 className="font-bold text-lg text-slate-900 pr-20 truncate">
                    {booking.parkingLotId?.name || 'Unknown Location'}
                  </h3>
                  <p className="text-slate-500 text-sm mt-1 flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    {booking.parkingLotId?.address || 'N/A'}
                  </p>

                  <div className="mt-6 pt-6 border-t border-slate-50 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-semibold">Slot</p>
                      <p className="text-lg font-bold text-slate-800">#{booking.slotId?.slotNumber || '?'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-semibold">Total Price</p>
                      <p className="text-lg font-bold text-slate-800">₹{booking.totalAmount?.toFixed(2) || '0.00'}</p>
                    </div>
                  </div>

                  {booking.status === 'BOOKED' && (
                    <button
                      onClick={() => handleCancelBooking(booking._id)}
                      className="mt-4 w-full py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-sm font-semibold opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-200"
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Booking Modal */}
        <AnimatePresence>
          {showBookingModal && selectedParkingLot && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">Confirm Booking</h2>
                  <button
                    onClick={() => {
                      setShowBookingModal(false);
                      setSelectedSlot(null);
                    }}
                    className="p-1 hover:bg-slate-100 rounded-full transition"
                  >
                    <X className="w-6 h-6 text-slate-400 hover:text-slate-600" />
                  </button>
                </div>

                <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="font-bold text-lg text-slate-900">{selectedParkingLot.name}</p>
                  <p className="text-slate-500 text-sm mt-1">{selectedParkingLot.address}</p>
                  <div className="mt-3 flex items-center gap-4">
                    <div className="flex items-center text-green-700 font-bold bg-green-50 px-3 py-1 rounded-lg text-sm">
                      <DollarSign className="w-4 h-4 mr-1" />
                      ₹{selectedParkingLot.pricePerHour}/hour
                    </div>
                    <div className="flex items-center text-blue-700 font-bold bg-blue-50 px-3 py-1 rounded-lg text-sm">
                      <Car className="w-4 h-4 mr-1" />
                      {selectedParkingLot.availableSlots} available
                    </div>
                  </div>
                </div>

                {/* Slot Selection */}
                {availableSlots.length > 0 && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-700 mb-3">
                      Select Parking Slot
                    </label>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot._id}
                          onClick={() => setSelectedSlot(slot)}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            selectedSlot?._id === slot._id
                              ? 'border-blue-600 bg-blue-50 text-blue-700'
                              : 'border-slate-200 hover:border-blue-300 bg-white'
                          }`}
                        >
                          <div className="text-center">
                            <Car className={`w-6 h-6 mx-auto mb-1 ${selectedSlot?._id === slot._id ? 'text-blue-600' : 'text-slate-400'}`} />
                            <p className="text-xs font-semibold">#{slot.slotNumber}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Duration (Hours)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={bookingHours}
                    onChange={(e) => setBookingHours(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-lg font-semibold"
                  />
                </div>

                <div className="mb-8 flex justify-between items-center py-4 border-t border-dashed border-slate-200">
                  <span className="text-slate-500 font-medium">Total Amount</span>
                  <span className="text-2xl font-bold text-blue-600">
                    ₹{((selectedParkingLot.pricePerHour || 0) * bookingHours).toFixed(2)}
                  </span>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setShowBookingModal(false);
                      setSelectedParkingLot(null);
                      setSelectedSlot(null);
                    }}
                    className="flex-1 px-4 py-3 rounded-xl text-slate-700 font-semibold hover:bg-slate-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBookingSubmit}
                    disabled={!selectedSlot}
                    className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-xl font-semibold hover:bg-blue-700 shadow-lg shadow-blue-600/30 transition hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Pay & Book
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default UserDashboard;
