import React from 'react';
import { ScheduledActivity } from '../types';
import { MapPinIcon, CheckIcon, SkipIcon } from './icons';

interface RoutineListProps {
  routine: ScheduledActivity[];
  currentActivityIndex?: number;
  onActivityComplete?: (index: number) => void;
  onActivitySkip?: (index: number) => void;
}

export default function RoutineList({ 
  routine, 
  currentActivityIndex,
  onActivityComplete,
  onActivitySkip 
}: RoutineListProps) {
  const getActivityStatus = (index: number) => {
    if (currentActivityIndex === undefined) return 'upcoming';
    if (index < currentActivityIndex) return 'completed';
    if (index === currentActivityIndex) return 'current';
    return 'upcoming';
  };

  const getActivityStyles = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-700/50 border-l-4 border-green-500 opacity-75';
      case 'current':
        return 'bg-orange-600/50 border-l-4 border-orange-400 ring-2 ring-orange-400/30';
      case 'upcoming':
      default:
        return 'bg-gray-700/50 border-l-4 border-gray-600';
    }
  };

  const getTimeStyles = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400 line-through';
      case 'current':
        return 'text-orange-400 font-bold';
      case 'upcoming':
      default:
        return 'text-blue-400';
    }
  };

  return (
    <ul className="space-y-4">
      {routine.map((stop, index) => {
        const status = getActivityStatus(index);
        
        return (
          <li 
            key={index} 
            className={`flex items-start space-x-4 p-4 rounded-md transition-all duration-300 ${getActivityStyles(status)}`}
          >
            <div className="flex flex-col items-center min-w-0">
              <span className={`text-lg font-bold ${getTimeStyles(status)}`}>
                {stop.startTime}
              </span>
              {index < routine.length - 1 && (
                <div className="w-px h-8 bg-gray-600 my-2"></div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className={`font-semibold text-lg ${status === 'completed' ? 'line-through' : ''}`}>
                {stop.categoryName}
              </p>
              <p className={`text-gray-300 flex items-center ${status === 'completed' ? 'line-through' : ''}`}>
                <MapPinIcon className="w-4 h-4 mr-2 flex-shrink-0"/>
                {stop.location}
              </p>
              {stop.duration && (
                <p className={`text-sm text-gray-400 mt-1 ${status === 'completed' ? 'line-through' : ''}`}>
                  Duration: {stop.duration} minutes
                </p>
              )}
            </div>

            {/* Action buttons for tracking mode */}
            {status === 'current' && onActivityComplete && onActivitySkip && (
              <div className="flex flex-col space-y-2 ml-4">
                <button
                  onClick={() => onActivityComplete(index)}
                  className="flex items-center space-x-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded transition-colors duration-200"
                >
                  <CheckIcon className="w-4 h-4" />
                  <span>Done</span>
                </button>
                <button
                  onClick={() => onActivitySkip(index)}
                  className="flex items-center space-x-1 px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded transition-colors duration-200"
                >
                  <SkipIcon className="w-4 h-4" />
                  <span>Skip</span>
                </button>
              </div>
            )}

            {/* Status indicators */}
            {status === 'completed' && (
              <div className="flex items-center justify-center w-8 h-8 bg-green-600 rounded-full ml-4">
                <CheckIcon className="w-5 h-5 text-white" />
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}