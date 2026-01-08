export interface StaffNote {
  id: string;
  staff_id: string;
  note_text: string;
  reminder_datetime: string | null;
  reminder_preset: '15min' | '1hour' | '9am' | 'custom' | 'none' | null;
  reminder_sent: boolean;
  is_important: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateStaffNoteData {
  staff_id: string;
  note_text: string;
  reminder_datetime?: string | null;
  reminder_preset?: '15min' | '1hour' | '9am' | 'custom' | 'none';
  is_important?: boolean;
}