import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { parkingLotAPI, bookingAPI } from '../services/api';
import MapView from '../components/MapView';
import ParkingCard from '../components/ParkingCard';
import LocationInput from '../components/LocationInput';
import { MapPin, Navigation, Clock, Calendar, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

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
    const R = 6371e3;
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
      alert(`Booking confirmed! Total: ₹${response.data.totalPrice.toFixed(2)}`);
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
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Find & Book Parking</h1>

        {/* Location Selection */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 mb-8">
          <div className="flex items-center mb-6">
            <div className="p-3 bg-blue-50 rounded-lg mr-4">
              <Navigation className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Set Location</h2>
              <p className="text-slate-500 text-sm">Find the best parking spots near you</p>
            </div>
          </div>

          <LocationInput
            onLocationChange={handleLocationChange}
            showMap={false}
          />
          {!userLocation && (
            <div className="mt-4 p-4 bg-blue-50 text-blue-700 rounded-xl flex items-center text-sm">
              <AlertCircle className="w-4 h-4 mr-2" />
              Please enter your location/destination to see nearby slots.
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {userLocation && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-1 mb-4 overflow-hidden h-fit">
                <MapView
                  userLocation={userLocation}
                  parkingLots={parkingLots}
                  height="500px"
                />
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 h-full flex flex-col">
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                  Nearby Spots
                </h2>
                {loading ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
                    {parkingLots.length === 0 ? (
                      <p className="text-slate-500 text-center py-8">
                        No parking lots found nearby. Try increasing search range.
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
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
            <Calendar className="w-6 h-6 mr-3 text-blue-600" />
            My Bookings
          </h2>
          {bookings.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
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
                    <div className={`
                      px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full
                      ${booking.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                        booking.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}
                    `}>
                      {booking.status}
                    </div>
                  </div>

                  <h3 className="font-bold text-lg text-slate-900 pr-20 truncate">
                    {booking.parkingLot?.name || 'Unknown Location'}
                  </h3>
                  <p className="text-slate-500 text-sm mt-1 flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    {booking.parkingLot?.address || 'N/A'}
                  </p>

                  <div className="mt-6 pt-6 border-t border-slate-50 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-semibold">Slot</p>
                      <p className="text-lg font-bold text-slate-800">#{booking.parkingSlot?.slotNumber || '?'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase font-semibold">Total Price</p>
                      <p className="text-lg font-bold text-slate-800">₹{booking.totalPrice?.toFixed(2) || '0.00'}</p>
                    </div>
                  </div>

                  {booking.status === 'ACTIVE' && (
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
        {showBookingModal && selectedParkingLot && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full animate-in fade-in zoom-in duration-200">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Confirm Booking</h2>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="p-1 hover:bg-slate-100 rounded-full transition"
                >
                  <XCircle className="w-6 h-6 text-slate-400 hover:text-slate-600" />
                </button>
              </div>

              <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="font-bold text-lg text-slate-900">{selectedParkingLot.name}</p>
                <p className="text-slate-500 text-sm mt-1">{selectedParkingLot.address}</p>
                <div className="mt-3 flex items-center text-green-700 font-bold bg-green-50 w-fit px-2 py-1 rounded-lg text-sm">
                  ₹{selectedParkingLot.pricePerHour}/hour
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Duration (Hours)
                </label>
                <input
                  type="number"
                  min="1"
                  value={bookingHours}
                  onChange={(e) => setBookingHours(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-lg font-semibold"
                />
              </div>

              <div className="mb-8 flex justify-between items-center py-4 border-t border-dashed border-slate-200">
                <span className="text-slate-500 font-medium">Total Amount</span>
                <span className="text-2xl font-bold text-blue-600">
                  ₹{(selectedParkingLot.pricePerHour * bookingHours).toFixed(2)}
                </span>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowBookingModal(false);
                    setSelectedParkingLot(null);
                  }}
                  className="flex-1 px-4 py-3 rounded-xl text-slate-700 font-semibold hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBookingSubmit}
                  className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-xl font-semibold hover:bg-blue-700 shadow-lg shadow-blue-600/30 transition hover:-translate-y-0.5"
                >
                  Pay & Book
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
