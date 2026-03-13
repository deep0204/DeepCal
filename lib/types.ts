export interface EventType {
    id: string;
    title: string;
    description: string|null;
    duration: number;
    slug: string;
    color: string;
    isActive: boolean;
    bufferTime:number
  }
  
  export const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  export const TIMEZONES = ['Asia/Kolkata', 'America/New_York', 'Europe/London', 'UTC'];
  
  export interface DateOverride {
    id: string;
    date: string;
    is_available: boolean;
  }
  
  export interface AvailabilitySchedule {
    day_of_week: number;
    start_time: string;
    end_time: string;
    is_available: boolean;
  }
  
  export interface Availability {
    id: string;
    timezone: string;
  }
  export interface Booking {
    id: string;
    event_type: { title: string; color: string; duration: number } | null;
    start_time: string;
    end_time: string;
    guest_name: string;
    guest_email: string;
    guest_notes?: string | null;
    status: 'upcoming' | 'past' | 'cancelled';
    cancellation_reason?: string | null;
  }