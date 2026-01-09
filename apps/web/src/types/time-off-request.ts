export interface TimeOffRequest {
  id: string;
  staff_id: string;
  start_date: string;
  end_date: string;
  reason: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  approved_by: string | null;
  approved_at: string | null;
  notes: string | null;
}