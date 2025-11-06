
import React from 'react';
import type { Category, Activity } from '../types';
import { PlusIcon, TrashIcon, MapPinIcon } from './icons';

interface CategoryCardProps {
  category: Category;
  onUpdate: (updatedCategory: Category) => void;
  onDelete: (categoryId: string) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onUpdate, onDelete }) => {
  
  const handleCategoryChange = (field: keyof Category, value: any) => {
    onUpdate({ ...category, [field]: value });
  };

  const handleTimeRangeChange = (field: 'start' | 'end', value: string) => {
    onUpdate({ 
      ...category, 
      timeRange: { 
        ...category.timeRange, 
        [field]: value 
      } 
    });
  };

  const handleActivityChange = (activityId: string, location: string) => {
    const updatedActivities = category.activities.map(act =>
      act.id === activityId ? { ...act, location } : act
    );
    onUpdate({ ...category, activities: updatedActivities });
  };

  const addActivity = () => {
    const newActivity: Activity = { id: `act-${category.id}-${Date.now()}`, location: '' };
    onUpdate({ ...category, activities: [...category.activities, newActivity] });
  };

  const deleteActivity = (activityId: string) => {
    const updatedActivities = category.activities.filter(act => act.id !== activityId);
    onUpdate({ ...category, activities: updatedActivities });
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 shadow-lg border border-gray-700 w-full">
      {/* Category Header */}
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          value={category.name}
          onChange={(e) => handleCategoryChange('name', e.target.value)}
          placeholder="Category Name (e.g., Gym)"
          className="bg-transparent text-xl font-bold border-b-2 border-gray-600 focus:border-blue-500 outline-none flex-1 mr-4"
        />
        <button
          onClick={() => onDelete(category.id)}
          className="text-red-400 hover:text-red-300 p-1"
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Time Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Duration (minutes)</label>
          <input
            type="number"
            value={category.activityDuration}
            onChange={(e) => handleCategoryChange('activityDuration', parseInt(e.target.value) || 0)}
            min="5"
            max="480"
            step="5"
            className="w-full bg-gray-700 p-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
          />
        </div>

        {/* Repetitions */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Repetitions</label>
          <input
            type="number"
            value={category.repetitions}
            onChange={(e) => handleCategoryChange('repetitions', parseInt(e.target.value) || 1)}
            min="1"
            max="10"
            className="w-full bg-gray-700 p-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
          />
        </div>
      </div>

      {/* Time Range */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">Available Time Range</label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-400 mb-1">From</label>
            <input
              type="time"
              value={category.timeRange.start}
              onChange={(e) => handleTimeRangeChange('start', e.target.value)}
              className="w-full bg-gray-700 p-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">To</label>
            <input
              type="time"
              value={category.timeRange.end}
              onChange={(e) => handleTimeRangeChange('end', e.target.value)}
              className="w-full bg-gray-700 p-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white text-sm"
            />
          </div>
        </div>
      </div>

      {/* Allow Consecutive */}
      <div className="mb-4">
        <label className="flex items-center space-x-2 text-sm text-gray-300">
          <input
            type="checkbox"
            checked={category.allowConsecutive || false}
            onChange={(e) => handleCategoryChange('allowConsecutive', e.target.checked)}
            className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
          />
          <span>Allow consecutive repetitions</span>
        </label>
      </div>

      {/* Activities Section */}
      <div className="border-t border-gray-600 pt-4">
        <h4 className="text-lg font-semibold mb-3 text-gray-200">Locations</h4>
        <div className="space-y-3">
          {category.activities.map((activity) => (
            <div key={activity.id} className="flex items-center space-x-2">
              <MapPinIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                value={activity.location}
                onChange={(e) => handleActivityChange(activity.id, e.target.value)}
                placeholder="Enter location address"
                className="flex-1 bg-gray-700 p-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white text-sm"
              />
              {category.activities.length > 1 && (
                <button
                  onClick={() => deleteActivity(activity.id)}
                  className="text-red-400 hover:text-red-300 p-1 flex-shrink-0"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={addActivity}
          className="mt-3 w-full flex items-center justify-center space-x-2 bg-green-600/20 hover:bg-green-600/40 text-green-300 font-medium py-2 px-3 rounded-md border border-green-500/50 transition-all duration-200 text-sm"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Add Location</span>
        </button>
      </div>
    </div>
  );
};

export default CategoryCard;
