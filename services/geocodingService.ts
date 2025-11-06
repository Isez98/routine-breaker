
import type { Coordinates, RoutineStop } from '../types';

// Simple hash function to generate consistent coordinates from address strings
const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
};

// Generate mock coordinates based on address string (consistent for same address)
const generateMockCoordinates = (address: string): Coordinates => {
  const hash = hashString(address.toLowerCase());
  
  // Puerto Peñasco city bounds (staying within the urban area to avoid water)
  // These coordinates ensure we stay within the actual city limits
  const cityBounds = {
    minLat: 31.315,  // Southern edge of the city
    maxLat: 31.335,  // Northern edge of the city  
    minLon: -113.545, // Eastern edge (closer to land)
    maxLon: -113.525  // Western edge (but not too far west to avoid water)
  };
  
  // Generate coordinates within the city bounds
  const latRange = cityBounds.maxLat - cityBounds.minLat;
  const lonRange = cityBounds.maxLon - cityBounds.minLon;
  
  // Use hash to generate consistent coordinates within bounds
  const latOffset = (hash % 1000) / 1000; // 0 to 1
  const lonOffset = ((hash >> 10) % 1000) / 1000; // 0 to 1
  
  return {
    lat: cityBounds.minLat + (latOffset * latRange),
    lon: cityBounds.minLon + (lonOffset * lonRange)
  };
};

export const geocodeAddresses = async (addresses: string[]): Promise<(Coordinates | null)[]> => {
  // Simulate API delay for realistic feel
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return addresses.map(address => {
    if (!address || address.trim() === '') {
      return null;
    }
    
    try {
      return generateMockCoordinates(address);
    } catch (error) {
      console.error(`Failed to generate coordinates for address: ${address}`, error);
      return null;
    }
  });
};
