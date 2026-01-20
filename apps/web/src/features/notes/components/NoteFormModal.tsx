/**
 * NoteFormModal Component
 * Form for creating and editing notes with reminder options
 */

'use client';

import { useState, useEffect } from 'react';
import { Bell, Star, Calendar } from 'lucide-react';
import type { NoteFormModalProps, ReminderPreset } from '../types/notes.types';
import styles from '../Notes.module.css';

export function NoteFormModal({ isOpen, editingNote, onClose, onSave }: NoteFormModalProps) {
  const [formData, setFormData] = useState({
    note_text: '',
    reminder_preset: 'none' as ReminderPreset,
    custom_datetime: '',
    is_important: false,
  });

  // Populate form when editing
  useEffect(() => {
    if (editingNote) {
      setFormData({
        note_text: editingNote.note_text,
        reminder_preset: 'none',
        custom_datetime: '',
        is_important: editingNote.is_important || false,
      });
    } else {
      setFormData({
        note_text: '',
        reminder_preset: 'none',
        custom_datetime: '',
        is_important: false,
      });
    }
  }, [editingNote, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  if (!isOpen) return null;

  const reminderPresets = [
    { value: 'none' as const, label: 'No Reminder', icon: null },
    { value: '15min' as const, label: '15 Minutes', icon: Bell },
    { value: '1hour' as const, label: '1 Hour', icon: Bell },
    { value: '9am' as const, label: 'Tomorrow 9 AM', icon: Bell },
    { value: 'custom' as const, label: 'Custom', icon: Calendar },
  ];

  return (
    <div className={styles.formCard}>
      <h3 className={styles.formTitle}>
        {editingNote ? 'Edit Note' : 'Create New Note'}
      </h3>

      <form onSubmit={handleSubmit}>
        {/* Note Text */}
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

        {/* Reminder Presets */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Set Reminder</label>
          <div className={styles.reminderGrid}>
            {reminderPresets.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => setFormData({ ...formData, reminder_preset: preset.value })}
                className={`${styles.presetBtn} ${formData.reminder_preset === preset.value ? styles.presetBtnActive : ''}`}
              >
                {preset.icon && <preset.icon size={16} />}
                {preset.label}
              </button>
            ))}
          </div>

          {/* Custom Datetime Input */}
          {formData.reminder_preset === 'custom' && (
            <input
              type="datetime-local"
              className={styles.datetimeInput}
              value={formData.custom_datetime}
              onChange={(e) => setFormData({ ...formData, custom_datetime: e.target.value })}
            />
          )}
        </div>

        {/* Important Checkbox */}
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

        {/* Form Actions */}
        <div className={styles.formActions}>
          <button
            type="button"
            onClick={onClose}
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
  );
}