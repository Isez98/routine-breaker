import type { RoutineStop } from '../types';

// Detect if user is on mobile device
export const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Detect if user is on iOS
export const isIOSDevice = (): boolean => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

// Generate Google Maps URL for route
export const generateGoogleMapsUrl = (stops: RoutineStop[]): string => {
  const validStops = stops.filter(stop => stop.coords);
  
  if (validStops.length === 0) {
    throw new Error('No valid stops with coordinates');
  }

  if (validStops.length === 1) {
    // Single location - just show the location
    const stop = validStops[0];
    return `https://maps.google.com/maps?q=${stop.coords!.lat},${stop.coords!.lon}`;
  }

  // Multiple locations - create a route
  const origin = validStops[0];
  const destination = validStops[validStops.length - 1];
  const waypoints = validStops.slice(1, -1);

  let url = `https://maps.google.com/maps/dir/${origin.coords!.lat},${origin.coords!.lon}`;
  
  // Add waypoints
  waypoints.forEach(stop => {
    url += `/${stop.coords!.lat},${stop.coords!.lon}`;
  });
  
  // Add destination
  url += `/${destination.coords!.lat},${destination.coords!.lon}`;

  return url;
};

// Generate Apple Maps URL for route (iOS)
export const generateAppleMapsUrl = (stops: RoutineStop[]): string => {
  const validStops = stops.filter(stop => stop.coords);
  
  if (validStops.length === 0) {
    throw new Error('No valid stops with coordinates');
  }

  if (validStops.length === 1) {
    // Single location
    const stop = validStops[0];
    return `maps://maps.apple.com/?q=${stop.coords!.lat},${stop.coords!.lon}`;
  }

  // For multiple locations, Apple Maps doesn't support waypoints as well as Google Maps
  // So we'll create a route from first to last location
  const origin = validStops[0];
  const destination = validStops[validStops.length - 1];

  return `maps://maps.apple.com/?saddr=${origin.coords!.lat},${origin.coords!.lon}&daddr=${destination.coords!.lat},${destination.coords!.lon}&dirflg=d`;
};

// Generate route URL based on device
export const generateRouteUrl = (stops: RoutineStop[]): string => {
  if (isMobileDevice() && isIOSDevice()) {
    return generateAppleMapsUrl(stops);
  } else {
    return generateGoogleMapsUrl(stops);
  }
};

// Open route in external map application
export const openInMaps = (stops: RoutineStop[]): void => {
  try {
    const url = generateRouteUrl(stops);
    window.open(url, '_blank');
  } catch (error) {
    console.error('Failed to open route in maps:', error);
    alert('Unable to open route in maps. Please ensure you have valid locations.');
  }
};

// Generate a shareable text description of the route
export const generateRouteDescription = (stops: RoutineStop[]): string => {
  const validStops = stops.filter(stop => stop.coords);
  
  if (validStops.length === 0) {
    return 'No valid stops in route';
  }

  let description = 'Daily Routine Route:\n\n';
  
  validStops.forEach((stop, index) => {
    description += `${index + 1}. ${stop.time} - ${stop.categoryName}\n`;
    description += `   📍 ${stop.location}\n\n`;
  });

  return description;
};