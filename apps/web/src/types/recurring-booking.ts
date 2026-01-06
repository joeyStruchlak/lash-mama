export interface RecurringBooking {
  id: string;
  user_id: string;
  service_id: string;
  staff_id: string;
  start_date: string;
  end_date: string | null; // null = indefinite
  frequency: 'weekly' | 'bi-weekly' | 'monthly';
  appointment_time: string;
  total_appointments_generated: number;
  is_active: boolean;
  created_by: string; // Admin user_id
  created_at: string;
  updated_at: string;
}

export interface RecurringBookingFormData {
  user_id: string;
  service_id: string;
  staff_id: string;
  start_date: string;
  frequency: 'weekly' | 'bi-weekly' | 'monthly';
  duration: '6months' | '12months' | 'indefinite';
  appointment_time: string;
}