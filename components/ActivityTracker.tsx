import React from 'react';
import type { RoutineStop, UserLocation } from '../types';
import { MapPinIcon, CheckIcon, SkipIcon, LocationIcon } from './icons';
import { calculateDistance } from '../services/locationService';

interface ActivityTrackerProps {
  routine: RoutineStop[];
  currentActivityIndex: number;
  userLocation: UserLocation | null;
  onActivityComplete: (index: number) => void;
  onActivitySkip: (index: number) => void;
}

const ActivityTracker: React.FC<ActivityTrackerProps> = ({
  routine,
  currentActivityIndex,
  userLocation,
  onActivityComplete,
  onActivitySkip
}) => {
  const currentActivity = routine[currentActivityIndex];
  const isLastActivity = currentActivityIndex === routine.length - 1;
  const completedCount = currentActivityIndex;
  const totalActivities = routine.length;

  // Calculate distance to current activity if both locations are available
  const distanceToActivity = userLocation && currentActivity?.coords
    ? calculateDistance(
        userLocation.lat,
        userLocation.lon,
        currentActivity.coords.lat,
        currentActivity.coords.lon
      )
    : null;

  const formatDistance = (distance: number) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m away`;
    }
    return `${distance.toFixed(1)}km away`;
  };

  const getDistanceColor = (distance: number) => {
    if (distance < 0.1) return 'text-green-400'; // Very close
    if (distance < 0.5) return 'text-yellow-400'; // Close
    return 'text-red-400'; // Far
  };

  if (!currentActivity) {
    return (
      <div className="bg-green-900/50 border border-green-700 rounded-lg p-6 text-center">
        <div className="text-3xl font-bold text-green-400 mb-2">🎉 All Done!</div>
        <p className="text-green-300">You've completed all activities in your routine!</p>
        <div className="mt-4 text-sm text-green-400">
          {totalActivities} activities completed
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-300">Progress</span>
          <span className="text-sm text-gray-400">{completedCount}/{totalActivities}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(completedCount / totalActivities) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Current Activity */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-blue-400">Current Activity</h3>
          <div className="px-3 py-1 bg-blue-600/20 border border-blue-500/50 rounded-full text-blue-300 text-sm">
            {currentActivity.startTime}
          </div>
        </div>

        <div className="bg-gray-700/50 rounded-lg p-4 mb-4">
          <h4 className="text-xl font-semibold text-white mb-2">{currentActivity.categoryName}</h4>
          <div className="flex items-start space-x-2 text-gray-300">
            <MapPinIcon className="w-5 h-5 flex-shrink-0 mt-0.5 text-gray-400" />
            <span className="text-sm">{currentActivity.location}</span>
          </div>
          
          {/* Distance Information */}
          {userLocation && distanceToActivity !== null && (
            <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-gray-600">
              <LocationIcon className="w-4 h-4 text-gray-400" />
              <span className={`text-sm ${getDistanceColor(distanceToActivity)}`}>
                {formatDistance(distanceToActivity)}
              </span>
              {distanceToActivity < 0.1 && (
                <span className="text-xs px-2 py-1 bg-green-600/20 border border-green-500/50 rounded text-green-300">
                  You're here!
                </span>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => onActivityComplete(currentActivityIndex)}
            className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            <CheckIcon className="w-5 h-5" />
            <span>Done</span>
          </button>
          
          <button
            onClick={() => onActivitySkip(currentActivityIndex)}
            className="flex items-center justify-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            <SkipIcon className="w-5 h-5" />
            <span>Skip</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivityTracker;