/**
 * Notes Feature - TypeScript Types
 * Aligned with Supabase staff_notes table schema
 */

export type ReminderPreset = '15min' | '1hour' | '9am' | 'custom' | 'none';

export type NoteFilter = 'all' | 'important' | 'reminders';

export interface Note {
  id: string;
  staff_id: string;
  note_text: string;
  reminder_datetime: string | null;
  reminder_sent: boolean;
  is_important: boolean;
  created_at: string;
  updated_at: string;
}

export interface NoteFormData {
  note_text: string;
  reminder_preset: ReminderPreset;
  custom_datetime: string;
  is_important: boolean;
}

export interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (noteId: string) => void;
}

export interface NotesListProps {
  notes: Note[];
  filter: NoteFilter;
  onEdit: (note: Note) => void;
  onDelete: (noteId: string) => void;
}

export interface FilterTabsProps {
  filter: NoteFilter;
  onFilterChange: (filter: NoteFilter) => void;
  counts: {
    all: number;
    important: number;
    reminders: number;
  };
}

export interface NoteFormModalProps {
  isOpen: boolean;
  editingNote: Note | null;
  onClose: () => void;
  onSave: (formData: NoteFormData) => Promise<void>;
}

export interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export interface SuccessModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
}