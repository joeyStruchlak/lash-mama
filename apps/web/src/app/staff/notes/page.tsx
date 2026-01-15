'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { createNotification } from '@/lib/notifications';
import { StickyNote, Plus, X, Bell, Star, Trash2, Edit2, Calendar } from 'lucide-react';
import type { StaffNote } from '@/types/staff-note';
import styles from './Notes.module.css';

export default function StaffNotesPage() {
  const [notes, setNotes] = useState<StaffNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState<StaffNote | null>(null);
  const [staffId, setStaffId] = useState<string>('');
  const [filter, setFilter] = useState<'all' | 'important' | 'reminders'>('all');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState({ title: '', text: '' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    note_text: '',
    reminder_preset: 'none' as '15min' | '1hour' | '9am' | 'custom' | 'none',
    custom_datetime: '',
    is_important: false,
  });

  useEffect(() => {
    fetchStaffIdAndNotes();
  }, []);
  // Check for due reminders every 30 seconds
  useEffect(() => {
    if (!staffId) {
      return;
    }

    // Check immediately on mount
    checkAndSendReminders();

    // Then check every 30 seconds
    const interval = setInterval(() => {
      checkAndSendReminders();
    }, 30000); // 30 seconds

    return () => {
      clearInterval(interval);
    };
  }, [staffId]);
  async function fetchStaffIdAndNotes() {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: staffData } = await supabase
        .from('staff')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!staffData) {
        alert('Staff record not found');
        return;
      }

      setStaffId(staffData.id);
      await fetchNotes(staffData.id);

    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchNotes(staffId: string) {
    try {
      const { data, error } = await supabase
        .from('staff_notes')
        .select('*')
        .eq('staff_id', staffId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (err) {
      console.error('Error fetching notes:', err);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    let reminderTime = null;

    if (formData.reminder_preset !== 'none') {
      const now = new Date();
      if (formData.reminder_preset === '15min') {
        reminderTime = new Date(now.getTime() + 15 * 60000);
      } else if (formData.reminder_preset === '1hour') {
        reminderTime = new Date(now.getTime() + 60 * 60000);
      } else if (formData.reminder_preset === '9am') {
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(9, 0, 0, 0);
        reminderTime = tomorrow;
      } else if (formData.reminder_preset === 'custom' && formData.custom_datetime) {
        reminderTime = new Date(formData.custom_datetime);
      }
    }

    const noteData = {
      staff_id: staffId,
      note_text: formData.note_text,
      reminder_datetime: reminderTime?.toISOString() || null,
      is_important: formData.is_important,
    };

    try {
      if (editingNote) {
        const { error } = await supabase
          .from('staff_notes')
          .update(noteData)
          .eq('id', editingNote.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('staff_notes')
          .insert([noteData]);

        if (error) throw error;
      }

      await fetchNotes(staffId);
      setShowForm(false);
      setEditingNote(null);
      setFormData({
        note_text: '',
        reminder_preset: 'none',
        custom_datetime: '',
        is_important: false,
      });

      // Show success modal
      setSuccessMessage({
        title: editingNote ? 'Note Updated!' : 'Note Created!',
        text: editingNote
          ? 'Your note has been successfully updated.'
          : 'Your note has been successfully created.'
      });

      setShowSuccessModal(true);
    } catch (err) {
      console.error('Error saving note:', err);
      alert('Failed to save note');
    }
  }

  async function handleDelete(noteId: string) {
    setDeletingNoteId(noteId);
    setShowDeleteModal(true);
  }

  async function confirmDelete() {
    if (!deletingNoteId) return;

    try {
      const { error } = await supabase
        .from('staff_notes')
        .delete()
        .eq('id', deletingNoteId);

      if (error) throw error;

      await fetchNotes(staffId);
      setShowDeleteModal(false);
      setDeletingNoteId(null);

      // Show success modal
      setSuccessMessage({
        title: 'Note Deleted!',
        text: 'Your note has been successfully deleted.'
      });
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Error deleting note:', err);
      alert('Failed to delete note');
    }
  }

  function handleEdit(note: StaffNote) {
    setEditingNote(note);
    setFormData({
      note_text: note.note_text,
      reminder_preset: 'none',
      custom_datetime: '',
      is_important: note.is_important || false,
    });
    setShowForm(true);
  }

  async function checkAndSendReminders() {

    if (!staffId) {
      return;
    }

    try {
      const now = new Date();

      // Get current user_id for database notifications
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return;
      }

      // Get all notes with reminders that haven't been sent yet
      const { data: dueNotes, error } = await supabase
        .from('staff_notes')
        .select('*')
        .eq('staff_id', staffId)
        .not('reminder_datetime', 'is', null)
        .eq('reminder_sent', false)
        .lte('reminder_datetime', now.toISOString());

      if (error) {
        throw error;
      }

      if (dueNotes && dueNotes.length > 0) {
        for (const note of dueNotes) {

          // Create in-app notification (shows in notification bell)
          await createNotification({
            user_id: user.id,
            type: 'reminder',
            title: '📝 Note Reminder',
            message: note.note_text.length > 100
              ? note.note_text.substring(0, 100) + '...'
              : note.note_text,
          });

          // Mark as sent in database
          await supabase
            .from('staff_notes')
            .update({ reminder_sent: true })
            .eq('id', note.id);
        }

        // Refresh notes to show updated state
        await fetchNotes(staffId);
      } else {
      }
    } catch (err) {
      console.error('❌ Error checking reminders:', err);
    }
  }

  const filteredNotes = notes.filter(note => {
    if (filter === 'important') return note.is_important;
    if (filter === 'reminders') return note.reminder_datetime;
    return true;
  });

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Notes & Reminders</h1>
          <p className={styles.subtitle}>Keep track of important information and set reminders</p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingNote(null);
            setFormData({
              note_text: '',
              reminder_preset: 'none',
              custom_datetime: '',
              is_important: false,
            });
          }}
          className={styles.newNoteBtn}
        >
          {showForm ? <X size={20} /> : <Plus size={20} />}
          {showForm ? 'Cancel' : 'New Note'}
        </button>
      </div>

      {/* Note Form */}
      {showForm && (
        <div className={styles.formCard}>
          <h3 className={styles.formTitle}>
            {editingNote ? 'Edit Note' : 'Create New Note'}
          </h3>

          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Note</label>
              <textarea
                className={styles.textarea}
                value={formData.note_text}
                onChange={(e) => setFormData({ ...formData, note_text: e.target.value })}
                placeholder="Write your note here..."
                rows={4}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Set Reminder</label>
              <div className={styles.reminderGrid}>
                {[
                  { value: 'none', label: 'No Reminder', icon: null },
                  { value: '15min', label: '15 Minutes', icon: Bell },
                  { value: '1hour', label: '1 Hour', icon: Bell },
                  { value: '9am', label: 'Tomorrow 9 AM', icon: Bell },
                  { value: 'custom', label: 'Custom', icon: Calendar },
                ].map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, reminder_preset: preset.value as any })}
                    className={`${styles.presetBtn} ${formData.reminder_preset === preset.value ? styles.presetBtnActive : ''
                      }`}
                  >
                    {preset.icon && <preset.icon size={16} />}
                    {preset.label}
                  </button>
                ))}
              </div>

              {formData.reminder_preset === 'custom' && (
                <input
                  type="datetime-local"
                  className={styles.datetimeInput}
                  value={formData.custom_datetime}
                  onChange={(e) => setFormData({ ...formData, custom_datetime: e.target.value })}
                />
              )}
            </div>

            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={formData.is_important}
                onChange={(e) => setFormData({ ...formData, is_important: e.target.checked })}
              />
              <Star size={16} />
              Mark as Important
            </label>

            <div className={styles.formActions}>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingNote(null);
                }}
                className={styles.cancelBtn}
              >
                Cancel
              </button>
              <button type="submit" className={styles.saveBtn}>
                {editingNote ? 'Update Note' : 'Save Note'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Tabs */}
      <div className={styles.filterTabs}>
        <button
          onClick={() => setFilter('all')}
          className={`${styles.filterTab} ${filter === 'all' ? styles.filterTabActive : ''}`}
        >
          All Notes
          <span className={styles.filterCount}>{notes.length}</span>
        </button>
        <button
          onClick={() => setFilter('important')}
          className={`${styles.filterTab} ${filter === 'important' ? styles.filterTabActive : ''}`}
        >
          <Star size={16} />
          Important
          <span className={styles.filterCount}>{notes.filter(n => n.is_important).length}</span>
        </button>
        <button
          onClick={() => setFilter('reminders')}
          className={`${styles.filterTab} ${filter === 'reminders' ? styles.filterTabActive : ''}`}
        >
          <Bell size={16} />
          Reminders
          <span className={styles.filterCount}>{notes.filter(n => n.reminder_datetime).length}</span>
        </button>
      </div>

      {/* Notes Grid */}
      <div className={styles.notesGrid}>
        {filteredNotes.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <StickyNote size={64} />
            </div>
            <h3 className={styles.emptyTitle}>No notes yet</h3>
            <p className={styles.emptyText}>
              Create your first note to get started
            </p>
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div
              key={note.id}
              className={`${styles.noteCard} ${note.is_important ? styles.noteCardImportant : ''}`}
            >
              <div className={styles.noteHeader}>
                <div className={styles.noteDate}>
                  <Calendar size={14} />
                  {new Date(note.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>

                <div className={styles.noteActions}>
                  <button
                    onClick={() => handleEdit(note)}
                    className={styles.actionBtn}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className={`${styles.actionBtn} ${styles.deleteBtn}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <p className={styles.noteText}>{note.note_text}</p>

              {(note.reminder_datetime || note.is_important) && (
                <div className={styles.noteBadges}>
                  {note.reminder_datetime && (
                    <div className={`${styles.reminderBadge} ${note.reminder_sent ? styles.reminderSent : ''}`}>
                      <Bell size={12} />
                      {new Date(note.reminder_datetime).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                      {note.reminder_sent && (
                        <span className={styles.sentLabel}>Sent</span>
                      )}
                    </div>
                  )}
                  {note.is_important && (
                    <div className={styles.importantBadge}>
                      <Star size={12} />
                      Important
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className={styles.modalOverlay} onClick={() => setShowSuccessModal(false)}>
          <div className={styles.successModalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.successConfetti}>
              <div className={styles.confettiPiece}></div>
              <div className={styles.confettiPiece}></div>
              <div className={styles.confettiPiece}></div>
              <div className={styles.confettiPiece}></div>
              <div className={styles.confettiPiece}></div>
              <div className={styles.confettiPiece}></div>
            </div>

            <div className={styles.successModalIcon}>
              <div className={styles.successIconCircle}>
                <StickyNote size={56} />
              </div>
            </div>

            <h3 className={styles.successModalTitle}>{successMessage.title}</h3>
            <p className={styles.successModalText}>{successMessage.text}</p>

            <button
              onClick={() => setShowSuccessModal(false)}
              className={styles.successOkButton}
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className={styles.modalOverlay} onClick={() => setShowDeleteModal(false)}>
          <div className={styles.deleteModalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.deleteModalIcon}>
              <div className={styles.deleteIconCircle}>
                <Trash2 size={48} />
              </div>
            </div>

            <h3 className={styles.deleteModalTitle}>Delete Note?</h3>
            <p className={styles.deleteModalText}>
              Are you sure you want to delete this note? This action cannot be undone.
            </p>

            <div className={styles.deleteModalActions}>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingNoteId(null);
                }}
                className={styles.deleteCancelButton}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className={styles.deleteConfirmButton}
              >
                Delete Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}