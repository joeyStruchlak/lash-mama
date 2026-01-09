'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { StickyNote, Plus, X, Bell, Star, Trash2, Edit, Calendar, Clock } from 'lucide-react';
import type { StaffNote } from '@/types/staff-note';
import styles from './StaffNotes.module.css';

export default function StaffNotesPage() {
  const [notes, setNotes] = useState<StaffNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState<StaffNote | null>(null);
  const [staffId, setStaffId] = useState<string>('');
  const [filter, setFilter] = useState<'all' | 'important' | 'reminders'>('all');

  const [formData, setFormData] = useState({
    note_text: '',
    reminder_preset: 'none' as '15min' | '1hour' | '9am' | 'custom' | 'none',
    custom_datetime: '',
    is_important: false,
  });

  useEffect(() => {
    fetchStaffIdAndNotes();
  }, []);

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
      reminder_time: reminderTime?.toISOString() || null,
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
    } catch (err) {
      console.error('Error saving note:', err);
      alert('Failed to save note');
    }
  }

  async function handleDelete(noteId: string) {
    if (!confirm('Delete this note?')) return;

    try {
      const { error } = await supabase
        .from('staff_notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;
      await fetchNotes(staffId);
    } catch (err) {
      console.error('Error deleting note:', err);
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
    <div className={styles.notesContainer}>
      {/* New Note Button */}
      <div className={styles.headerActions}>
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
          className={styles.newNoteButton}
        >
          {showForm ? <X size={20} /> : <Plus size={20} />}
          {showForm ? 'Cancel' : 'New Note'}
        </button>
      </div>

      {/* Note Form */}
      {showForm && (
        <div className={styles.noteFormCard}>
          <h3 className={styles.formTitle}>
            {editingNote ? 'Edit Note' : 'Create New Note'}
          </h3>

          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Note</label>
              <textarea
                className={styles.textarea}
                value={formData.note_text}
                onChange={(e) => setFormData({ ...formData, note_text: e.target.value })}
                placeholder="Write your note here..."
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Set Reminder</label>
              <div className={styles.reminderPresets}>
                {[
                  { value: 'none', label: 'No Reminder' },
                  { value: '15min', label: '15 Minutes' },
                  { value: '1hour', label: '1 Hour' },
                  { value: '9am', label: 'Tomorrow 9 AM' },
                  { value: 'custom', label: 'Custom' },
                ].map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, reminder_preset: preset.value as any })}
                    className={`${styles.presetButton} ${
                      formData.reminder_preset === preset.value ? styles.presetButtonActive : ''
                    }`}
                  >
                    <Bell size={14} />
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

            <div className={styles.formGroup}>
              <label className={styles.checkboxContainer}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={formData.is_important}
                  onChange={(e) => setFormData({ ...formData, is_important: e.target.checked })}
                />
                <span className={styles.checkboxLabel}>
                  <Star size={16} style={{ display: 'inline', marginRight: '4px' }} />
                  Mark as Important
                </span>
              </label>
            </div>

            <div className={styles.formActions}>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingNote(null);
                }}
                className={styles.cancelButton}
              >
                Cancel
              </button>
              <button type="submit" className={styles.saveButton}>
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
          All Notes ({notes.length})
        </button>
        <button
          onClick={() => setFilter('important')}
          className={`${styles.filterTab} ${filter === 'important' ? styles.filterTabActive : ''}`}
        >
          Important ({notes.filter(n => n.is_important).length})
        </button>
        <button
          onClick={() => setFilter('reminders')}
          className={`${styles.filterTab} ${filter === 'reminders' ? styles.filterTabActive : ''}`}
        >
          With Reminders ({notes.filter(n => n.reminder_datetime).length})
        </button>
      </div>

      {/* Notes Grid */}
      <div className={styles.notesGrid}>
        {filteredNotes.length === 0 ? (
          <div className={styles.emptyState}>
            <StickyNote size={64} className={styles.emptyStateIcon} />
            <h3 className={styles.emptyStateTitle}>No notes yet</h3>
            <p className={styles.emptyStateText}>
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
                    className={`${styles.noteActionButton} ${styles.editButton}`}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className={`${styles.noteActionButton} ${styles.deleteButton}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <p className={styles.noteText}>{note.note_text}</p>

              <div className={styles.noteBadges}>
                {note.reminder_datetime && (
                  <div className={styles.reminderBadge}>
                    <Bell size={12} />
                    {new Date(note.reminder_datetime).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </div>
                )}
                {note.is_important && (
                  <div className={styles.importantBadge}>
                    <Star size={12} />
                    Important
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}