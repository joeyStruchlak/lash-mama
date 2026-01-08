export interface ExclusiveSlot {
  id: string;
  staff_id: string;
  slot_date: string;
  slot_time: string;
  is_available: boolean;
  max_bookings: number;
  current_bookings: number;
  created_at: string;
}