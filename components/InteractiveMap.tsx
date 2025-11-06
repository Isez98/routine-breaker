import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import type { RoutineStop } from '../types';
import L from 'leaflet';

// Fix for default markers not showing in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for different types of stops
const createCustomIcon = (color: string, number: number) => {
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
        font-size: 14px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ">${number}</div>
    `,
    className: 'custom-div-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

interface InteractiveMapProps {
  routine: RoutineStop[];
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ routine }) => {
  const validStops = routine.filter(stop => stop.coords);
  
  if (validStops.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-700 rounded-lg flex items-center justify-center">
        <p className="text-gray-400">No valid coordinates to display map.</p>
      </div>
    );
  }

  // Calculate map bounds
  const lats = validStops.map(stop => stop.coords!.lat);
  const lons = validStops.map(stop => stop.coords!.lon);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);

  // Calculate center and zoom level
  const centerLat = (minLat + maxLat) / 2;
  const centerLon = (minLon + maxLon) / 2;
  
  // Create bounds for fitting the map
  const bounds: [[number, number], [number, number]] = [
    [minLat, minLon],
    [maxLat, maxLon]
  ];

  // Create polyline coordinates for the route
  const routeCoordinates: [number, number][] = validStops.map(stop => [
    stop.coords!.lat,
    stop.coords!.lon
  ]);

  const getIconColor = (index: number, total: number) => {
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
        
        {/* Route polyline */}
        <Polyline
          positions={routeCoordinates}
          color="#4299E1"
          weight={3}
          opacity={0.8}
          dashArray="10, 10"
        />
        
        {/* Markers for each stop */}
        {validStops.map((stop, index) => (
          <Marker
            key={index}
            position={[stop.coords!.lat, stop.coords!.lon]}
            icon={createCustomIcon(getIconColor(index, validStops.length), index + 1)}
          >
            <Popup>
              <div className="text-center">
                <div className="font-bold text-lg">{stop.categoryName}</div>
                <div className="text-sm text-gray-600">{stop.time}</div>
                <div className="text-sm mt-1">{stop.location}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default InteractiveMap;