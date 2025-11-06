
import React, { useState, useEffect, useCallback } from 'react';
import type { Category, ScheduledActivity, UserLocation } from './types';
import { INITIAL_CATEGORIES } from './constants';
import { geocodeAddresses } from './services/geocodingService';
import { getCurrentLocation, watchLocation } from './services/locationService';
import { scheduleActivities } from './utils/scheduler';
import CategoryCard from './components/CategoryCard';
import RoutineDisplay from './components/RoutineDisplay';
import { PlusIcon, SparklesIcon } from './components/icons';

const App: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [randomizedRoutine, setRandomizedRoutine] = useState<ScheduledActivity[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Tracking state
  const [currentActivityIndex, setCurrentActivityIndex] = useState<number>(0);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  
  useEffect(() => {
    try {
      const savedCategories = localStorage.getItem('routine-categories');
      console.log('Saved categories from localStorage:', savedCategories);
      if (savedCategories) {
        const parsed = JSON.parse(savedCategories);
        console.log('Parsed categories:', parsed);
        setCategories(parsed);
      } else {
        console.log('No saved categories, loading INITIAL_CATEGORIES:', INITIAL_CATEGORIES);
        setCategories(INITIAL_CATEGORIES);
      }
    } catch (e) {
      console.error("Failed to load categories from localStorage", e);
      console.log('Loading INITIAL_CATEGORIES as fallback:', INITIAL_CATEGORIES);
      setCategories(INITIAL_CATEGORIES);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('routine-categories', JSON.stringify(categories));
    } catch (e) {
      console.error("Failed to save categories to localStorage", e);
    }
  }, [categories]);

  // Auto-start location tracking on app load
  useEffect(() => {
    const startLocationTracking = async () => {
      try {
        const location = await getCurrentLocation();
        setUserLocation(location);
        
        // Start watching location for continuous updates
        const watchId = watchLocation(
          setUserLocation,
          (error) => console.error('Location watch error:', error)
        );
        
        // Cleanup function to stop watching location
        return () => {
          if (navigator.geolocation) {
            navigator.geolocation.clearWatch(watchId);
          }
        };
      } catch (error) {
        console.log('Location not available, continuing without tracking:', error);
        // App will work in regular mode without location
      }
    };

    startLocationTracking();
  }, []);

  const addCategory = () => {
    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      name: '',
      activityDuration: 30,
      timeRange: { start: '09:00', end: '17:00' },
      repetitions: 1,
      allowConsecutive: false,
      activities: [{ id: `act-new-${Date.now()}`, location: '' }],
    };
    setCategories([...categories, newCategory]);
  };

  const resetToInitialData = () => {
    localStorage.removeItem('routine-categories');
    setCategories(INITIAL_CATEGORIES);
    console.log('Reset to initial categories:', INITIAL_CATEGORIES);
  };
  
  const updateCategory = useCallback((updatedCategory: Category) => {
    setCategories(prev => prev.map(cat => cat.id === updatedCategory.id ? updatedCategory : cat));
  }, []);

  const deleteCategory = useCallback((categoryId: string) => {
    setCategories(prev => prev.filter(cat => cat.id !== categoryId));
  }, []);

  const handleActivityComplete = useCallback((index: number) => {
    if (!randomizedRoutine) return;
    
    // Mark activity as completed
    const updatedRoutine = [...randomizedRoutine];
    updatedRoutine[index] = { ...updatedRoutine[index], isCompleted: true };
    setRandomizedRoutine(updatedRoutine);
    
    // Move to next activity
    if (index + 1 < updatedRoutine.length) {
      setCurrentActivityIndex(index + 1);
    }
  }, [randomizedRoutine]);

  const handleActivitySkip = useCallback((index: number) => {
    if (!randomizedRoutine) return;
    
    // Mark activity as skipped
    const updatedRoutine = [...randomizedRoutine];
    updatedRoutine[index] = { ...updatedRoutine[index], isSkipped: true };
    setRandomizedRoutine(updatedRoutine);
    
    // Move to next activity
    if (index + 1 < updatedRoutine.length) {
      setCurrentActivityIndex(index + 1);
    }
  }, [randomizedRoutine]);

  const handleRandomize = async () => {
    setIsLoading(true);
    setError(null);
    setRandomizedRoutine(null);

    try {
      const validCategories = categories.filter(cat => 
        cat.name.trim() && 
        cat.activities.some(act => act.location.trim()) &&
        cat.activityDuration > 0 &&
        cat.repetitions > 0
      );
      
      if (validCategories.length === 0) {
        throw new Error("Please add at least one category with valid locations and duration to generate a routine.");
      }
      
      // Use the new scheduling system
      const scheduledActivities: ScheduledActivity[] = scheduleActivities(validCategories);
      
      if (scheduledActivities.length === 0) {
        throw new Error("Unable to schedule any activities. Please check your time ranges and durations.");
      }

      // Geocode addresses and add coordinates to activities
      const addressesToGeocode = scheduledActivities.map(activity => activity.location);
      const coordinates = await geocodeAddresses(addressesToGeocode);

      const routineWithCoords: ScheduledActivity[] = scheduledActivities.map((activity, index) => ({
        ...activity,
        coords: coordinates[index] ?? undefined,
      }));
      
      setRandomizedRoutine(routineWithCoords);
      
      // Auto-route to first activity if location tracking is available
      if (userLocation && routineWithCoords.length > 0) {
        setCurrentActivityIndex(0); // Start from the first activity
      }

    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            Daily Routine Randomizer
          </h1>
          <p className="mt-2 text-lg text-gray-400">Craft your perfect day, one random adventure at a time.</p>
        </header>

        <main>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">Your Categories</h2>
            {console.log('Current categories state:', categories)}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {categories.map(cat => (
                <CategoryCard
                  key={cat.id}
                  category={cat}
                  onUpdate={updateCategory}
                  onDelete={deleteCategory}
                />
              ))}
            </div>
            <div className="mt-6 flex gap-4">
              <button
                  onClick={addCategory}
                  className="flex-1 flex items-center justify-center space-x-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 font-semibold py-3 px-4 rounded-lg border border-blue-500/50 transition-all duration-300"
              >
                  <PlusIcon className="w-5 h-5" />
                  <span>Add New Category</span>
              </button>
              <button
                  onClick={resetToInitialData}
                  className="flex items-center justify-center space-x-2 bg-red-600/20 hover:bg-red-600/40 text-red-300 font-semibold py-3 px-4 rounded-lg border border-red-500/50 transition-all duration-300"
              >
                  <span>Reset to Initial Data</span>
              </button>
            </div>
          </div>

          <div className="flex justify-center my-8">
            <button 
                onClick={handleRandomize}
                disabled={isLoading}
                className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
            >
              <SparklesIcon className="w-6 h-6"/>
              <span className="text-lg">{isLoading ? 'Generating...' : 'Randomize My Day!'}</span>
            </button>
          </div>

          <RoutineDisplay 
            routine={randomizedRoutine} 
            isLoading={isLoading} 
            error={error}
            currentActivityIndex={currentActivityIndex}
            userLocation={userLocation}
            onActivityComplete={handleActivityComplete}
            onActivitySkip={handleActivitySkip}
          />
        </main>
        
        <footer className="text-center mt-12 text-gray-500 text-sm">
            <p>Powered by React, Tailwind CSS, and Gemini API.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
