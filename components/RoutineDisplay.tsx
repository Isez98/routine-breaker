
import React, { useState } from 'react';
import type { ScheduledActivity, UserLocation } from '../types';
import { MapPinIcon, ExternalLinkIcon, ShareIcon, EyeIcon, EyeSlashIcon, CheckIcon, SkipIcon, LocationIcon } from './icons';
import InteractiveMap from './InteractiveMap';
import ActivityTracker from './ActivityTracker';
import RoutineList from './RoutineList';
import { openInMaps, generateRouteDescription, isMobileDevice, isIOSDevice } from '../utils/mapUtils';

interface RoutineDisplayProps {
  routine: ScheduledActivity[] | null;
  isLoading: boolean;
  error: string | null;
  userLocation?: UserLocation | null;
  currentActivityIndex?: number;
  showFullList?: boolean;
  onActivityComplete?: (index: number) => void;
  onActivitySkip?: (index: number) => void;
  onToggleFullList?: () => void;
}

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center space-y-4">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
    <p className="text-lg text-gray-300">Generating your new adventure...</p>
    <p className="text-sm text-gray-400">Geocoding locations and drawing map...</p>
  </div>
);

const RoutineDisplay: React.FC<RoutineDisplayProps> = ({ 
  routine, 
  isLoading, 
  error,
  userLocation,
  currentActivityIndex = 0,
  showFullList = true,
  onActivityComplete,
  onActivitySkip,
  onToggleFullList
}) => {
  // Tracking mode is automatically determined by location availability
  const isTrackingMode = Boolean(userLocation);
  
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
          {/* List Toggle (only show when tracking) */}
          {isTrackingMode && (
            <button
              onClick={onToggleFullList}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors duration-200"
            >
              {showFullList ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
              <span>{showFullList ? 'Hide List' : 'Show List'}</span>
            </button>
          )}

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

      {/* Content based on tracking mode */}
      {isTrackingMode ? (
        <div className="space-y-6">
          {/* Activity Tracker */}
          {onActivityComplete && onActivitySkip && (
            <ActivityTracker
              routine={routine}
              currentActivityIndex={currentActivityIndex}
              userLocation={userLocation}
              onActivityComplete={onActivityComplete}
              onActivitySkip={onActivitySkip}
            />
          )}

          {/* Map */}
          <div>
            <h3 className="text-xl font-semibold mb-4 border-b border-gray-600 pb-2">Current Route</h3>
            <InteractiveMap 
              routine={routine} 
              userLocation={userLocation}
              currentActivityIndex={currentActivityIndex}
              isTrackingMode={true}
            />
          </div>

          {/* Full List (toggleable) */}
          {showFullList && (
            <div className="border-t border-gray-600 pt-6">
              <h3 className="text-xl font-semibold mb-4">Full Itinerary</h3>
              <RoutineList 
                routine={routine}
                currentActivityIndex={currentActivityIndex}
                onActivityComplete={onActivityComplete}
                onActivitySkip={onActivitySkip}
              />
            </div>
          )}
        </div>
      ) : (
        /* Regular Mode */
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-4 border-b border-gray-600 pb-2">Itinerary</h3>
            <RoutineList routine={routine} />
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4 border-b border-gray-600 pb-2">Route Map</h3>
            <InteractiveMap routine={routine} />
          </div>
        </div>
      )}
    </div>
  );
};

export default RoutineDisplay;
