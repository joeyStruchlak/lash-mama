/**
 * Notes Service - Supabase Database Operations
 * All database queries isolated in service layer
 */

import { supabase } from '@/lib/supabase';
import type { Note, NoteFormData } from '../types/notes.types';

export const notesService = {
  /**
   * Get staff ID from authenticated user
   */
  async getStaffId(): Promise<string | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: staffData } = await supabase
        .from('staff')
        .select('id')
        .eq('user_id', user.id)
        .single();

      return staffData?.id || null;
    } catch (error) {
      console.error('Error fetching staff ID:', error);
      return null;
    }
  },

  /**
   * Fetch all notes for a staff member
   */
  async fetchNotes(staffId: string): Promise<Note[]> {
    try {
      const { data, error } = await supabase
        .from('staff_notes')
        .select('*')
        .eq('staff_id', staffId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching notes:', error);
      throw error;
    }
  },

  /**
   * Create a new note
   */
  async createNote(
    staffId: string,
    formData: NoteFormData,
    reminderTime: Date | null
  ): Promise<void> {
    try {
      const noteData = {
        staff_id: staffId,
        note_text: formData.note_text,
        reminder_datetime: reminderTime?.toISOString() || null,
        is_important: formData.is_important,
      };

      const { error } = await supabase.from('staff_notes').insert([noteData]);

      if (error) throw error;
    } catch (error) {
      console.error('Error creating note:', error);
      throw error;
    }
  },

  /**
   * Update an existing note
   */
  async updateNote(
    noteId: string,
    staffId: string,
    formData: NoteFormData,
    reminderTime: Date | null
  ): Promise<void> {
    try {
      const noteData = {
        staff_id: staffId,
        note_text: formData.note_text,
        reminder_datetime: reminderTime?.toISOString() || null,
        is_important: formData.is_important,
      };

      const { error } = await supabase.from('staff_notes').update(noteData).eq('id', noteId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  },

  /**
   * Delete a note
   */
  async deleteNote(noteId: string): Promise<void> {
    try {
      const { error } = await supabase.from('staff_notes').delete().eq('id', noteId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  },

  /**
   * Get notes with due reminders
   */
  async getDueReminders(staffId: string): Promise<Note[]> {
    try {
      const now = new Date();

      const { data, error } = await supabase
        .from('staff_notes')
        .select('*')
        .eq('staff_id', staffId)
        .not('reminder_datetime', 'is', null)
        .eq('reminder_sent', false)
        .lte('reminder_datetime', now.toISOString());

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching due reminders:', error);
      return [];
    }
  },

  /**
   * Mark reminder as sent
   */
  async markReminderSent(noteId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('staff_notes')
        .update({ reminder_sent: true })
        .eq('id', noteId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking reminder as sent:', error);
      throw error;
    }
  },
};
