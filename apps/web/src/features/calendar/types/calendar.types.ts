// apps/web/src/features/calendar/types/calendar.types.ts

/**
 * Calendar Types
 * Aligned with Supabase schema: appointments table
 */

export type CalendarView = 'day' | 'week' | 'month' | 'list';

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export type CalendarRole = 'staff' | 'manager' | 'admin';

export interface CalendarAppointment {
  id: string;
  user_id: string;
  staff_id: string;
  service_id: string;
  appointment_date: string;
  appointment_time: string;
  status: AppointmentStatus;
  total_price: number;
  notes?: string;
  can_reschedule?: boolean;
  discount_applied?: number;
  discount_type?: string;
  recurring_booking_id?: string;
  created_at?: string;
  updated_at?: string;

  // Joined data
  user?: {
    full_name: string;
    avatar_url?: string;
    is_vip?: boolean;
    vip_streak?: number;
    referral_count?: number;
    birthday?: string;
    created_at?: string;
  };
  service?: {
    name: string;
    duration: string;
  };
  staff?: {
    name: string;
  };
}

export interface CalendarStats {
  totalAppointments: number;
  expectedRevenue: number;
  todayCount?: number;
  weekCount?: number;
}

export interface CalendarFilters {
  showVIPOnly?: boolean;
  showConfirmedOnly?: boolean;
  staffId?: string;
  searchTerm?: string;
}

export interface CalendarProps {
  role: CalendarRole;
  staffId?: string;
  showFilters?: boolean;
  showNewButton?: boolean;
}

export interface AppointmentNote {
  appointment_id: string;
  staff_id: string;
  note: string;
  updated_at: string;
}
