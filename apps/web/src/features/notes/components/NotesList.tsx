/**
 * NotesList Component
 * List display of notes with empty state
 */

'use client';

import { StickyNote } from 'lucide-react';
import { NoteCard } from './NoteCard';
import type { NotesListProps } from '../types/notes.types';
import styles from '../Notes.module.css';

export function NotesList({ notes, filter, onEdit, onDelete }: NotesListProps) {
  if (notes.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>
          <StickyNote size={64} />
        </div>
        <h3 className={styles.emptyTitle}>No notes yet</h3>
        <p className={styles.emptyText}>
          {filter === 'all' && 'Create your first note to get started'}
          {filter === 'important' && 'No important notes found'}
          {filter === 'reminders' && 'No reminders set'}
        </p>
      </div>
    );
  }

  return (
    <div className={styles.notesList}>
      {notes.map((note) => (
        <NoteCard key={note.id} note={note} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}
