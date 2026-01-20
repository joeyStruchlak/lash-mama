/**
 * useNotes Hook - Main State Management & Orchestration
 * Handles all CRUD operations, reminders, and UI state
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { createNotification } from '@/lib/notifications';
import { supabase } from '@/lib/supabase';
import { notesService } from '../services/notes.service';
import { calculateReminderTime, filterNotes, calculateFilterCounts, truncateNoteText } from '../utils/notes.helpers';
import type { Note, NoteFormData, NoteFilter } from '../types/notes.types';

export function useNotes() {
  // State
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [staffId, setStaffId] = useState<string>('');
  const [filter, setFilter] = useState<NoteFilter>('all');
  
  // UI State
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState({ title: '', text: '' });

  // Derived state
  const filteredNotes = filterNotes(notes, filter);
  const counts = calculateFilterCounts(notes);

  /**
   * Initialize: Fetch staff ID and notes
   */
  useEffect(() => {
    async function initialize() {
      try {
        setLoading(true);
        const id = await notesService.getStaffId();
        
        if (!id) {
          console.error('Staff record not found');
          return;
        }

        setStaffId(id);
        await loadNotes(id);
      } catch (error) {
        console.error('Error initializing notes:', error);
      } finally {
        setLoading(false);
      }
    }

    initialize();
  }, []);

  /**
   * Check for due reminders every 30 seconds
   */
  useEffect(() => {
    if (!staffId) return;

    // Check immediately
    checkAndSendReminders();

    // Then check every 30 seconds
    const interval = setInterval(checkAndSendReminders, 30000);
    return () => clearInterval(interval);
  }, [staffId]);

  /**
   * Load notes from database
   */
  const loadNotes = useCallback(async (id: string) => {
    try {
      const data = await notesService.fetchNotes(id);
      setNotes(data);
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  }, []);

  /**
   * Check for due reminders and send notifications
   */
  const checkAndSendReminders = useCallback(async () => {
    if (!staffId) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const dueNotes = await notesService.getDueReminders(staffId);

      if (dueNotes.length > 0) {
        for (const note of dueNotes) {
          // Create in-app notification
          await createNotification({
            user_id: user.id,
            type: 'reminder',
            title: '📝 Note Reminder',
            message: truncateNoteText(note.note_text),
          });

          // Mark as sent
          await notesService.markReminderSent(note.id);
        }

        // Refresh notes
        await loadNotes(staffId);
      }
    } catch (error) {
      console.error('Error checking reminders:', error);
    }
  }, [staffId, loadNotes]);

  /**
   * Handle create new note
   */
  const handleCreateNote = useCallback(() => {
    setShowForm(true);
    setEditingNote(null);
  }, []);

  /**
   * Handle edit existing note
   */
  const handleEditNote = useCallback((note: Note) => {
    setEditingNote(note);
    setShowForm(true);
  }, []);

  /**
   * Handle save note (create or update)
   */
  const handleSaveNote = useCallback(async (formData: NoteFormData) => {
    if (!staffId) return;

    try {
      const reminderTime = calculateReminderTime(formData.reminder_preset, formData.custom_datetime);

      if (editingNote) {
        await notesService.updateNote(editingNote.id, staffId, formData, reminderTime);
      } else {
        await notesService.createNote(staffId, formData, reminderTime);
      }

      await loadNotes(staffId);
      setShowForm(false);
      setEditingNote(null);

      // Show success modal
      setSuccessMessage({
        title: editingNote ? 'Note Updated!' : 'Note Created!',
        text: editingNote
          ? 'Your note has been successfully updated.'
          : 'Your note has been successfully created.'
      });
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error saving note:', error);
      throw error;
    }
  }, [staffId, editingNote, loadNotes]);

  /**
   * Handle delete note (show confirmation)
   */
  const handleDeleteNote = useCallback((noteId: string) => {
    setDeletingNoteId(noteId);
    setShowDeleteModal(true);
  }, []);

  /**
   * Confirm delete note
   */
  const confirmDelete = useCallback(async () => {
    if (!deletingNoteId || !staffId) return;

    try {
      await notesService.deleteNote(deletingNoteId);
      await loadNotes(staffId);
      
      setShowDeleteModal(false);
      setDeletingNoteId(null);

      // Show success modal
      setSuccessMessage({
        title: 'Note Deleted!',
        text: 'Your note has been successfully deleted.'
      });
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  }, [deletingNoteId, staffId, loadNotes]);

  return {
    notes,
    loading,
    filter,
    setFilter,
    showForm,
    setShowForm,
    editingNote,
    setEditingNote,
    handleCreateNote,
    handleEditNote,
    handleSaveNote,
    handleDeleteNote,
    confirmDelete,
    showDeleteModal,
    setShowDeleteModal,
    showSuccessModal,
    setShowSuccessModal,
    successMessage,
    filteredNotes,
    counts,
  };
}