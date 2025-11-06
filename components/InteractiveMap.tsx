import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import type { RoutineStop, UserLocation } from '../types';
import L from 'leaflet';

// Fix for default markers not showing in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for different types of stops
const createCustomIcon = (color: string, number?: number) => {
  const content = number ? number.toString() : '●';
  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 3px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        color: white;
        font-size: ${number ? '14px' : '16px'};
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ">${content}</div>
    `,
    className: 'custom-div-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

// User location icon
const createUserLocationIcon = () => {
  return L.divIcon({
    html: `
      <div style="
        background-color: #3B82F6;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 0 10px rgba(59, 130, 246, 0.6);
        animation: pulse 2s infinite;
      "></div>
      <style>
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
          100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }
      </style>
    `,
    className: 'user-location-icon',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

interface InteractiveMapProps {
  routine: RoutineStop[];
  userLocation?: UserLocation | null;
  currentActivityIndex?: number;
  isTrackingMode?: boolean;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ 
  routine, 
  userLocation, 
  currentActivityIndex = 0,
  isTrackingMode = false 
}) => {
  const validStops = routine.filter(stop => stop.coords);
  
  if (validStops.length === 0 && !userLocation) {
    return (
      <div className="w-full h-96 bg-gray-700 rounded-lg flex items-center justify-center">
        <p className="text-gray-400">No valid coordinates to display map.</p>
      </div>
    );
  }

  // In tracking mode, show only current activity and user location
  const displayStops = isTrackingMode 
    ? validStops.slice(currentActivityIndex, currentActivityIndex + 1)
    : validStops;

  // Calculate map bounds including user location
  const allLocations = [];
  
  if (userLocation) {
    allLocations.push({ lat: userLocation.lat, lon: userLocation.lon });
  }
  
  displayStops.forEach(stop => {
    if (stop.coords) {
      allLocations.push({ lat: stop.coords.lat, lon: stop.coords.lon });
    }
  });

  if (allLocations.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-700 rounded-lg flex items-center justify-center">
        <p className="text-gray-400">No locations to display.</p>
      </div>
    );
  }

  // Calculate bounds
  const lats = allLocations.map(loc => loc.lat);
  const lons = allLocations.map(loc => loc.lon);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);

  // Add padding to bounds
  const latPadding = (maxLat - minLat) * 0.1 || 0.01;
  const lonPadding = (maxLon - minLon) * 0.1 || 0.01;

  const bounds: [[number, number], [number, number]] = [
    [minLat - latPadding, minLon - lonPadding],
    [maxLat + latPadding, maxLon + lonPadding]
  ];

  // Create polyline coordinates (only if not in tracking mode or if showing route)
  const routeCoordinates: [number, number][] = isTrackingMode 
    ? (userLocation && displayStops[0]?.coords ? [
        [userLocation.lat, userLocation.lon],
        [displayStops[0].coords.lat, displayStops[0].coords.lon]
      ] : [])
    : validStops.map(stop => [stop.coords!.lat, stop.coords!.lon]);

  const getIconColor = (index: number, total: number) => {
    if (isTrackingMode) return '#F59E0B'; // Orange for current activity
    if (index === 0) return '#48BB78'; // Green for start
    if (index === total - 1) return '#F56565'; // Red for end
    return '#4299E1'; // Blue for intermediate stops
  };

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden border border-gray-600">
      <MapContainer
        bounds={bounds}
        style={{ height: '100%', width: '100%' }}
        className="leaflet-container"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* User location marker */}
        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lon]}
            icon={createUserLocationIcon()}
          >
            <Popup>
              <div className="text-center">
                <div className="font-bold text-lg text-blue-600">Your Location</div>
                <div className="text-sm text-gray-600">
                  {userLocation.accuracy && `Accuracy: ${Math.round(userLocation.accuracy)}m`}
                </div>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Route polyline */}
        {routeCoordinates.length > 1 && (
          <Polyline
            positions={routeCoordinates}
            color={isTrackingMode ? "#F59E0B" : "#4299E1"}
            weight={3}
            opacity={0.8}
            dashArray={isTrackingMode ? "5, 10" : "10, 10"}
          />
        )}
        
        {/* Activity markers */}
        {displayStops.map((stop, index) => {
          const actualIndex = isTrackingMode ? currentActivityIndex : index;
          const displayNumber = isTrackingMode ? 'NOW' : (actualIndex + 1);
          
          return (
            <Marker
              key={`${stop.categoryName}-${actualIndex}`}
              position={[stop.coords!.lat, stop.coords!.lon]}
              icon={createCustomIcon(
                getIconColor(actualIndex, validStops.length), 
                typeof displayNumber === 'number' ? displayNumber : undefined
              )}
            >
              <Popup>
                <div className="text-center">
                  <div className="font-bold text-lg">{stop.categoryName}</div>
                  <div className="text-sm text-gray-600">{stop.time}</div>
                  <div className="text-sm mt-1">{stop.location}</div>
                  {isTrackingMode && (
                    <div className="text-xs mt-2 px-2 py-1 bg-orange-100 text-orange-800 rounded">
                      Current Activity
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default InteractiveMap;