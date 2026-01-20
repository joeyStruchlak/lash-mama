/**
 * Notes Feature - Main Orchestrator
 * Coordinates all note components and handles UI flow
 */

'use client';

import { Plus, X } from 'lucide-react';
import { useNotes } from './hooks/useNotes';
import { FilterTabs } from './components/FilterTabs';
import { NotesList } from './components/NotesList';
import { NoteFormModal } from './components/NoteFormModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { SuccessModal } from './components/SuccessModal';
import styles from './Notes.module.css';

export function Notes() {
  const {
    loading,
    filter,
    setFilter,
    showForm,
    setShowForm,
    editingNote,
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
  } = useNotes();

  // Loading state
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
      </div>
    );
  }

  return (
    <div className={styles.notesContainer}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Notes & Reminders</h1>
          <p className={styles.subtitle}>Keep track of important information and set reminders</p>
        </div>
        <button
          onClick={() => {
            if (showForm) {
              setShowForm(false);
            } else {
              handleCreateNote();
            }
          }}
          className={styles.newNoteBtn}
        >
          {showForm ? <X size={20} /> : <Plus size={20} />}
          {showForm ? 'Cancel' : 'New Note'}
        </button>
      </div>

      {/* Note Form */}
      {showForm && (
        <NoteFormModal
          isOpen={showForm}
          editingNote={editingNote}
          onClose={() => setShowForm(false)}
          onSave={handleSaveNote}
        />
      )}

      {/* Main Card */}
      <div className={styles.card}>
        {/* Filter Tabs */}
        <FilterTabs
          filter={filter}
          onFilterChange={setFilter}
          counts={counts}
        />

        {/* Notes List */}
        <NotesList
          notes={filteredNotes}
          filter={filter}
          onEdit={handleEditNote}
          onDelete={handleDeleteNote}
        />
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        title={successMessage.title}
        message={successMessage.text}
        onClose={() => setShowSuccessModal(false)}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}