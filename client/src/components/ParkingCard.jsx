import { MapPin, DollarSign, Car, Navigation } from 'lucide-react';

const ParkingCard = ({ parkingLot, onBook, showBookButton = true, distance }) => {
  const formatDistance = (meters) => {
    if (!meters && meters !== 0) return 'N/A';
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(2)}km`;
  };

  const availabilityPercentage = parkingLot.totalSlots 
    ? ((parkingLot.availableSlots || 0) / parkingLot.totalSlots) * 100 
    : 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg hover:border-blue-300 transition-all duration-300 cursor-pointer group">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
          {parkingLot.name}
        </h3>
        {distance !== undefined && (
          <span className="flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full whitespace-nowrap ml-2">
            <Navigation className="w-3 h-3" />
            {formatDistance(distance)}
          </span>
        )}
      </div>

      <div className="flex items-start gap-2 mb-4">
        <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-slate-600 line-clamp-2">{parkingLot.address || 'Address not available'}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="flex items-center gap-1 mb-1">
            <DollarSign className="w-4 h-4 text-green-600" />
            <p className="text-xs text-slate-500 uppercase font-semibold">Price</p>
          </div>
          <p className="text-lg font-bold text-green-600">
            ₹{parkingLot.pricePerHour?.toFixed(2) || '0.00'}/hr
          </p>
        </div>
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="flex items-center gap-1 mb-1">
            <Car className="w-4 h-4 text-blue-600" />
            <p className="text-xs text-slate-500 uppercase font-semibold">Available</p>
          </div>
          <p className="text-lg font-bold text-blue-600">
            {parkingLot.availableSlots || 0}<span className="text-xs text-slate-500 font-normal">/{parkingLot.totalSlots || 0}</span>
          </p>
        </div>
      </div>

      {/* Availability Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-slate-500">Availability</span>
          <span className="text-xs font-semibold text-slate-700">{Math.round(availabilityPercentage)}%</span>
        </div>
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              availabilityPercentage > 50 ? 'bg-green-500' :
              availabilityPercentage > 20 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${availabilityPercentage}%` }}
          />
        </div>
      </div>

      {showBookButton && (
        <button
          onClick={() => onBook(parkingLot)}
          disabled={!parkingLot.availableSlots || parkingLot.availableSlots === 0}
          className={`w-full py-2.5 rounded-lg font-semibold text-sm transition-all ${
            parkingLot.availableSlots > 0
              ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30 hover:-translate-y-0.5'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          {parkingLot.availableSlots > 0 ? 'Book Now' : 'No Slots Available'}
        </button>
      )}
    </div>
  );
};

export default ParkingCard;


