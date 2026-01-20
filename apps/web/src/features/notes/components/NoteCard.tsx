/**
 * NoteCard Component
 * Displays individual note with actions (edit/delete) and badges
 */

'use client';

import { Calendar, Edit2, Trash2, Star, Bell } from 'lucide-react';
import { formatNoteDate, formatReminderDateTime } from '../utils/notes.helpers';
import type { NoteCardProps } from '../types/notes.types';
import styles from '../Notes.module.css';

export function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  return (
    <div
      className={`${styles.noteCard} ${note.is_important ? styles.noteCardImportant : ''}`}
    >
      {/* Header */}
      <div className={styles.noteHeader}>
        <div className={styles.noteDate}>
          <Calendar size={14} />
          {formatNoteDate(note.created_at)}
        </div>

        <div className={styles.noteActions}>
          <button
            onClick={() => onEdit(note)}
            className={styles.actionBtn}
            aria-label="Edit note"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => onDelete(note.id)}
            className={`${styles.actionBtn} ${styles.deleteBtn}`}
            aria-label="Delete note"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Note Text */}
      <p className={styles.noteText}>{note.note_text}</p>

      {/* Badges */}
      {(note.reminder_datetime || note.is_important) && (
        <div className={styles.noteBadges}>
          {note.reminder_datetime && (
            <div className={`${styles.reminderBadge} ${note.reminder_sent ? styles.reminderSent : ''}`}>
              <Bell size={12} />
              {formatReminderDateTime(note.reminder_datetime)}
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
  );
}