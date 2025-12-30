import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { parkingLotAPI, bookingAPI } from '../services/api';
import MapView from '../components/MapView';
import ParkingCard from '../components/ParkingCard';
import LocationInput from '../components/LocationInput';

const UserDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [userLocation, setUserLocation] = useState(null);
  const [parkingLots, setParkingLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedParkingLot, setSelectedParkingLot] = useState(null);
  const [bookingHours, setBookingHours] = useState(1);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'CUSTOMER') {
      navigate('/login');
      return;
    }
    // Don't auto-fetch location, let user choose
    fetchBookings();
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (userLocation) {
      fetchParkingLots();
    }
  }, [userLocation]);

  const handleLocationChange = (location) => {
    if (location && location.coordinates) {
      setUserLocation(location.coordinates);
      setError('');
    }
  };

  const fetchParkingLots = async () => {
    try {
      setLoading(true);
      const params = {
        latitude: userLocation[0],
        longitude: userLocation[1],
        maxDistance: 10000, // 10km
      };
      const response = await parkingLotAPI.getAll(params);
      
      // Calculate distances and sort
      const lotsWithDistance = response.data.map((lot) => {
        const coords = lot.location?.coordinates;
        if (!coords || coords.length !== 2) return { ...lot, distance: Infinity };
        
        const distance = calculateDistance(
          userLocation[0],
          userLocation[1],
          coords[1],
          coords[0]
        );
        return { ...lot, distance };
      });

      lotsWithDistance.sort((a, b) => a.distance - b.distance);
      setParkingLots(lotsWithDistance);
    } catch (error) {
      console.error('Error fetching parking lots:', error);
      setError('Failed to load parking lots');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await bookingAPI.getAll();
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
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

    return R * c; // Distance in meters
  };

  const handleBook = (parkingLot) => {
    setSelectedParkingLot(parkingLot);
    setShowBookingModal(true);
  };

  const handleBookingSubmit = async () => {
    try {
      setError('');
      const response = await bookingAPI.create({
        parkingLotId: selectedParkingLot._id,
        hours: bookingHours,
      });

      setShowBookingModal(false);
      setSelectedParkingLot(null);
      setBookingHours(1);
      alert(`Booking confirmed! Total: $${response.data.totalPrice.toFixed(2)}`);
      fetchParkingLots();
      fetchBookings();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create booking');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await bookingAPI.cancel(bookingId);
      alert('Booking cancelled successfully!');
      fetchBookings();
      fetchParkingLots();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to cancel booking');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Find Parking</h1>

        {/* Location Selection */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Set Your Location</h2>
          <LocationInput
            onLocationChange={handleLocationChange}
            showMap={false}
          />
          {!userLocation && (
            <p className="text-sm text-gray-500 mt-4">
              Please set your location to find nearby parking lots.
            </p>
          )}
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {userLocation && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-4 mb-4">
                <h2 className="text-xl font-bold mb-4">Map View</h2>
                <MapView
                  userLocation={userLocation}
                  parkingLots={parkingLots}
                  height="500px"
                />
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-4">
                <h2 className="text-xl font-bold mb-4">Nearby Parking</h2>
                {loading ? (
                  <p className="text-gray-500 text-center py-8">Loading parking lots...</p>
                ) : (
                  <div className="space-y-4 max-h-[500px] overflow-y-auto">
                    {parkingLots.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">
                        No parking lots found nearby
                      </p>
                    ) : (
                      parkingLots.map((lot) => (
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
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">My Bookings</h2>
          {bookings.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No bookings yet</p>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking._id}
                  className="border border-gray-200 rounded-lg p-4 flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-bold text-lg">
                      {booking.parkingLot?.name || 'Unknown'}
                    </h3>
                    <p className="text-gray-600">
                      {booking.parkingLot?.address || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Slot: {booking.parkingSlot?.slotNumber || 'N/A'} | Status:{' '}
                      <span
                        className={`font-semibold ${
                          booking.status === 'ACTIVE'
                            ? 'text-green-600'
                            : booking.status === 'COMPLETED'
                            ? 'text-blue-600'
                            : 'text-red-600'
                        }`}
                      >
                        {booking.status}
                      </span>
                    </p>
                    <p className="text-sm text-gray-500">
                      Total: ${booking.totalPrice?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  {booking.status === 'ACTIVE' && (
                    <button
                      onClick={() => handleCancelBooking(booking._id)}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Booking Modal */}
        {showBookingModal && selectedParkingLot && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold mb-4">Book Parking</h2>
              <div className="mb-4">
                <p className="font-semibold">{selectedParkingLot.name}</p>
                <p className="text-gray-600">{selectedParkingLot.address}</p>
                <p className="text-green-600 font-bold mt-2">
                  ${selectedParkingLot.pricePerHour}/hour
                </p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Hours
                </label>
                <input
                  type="number"
                  min="1"
                  value={bookingHours}
                  onChange={(e) => setBookingHours(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <p className="text-lg font-bold">
                  Total: ${(selectedParkingLot.pricePerHour * bookingHours).toFixed(2)}
                </p>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    setShowBookingModal(false);
                    setSelectedParkingLot(null);
                  }}
                  className="flex-1 bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBookingSubmit}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                  Confirm Booking
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;


