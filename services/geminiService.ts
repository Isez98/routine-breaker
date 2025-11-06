
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
  
  // Generate coordinates around Puerto Peñasco area (or any base location)
  // Puerto Peñasco is approximately at 31.32°N, 113.53°W
  const baseLat = 31.32;
  const baseLon = -113.53;
  
  // Create small variations within a reasonable area (about 10km radius)
  const latVariation = ((hash % 1000) / 1000 - 0.5) * 0.1; // ±0.05 degrees
  const lonVariation = (((hash >> 10) % 1000) / 1000 - 0.5) * 0.1; // ±0.05 degrees
  
  return {
    lat: baseLat + latVariation,
    lon: baseLon + lonVariation
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
