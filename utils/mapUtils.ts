import type { ScheduledActivity, UserLocation } from '../types';

// Detect if user is on mobile device
export const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Detect if user is on iOS
export const isIOSDevice = (): boolean => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

// Generate Google Maps URL for route starting from user location to remaining activities
export const generateGoogleMapsUrl = (
  stops: ScheduledActivity[], 
  userLocation?: UserLocation | null, 
  currentActivityIndex: number = 0
): string => {
  const remainingStops = stops.slice(currentActivityIndex).filter(stop => stop.coords);
  
  if (remainingStops.length === 0) {
    throw new Error('No valid remaining stops with coordinates');
  }

  // If we have user location, start from there
  if (userLocation) {
    const origin = `${userLocation.lat},${userLocation.lon}`;
    
    if (remainingStops.length === 1) {
      // Single destination - direct route from user location
      const stop = remainingStops[0];
      return `https://maps.google.com/maps/dir/${origin}/${stop.coords!.lat},${stop.coords!.lon}`;
    }

    // Multiple destinations - create route from user location through all remaining stops
    let url = `https://maps.google.com/maps/dir/${origin}`;
    
    remainingStops.forEach(stop => {
      url += `/${stop.coords!.lat},${stop.coords!.lon}`;
    });

    return url;
  }

  // Fallback: no user location, just show remaining stops
  if (remainingStops.length === 1) {
    // Single location - just show the location
    const stop = remainingStops[0];
    return `https://maps.google.com/maps?q=${stop.coords!.lat},${stop.coords!.lon}`;
  }

  // Multiple locations - create a route
  const origin = remainingStops[0];
  const destination = remainingStops[remainingStops.length - 1];
  const waypoints = remainingStops.slice(1, -1);

  let url = `https://maps.google.com/maps/dir/${origin.coords!.lat},${origin.coords!.lon}`;
  
  // Add waypoints
  waypoints.forEach(stop => {
    url += `/${stop.coords!.lat},${stop.coords!.lon}`;
  });
  
  // Add destination
  url += `/${destination.coords!.lat},${destination.coords!.lon}`;

  return url;
};

// Generate Apple Maps URL for route (iOS) starting from user location
export const generateAppleMapsUrl = (
  stops: ScheduledActivity[], 
  userLocation?: UserLocation | null, 
  currentActivityIndex: number = 0
): string => {
  const remainingStops = stops.slice(currentActivityIndex).filter(stop => stop.coords);
  
  if (remainingStops.length === 0) {
    throw new Error('No valid remaining stops with coordinates');
  }

  // If we have user location, start from there
  if (userLocation) {
    const destination = remainingStops[0]; // Apple Maps works best with single destination
    return `maps://maps.apple.com/?saddr=${userLocation.lat},${userLocation.lon}&daddr=${destination.coords!.lat},${destination.coords!.lon}&dirflg=d`;
  }

  // Fallback: no user location
  if (remainingStops.length === 1) {
    // Single location
    const stop = remainingStops[0];
    return `maps://maps.apple.com/?q=${stop.coords!.lat},${stop.coords!.lon}`;
  }

  // For multiple locations, Apple Maps doesn't support waypoints as well as Google Maps
  // So we'll create a route from first to last location
  const origin = remainingStops[0];
  const destination = remainingStops[remainingStops.length - 1];

  return `maps://maps.apple.com/?saddr=${origin.coords!.lat},${origin.coords!.lon}&daddr=${destination.coords!.lat},${destination.coords!.lon}&dirflg=d`;
};

// Generate route URL based on device
export const generateRouteUrl = (
  stops: ScheduledActivity[], 
  userLocation?: UserLocation | null, 
  currentActivityIndex: number = 0
): string => {
  if (isMobileDevice() && isIOSDevice()) {
    return generateAppleMapsUrl(stops, userLocation, currentActivityIndex);
  } else {
    return generateGoogleMapsUrl(stops, userLocation, currentActivityIndex);
  }
};

// Open route in external map application
export const openInMaps = (
  stops: ScheduledActivity[], 
  userLocation?: UserLocation | null, 
  currentActivityIndex: number = 0
): void => {
  try {
    const url = generateRouteUrl(stops, userLocation, currentActivityIndex);
    window.open(url, '_blank');
  } catch (error) {
    console.error('Failed to open route in maps:', error);
    alert('Unable to open route in maps. Please ensure you have valid locations.');
  }
};

// Generate a shareable text description of the route
export const generateRouteDescription = (
  stops: ScheduledActivity[], 
  userLocation?: UserLocation | null, 
  currentActivityIndex: number = 0
): string => {
  const remainingStops = stops.slice(currentActivityIndex).filter(stop => stop.coords);
  
  if (remainingStops.length === 0) {
    return 'No valid remaining stops in route';
  }

  let description = 'Daily Routine Route:\n\n';
  
  if (userLocation) {
    description += `Starting from your current location\n`;
  }
  
  remainingStops.forEach((stop, index) => {
    description += `${index + 1}. ${stop.startTime} - ${stop.categoryName}\n`;
    description += `   📍 ${stop.location}\n\n`;
  });

  return description;
};