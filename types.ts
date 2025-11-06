
export interface Activity {
  id: string;
  location: string;
}

export interface TimeRange {
  start: string; // Format: "HH:MM" (24-hour)
  end: string;   // Format: "HH:MM" (24-hour)
}

export interface Category {
  id: string;
  name: string;
  activities: Activity[];
  activityDuration: number; // Duration in minutes
  timeRange: TimeRange;     // Available time range for this category
  repetitions: number;      // How many times this activity should occur (default: 1)
  allowConsecutive?: boolean; // Whether consecutive repetitions are allowed (default: false)
}

export interface Coordinates {
  lat: number;
  lon: number;
}

export interface ScheduledActivity {
  categoryName: string;
  activityId: string;
  location: string;
  startTime: string; // Format: "HH:MM"
  endTime: string;   // Format: "HH:MM"
  duration: number;  // Duration in minutes
  coords?: Coordinates;
  repetitionIndex?: number; // Which repetition this is (0-based)
  isCompleted?: boolean;    // Whether this activity has been completed
  isSkipped?: boolean;      // Whether this activity has been skipped
}

export interface UserLocation {
  lat: number;
  lon: number;
  accuracy?: number;
  timestamp?: number;
}

export interface RoutineTracker {
  currentActivityIndex: number;
  isTrackingMode: boolean;
  showFullList: boolean;
  userLocation: UserLocation | null;
}

export interface TimeSlot {
  start: string; // Format: "HH:MM"
  end: string;   // Format: "HH:MM"
  duration: number; // Duration in minutes
  isOccupied: boolean;
  occupiedBy?: string; // Category ID if occupied
}

// Legacy types for backward compatibility during transition
export interface RoutineStop {
  categoryName: string;
  time: string;
  location: string;
  coords?: Coordinates;
}
