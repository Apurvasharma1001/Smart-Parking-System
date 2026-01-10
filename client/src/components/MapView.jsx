import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Component to handle map updates
const MapUpdater = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || map.getZoom());
    }
  }, [center, zoom, map]);

  return null;
};

// Component to handle map clicks
const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => {
      if (onMapClick) {
        onMapClick(e);
      }
    },
  });
  return null;
};

const MapView = ({ userLocation, parkingLots, onParkingLotClick, onMapClick, height = '400px' }) => {
  const mapRef = useRef(null);

  // Create custom icons
  const userIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  const parkingIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  const defaultCenter = userLocation || [40.7128, -74.0060]; // Default to NYC
  const defaultZoom = userLocation ? 13 : 10;

  return (
    <div style={{ height, width: '100%' }} className="rounded-lg overflow-hidden border-2 border-gray-300">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapUpdater center={userLocation} zoom={13} />
        {onMapClick && <MapClickHandler onMapClick={onMapClick} />}

        {userLocation && (
          <Marker position={userLocation} icon={userIcon}>
            <Popup>Your Location</Popup>
          </Marker>
        )}

        {parkingLots?.map((lot) => {
          const coords = lot.location?.coordinates;
          if (!coords || coords.length !== 2) return null;

          return (
            <Marker
              key={lot._id}
              position={[coords[1], coords[0]]}
              icon={parkingIcon}
              eventHandlers={{
                click: () => onParkingLotClick && onParkingLotClick(lot),
              }}
            >
              <Popup className="custom-popup">
                <div className="p-2 min-w-[200px]">
                  <h3 className="font-bold text-lg text-slate-900 mb-1">{lot.name}</h3>
                  <p className="text-sm text-slate-600 mb-2">{lot.address}</p>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-green-600">
                      ₹{lot.pricePerHour?.toFixed(2) || '0.00'}/hr
                    </span>
                    {lot.distance && (
                      <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        {lot.distance < 1000 
                          ? `${Math.round(lot.distance)}m` 
                          : `${(lot.distance / 1000).toFixed(2)}km`}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      Available: <span className="font-semibold text-blue-600">{lot.availableSlots || 0}</span> / {lot.totalSlots || 0}
                    </span>
                    {lot.availableSlots > 0 && (
                      <button
                        onClick={() => onParkingLotClick && onParkingLotClick(lot)}
                        className="text-xs bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition font-semibold"
                      >
                        Book Now
                      </button>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapView;

