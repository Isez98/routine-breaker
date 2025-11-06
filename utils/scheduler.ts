import type { Category, ScheduledActivity, TimeSlot, TimeRange } from '../types';

// Time utilities
export const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

export const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

export const addMinutesToTime = (time: string, minutesToAdd: number): string => {
  const totalMinutes = timeToMinutes(time) + minutesToAdd;
  return minutesToTime(totalMinutes);
};

// Check if a time is within a range
export const isTimeInRange = (time: string, range: TimeRange): boolean => {
  const timeMinutes = timeToMinutes(time);
  const startMinutes = timeToMinutes(range.start);
  const endMinutes = timeToMinutes(range.end);
  
  // Handle ranges that cross midnight
  if (startMinutes > endMinutes) {
    return timeMinutes >= startMinutes || timeMinutes <= endMinutes;
  }
  
  return timeMinutes >= startMinutes && timeMinutes <= endMinutes;
};

// Generate available time slots for a category
export const generateAvailableSlots = (
  category: Category,
  occupiedSlots: TimeSlot[],
  slotInterval: number = 15 // 15-minute intervals
): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const startMinutes = timeToMinutes(category.timeRange.start);
  const endMinutes = timeToMinutes(category.timeRange.end);
  
  // Handle time ranges that cross midnight
  const actualEndMinutes = endMinutes <= startMinutes ? endMinutes + 24 * 60 : endMinutes;
  
  // Use smaller intervals for repeated activities to give more options
  const actualInterval = category.repetitions > 1 ? Math.min(slotInterval, 10) : slotInterval;
  
  for (let minutes = startMinutes; minutes + category.activityDuration <= actualEndMinutes; minutes += actualInterval) {
    const slotStart = minutesToTime(minutes % (24 * 60));
    const slotEnd = addMinutesToTime(slotStart, category.activityDuration);
    
    // Check if this slot conflicts with any occupied slots
    const isOccupied = occupiedSlots.some(occupied => {
      const occupiedStart = timeToMinutes(occupied.start);
      const occupiedEnd = timeToMinutes(occupied.end);
      const slotStartMinutes = timeToMinutes(slotStart);
      const slotEndMinutes = timeToMinutes(slotEnd);
      
      // Check for overlap with some buffer time
      const bufferMinutes = 5; // 5-minute buffer between activities
      return (slotStartMinutes < occupiedEnd + bufferMinutes && 
              slotEndMinutes > occupiedStart - bufferMinutes);
    });
    
    if (!isOccupied) {
      slots.push({
        start: slotStart,
        end: slotEnd,
        duration: category.activityDuration,
        isOccupied: false
      });
    }
  }
  
  return slots;
};

// Distribute repetitions evenly across the time range
export const distributeRepetitions = (
  availableSlots: TimeSlot[],
  repetitions: number,
  allowConsecutive: boolean = false
): TimeSlot[] => {
  if (repetitions <= 0 || availableSlots.length === 0) {
    return [];
  }
  
  if (repetitions === 1) {
    // For single repetition, pick a random slot
    const randomIndex = Math.floor(Math.random() * availableSlots.length);
    return [availableSlots[randomIndex]];
  }
  
  // For multiple repetitions, ensure proper distribution and spacing
  const selectedSlots: TimeSlot[] = [];
  const minimumGapMinutes = allowConsecutive ? 0 : 90; // At least 1.5 hours apart if not consecutive
  
  // Calculate optimal spacing
  const totalTimeSpan = timeToMinutes(availableSlots[availableSlots.length - 1].start) - 
                       timeToMinutes(availableSlots[0].start);
  const idealGap = Math.max(minimumGapMinutes, Math.floor(totalTimeSpan / repetitions));
  
  // First slot - pick from first third of available slots
  const firstThirdEnd = Math.floor(availableSlots.length / 3);
  const firstSlotIndex = Math.floor(Math.random() * Math.max(1, firstThirdEnd));
  selectedSlots.push(availableSlots[firstSlotIndex]);
  
  // Distribute remaining repetitions
  for (let i = 1; i < repetitions; i++) {
    const lastSelectedTime = timeToMinutes(selectedSlots[selectedSlots.length - 1].end);
    
    // Find slots that are at least the ideal gap away from the last selected
    const validSlots = availableSlots.filter(slot => {
      const slotTime = timeToMinutes(slot.start);
      const timeDifference = slotTime - lastSelectedTime;
      
      // Must be at least the minimum gap away
      if (timeDifference < minimumGapMinutes) {
        return false;
      }
      
      // Check if this slot conflicts with any already selected slots
      return !selectedSlots.some(selected => {
        const selectedStart = timeToMinutes(selected.start);
        const selectedEnd = timeToMinutes(selected.end);
        const currentStart = timeToMinutes(slot.start);
        const currentEnd = timeToMinutes(slot.end);
        
        // Check for any overlap or too close timing
        return (currentStart < selectedEnd + minimumGapMinutes && 
                currentEnd > selectedStart - minimumGapMinutes);
      });
    });
    
    if (validSlots.length > 0) {
      // Prefer slots that are closer to the ideal gap
      const slotsWithScore = validSlots.map(slot => {
        const slotTime = timeToMinutes(slot.start);
        const timeDifference = slotTime - lastSelectedTime;
        const score = Math.abs(timeDifference - idealGap);
        return { slot, score };
      });
      
      // Sort by score (lower is better) and pick from the best options
      slotsWithScore.sort((a, b) => a.score - b.score);
      const bestSlots = slotsWithScore.slice(0, Math.max(1, Math.floor(slotsWithScore.length * 0.3)));
      const randomBestIndex = Math.floor(Math.random() * bestSlots.length);
      selectedSlots.push(bestSlots[randomBestIndex].slot);
    } else if (availableSlots.length > selectedSlots.length) {
      // Fallback: find any slot that doesn't overlap
      const nonOverlappingSlots = availableSlots.filter(slot => {
        return !selectedSlots.some(selected => {
          const selectedStart = timeToMinutes(selected.start);
          const selectedEnd = timeToMinutes(selected.end);
          const currentStart = timeToMinutes(slot.start);
          const currentEnd = timeToMinutes(slot.end);
          
          return (currentStart < selectedEnd && currentEnd > selectedStart);
        });
      });
      
      if (nonOverlappingSlots.length > 0) {
        const randomIndex = Math.floor(Math.random() * nonOverlappingSlots.length);
        selectedSlots.push(nonOverlappingSlots[randomIndex]);
      }
    }
  }
  
  return selectedSlots;
};

// Main scheduling function
export const scheduleActivities = (categories: Category[]): ScheduledActivity[] => {
  const scheduledActivities: ScheduledActivity[] = [];
  const occupiedSlots: TimeSlot[] = [];
  
  // Sort categories by number of repetitions (MORE repetitions first for better placement)
  // This ensures repeated activities get the best time slots before single activities
  const sortedCategories = [...categories].sort((a, b) => {
    // First prioritize by repetitions (descending)
    if (b.repetitions !== a.repetitions) {
      return b.repetitions - a.repetitions;
    }
    // Then by activity duration (longer activities first)
    return b.activityDuration - a.activityDuration;
  });
  
  for (const category of sortedCategories) {
    if (category.activities.length === 0) continue;
    
    // Generate available slots for this category
    const availableSlots = generateAvailableSlots(category, occupiedSlots);
    
    if (availableSlots.length === 0) {
      console.warn(`No available slots for category: ${category.name}`);
      continue;
    }
    
    // Distribute repetitions across available slots
    const selectedSlots = distributeRepetitions(
      availableSlots,
      category.repetitions,
      category.allowConsecutive || false
    );
    
    // Create scheduled activities for each selected slot
    selectedSlots.forEach((slot, repetitionIndex) => {
      // Randomly select an activity from the category
      const randomActivity = category.activities[Math.floor(Math.random() * category.activities.length)];
      
      const scheduledActivity: ScheduledActivity = {
        categoryName: category.name,
        activityId: randomActivity.id,
        location: randomActivity.location,
        startTime: slot.start,
        endTime: slot.end,
        duration: category.activityDuration,
        repetitionIndex
      };
      
      scheduledActivities.push(scheduledActivity);
      
      // Mark this slot as occupied
      occupiedSlots.push({
        start: slot.start,
        end: slot.end,
        duration: slot.duration,
        isOccupied: true,
        occupiedBy: category.id
      });
    });
  }
  
  // Sort by start time
  return scheduledActivities.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
};