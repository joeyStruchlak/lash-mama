/**
 * Notes Utilities - Pure Helper Functions
 * Date formatting, reminder calculations, filtering
 */

import type { Note, NoteFilter, ReminderPreset } from '../types/notes.types';

/**
 * Calculate reminder datetime based on preset
 */
export function calculateReminderTime(preset: ReminderPreset, customDatetime: string): Date | null {
  if (preset === 'none') return null;

  const now = new Date();

  switch (preset) {
    case '15min':
      return new Date(now.getTime() + 15 * 60000);
    
    case '1hour':
      return new Date(now.getTime() + 60 * 60000);
    
    case '9am':
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);
      return tomorrow;
    
    case 'custom':
      return customDatetime ? new Date(customDatetime) : null;
    
    default:
      return null;
  }
}

/**
 * Format date for display
 */
export function formatNoteDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Format reminder datetime for display
 */
export function formatReminderDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

/**
 * Filter notes based on filter type
 */
export function filterNotes(notes: Note[], filter: NoteFilter): Note[] {
  switch (filter) {
    case 'important':
      return notes.filter(note => note.is_important);
    
    case 'reminders':
      return notes.filter(note => note.reminder_datetime);
    
    case 'all':
    default:
      return notes;
  }
}

/**
 * Calculate filter counts
 */
export function calculateFilterCounts(notes: Note[]) {
  return {
    all: notes.length,
    important: notes.filter(n => n.is_important).length,
    reminders: notes.filter(n => n.reminder_datetime).length,
  };
}

/**
 * Truncate note text for notification display
 */
export function truncateNoteText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}