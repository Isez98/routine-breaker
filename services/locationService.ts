import type { UserLocation } from '../types';

export const getCurrentLocation = (): Promise<UserLocation> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000, // 10 seconds
      maximumAge: 60000 // 1 minute cache
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLocation: UserLocation = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        };
        resolve(userLocation);
      },
      (error) => {
        let errorMessage = 'Failed to get location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timeout';
            break;
        }
        reject(new Error(errorMessage));
      },
      options
    );
  });
};

export const watchLocation = (
  onLocationUpdate: (location: UserLocation) => void,
  onError: (error: Error) => void
): number => {
  if (!navigator.geolocation) {
    onError(new Error('Geolocation is not supported by this browser'));
    return -1;
  }

  const options: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 30000 // 30 seconds cache for watching
  };

  return navigator.geolocation.watchPosition(
    (position) => {
      const userLocation: UserLocation = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp
      };
      onLocationUpdate(userLocation);
    },
    (error) => {
      let errorMessage = 'Failed to watch location';
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Location access denied by user';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Location information unavailable';
          break;
        case error.TIMEOUT:
          errorMessage = 'Location watch timeout';
          break;
      }
      onError(new Error(errorMessage));
    },
    options
  );
};

export const stopWatchingLocation = (watchId: number): void => {
  if (navigator.geolocation && watchId !== -1) {
    navigator.geolocation.clearWatch(watchId);
  }
};

// Calculate distance between two coordinates (Haversine formula)
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
};