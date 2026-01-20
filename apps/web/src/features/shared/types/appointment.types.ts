// apps/web/src/features/shared/types/appointment.types.ts

/**
 * Shared Appointment Types
 * Used across Dashboard, Calendar, and other features
 */

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface SharedAppointment {
  id: string;
  user_id: string;
  staff_id: string;
  service_id: string;
  appointment_date: string;
  appointment_time: string;
  status: AppointmentStatus;
  total_price: number;
  notes?: string;
  created_at?: string;

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
}