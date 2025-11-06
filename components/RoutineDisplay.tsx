
import React from 'react';
import type { RoutineStop } from '../types';
import { MapPinIcon, ExternalLinkIcon, ShareIcon } from './icons';
import InteractiveMap from './InteractiveMap';
import { openInMaps, generateRouteDescription, isMobileDevice, isIOSDevice } from '../utils/mapUtils';

interface RoutineDisplayProps {
  routine: RoutineStop[] | null;
  isLoading: boolean;
  error: string | null;
}

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center space-y-4">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
    <p className="text-lg text-gray-300">Generating your new adventure...</p>
    <p className="text-sm text-gray-400">Geocoding locations and drawing map...</p>
  </div>
);

const RoutineDisplay: React.FC<RoutineDisplayProps> = ({ routine, isLoading, error }) => {
  const handleOpenInMaps = () => {
    if (routine) {
      openInMaps(routine);
    }
  };

  const handleShareRoute = async () => {
    if (routine) {
      const description = generateRouteDescription(routine);
      
      if (navigator.share) {
        // Use native sharing if available (mobile)
        try {
          await navigator.share({
            title: 'My Daily Routine',
            text: description,
          });
        } catch (err) {
          console.log('Sharing cancelled or failed');
        }
      } else {
        // Fallback to clipboard
        try {
          await navigator.clipboard.writeText(description);
          alert('Route details copied to clipboard!');
        } catch (err) {
          console.error('Failed to copy to clipboard:', err);
          alert('Unable to copy route details.');
        }
      }
    }
  };

  const getMapButtonText = () => {
    if (isMobileDevice()) {
      return isIOSDevice() ? 'Open in Apple Maps' : 'Open in Google Maps';
    }
    return 'Open in Google Maps';
  };
  if (isLoading) {
    return (
      <div className="mt-8 bg-gray-800 p-8 rounded-lg border border-gray-700 shadow-xl w-full flex justify-center items-center h-96">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8 bg-red-900/50 p-6 rounded-lg border border-red-700 text-red-300 w-full">
        <h3 className="font-bold text-lg mb-2">An Error Occurred</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (!routine) {
    return null;
  }

  return (
    <div className="mt-8 bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-xl w-full">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-blue-400 mb-4 sm:mb-0">Your Randomized Routine</h2>
        <div className="flex space-x-3">
          <button
            onClick={handleOpenInMaps}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
          >
            <ExternalLinkIcon className="w-4 h-4" />
            <span>{getMapButtonText()}</span>
          </button>
          <button
            onClick={handleShareRoute}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200"
          >
            <ShareIcon className="w-4 h-4" />
            <span>Share Route</span>
          </button>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-8">
        <div>
            <h3 className="text-xl font-semibold mb-4 border-b border-gray-600 pb-2">Itinerary</h3>
            <ul className="space-y-4">
            {routine.map((stop, index) => (
                <li key={index} className="flex items-start space-x-4 p-3 bg-gray-700/50 rounded-md">
                <div className="flex flex-col items-center">
                    <span className="text-xl font-bold text-blue-400">{stop.time}</span>
                    <div className="w-px h-full bg-gray-600 my-1"></div>
                </div>
                <div>
                    <p className="font-semibold text-lg">{stop.categoryName}</p>
                    <p className="text-gray-300 flex items-center"><MapPinIcon className="w-4 h-4 mr-2"/>{stop.location}</p>
                </div>
                </li>
            ))}
            </ul>
        </div>
        <div>
            <h3 className="text-xl font-semibold mb-4 border-b border-gray-600 pb-2">Route Map</h3>
            <InteractiveMap routine={routine} />
        </div>
      </div>
    </div>
  );
};

export default RoutineDisplay;
