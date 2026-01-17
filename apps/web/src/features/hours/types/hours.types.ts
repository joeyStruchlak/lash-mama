// apps/web/src/features/hours/types/hours.types.ts

/**
 * Hours/Analytics Types
 * Aligned with Supabase schema: staff, appointments, time_off_requests, staff_milestones
 */

export type TimeOffStatus = 'pending' | 'approved' | 'rejected';

export type GrowthView = 'week' | 'month' | 'year';

export interface StaffProfile {
  id: string;
  name: string;
  title: string;
  total_clients: number;
  rating: number;
  birthday: string;
  specialties: string[];
  avatar_url?: string;
  created_at?: string;
  weekly_schedule?: WeeklySchedule;
}

export interface WeeklySchedule {
  [key: string]: {
    start: string;
    end: string;
  };
}

export interface TimeOffRequest {
  id: string;
  staff_id: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: TimeOffStatus;
  created_at?: string;
}

export interface Milestone {
  id: string;
  staff_id: string;
  title: string;
  date_achieved: string;
  icon: string;
}

export interface WeeklyData {
  day: string;
  clients: number;
  hours: number;
}

export interface GrowthData {
  label: string;
  value: number;
}

export interface ThisWeekStats {
  clientsServed: number;
  hoursWorked: number;
  avgClientsPerDay: number;
}

export interface HoursProps {
  role: 'staff' | 'manager' | 'admin';
  title?: string;
  staffId?: string;
}

export interface TimeOffFormData {
  startDate: string;
  endDate: string;
  reason: string;
}
