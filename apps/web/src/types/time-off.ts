export interface TimeOffRequest {
  id: string;
  staff_id: string;
  staff_name?: string; // Joined from staff table
  staff_email?: string; // Joined from staff table
  start_date: string;
  end_date: string;
  reason: string;
  status: 'pending' | 'approved' | 'declined';
  reviewed_by?: string; // Admin user_id who reviewed
  reviewed_by_name?: string; // Admin name
  review_notes?: string | null;
  reviewed_at?: string | null;
  created_at: string;
}

export interface TimeOffFormData {
  start_date: string;
  end_date: string;
  reason: string;
}