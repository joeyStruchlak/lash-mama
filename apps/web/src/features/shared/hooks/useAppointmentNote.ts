// apps/web/src/features/shared/hooks/useAppointmentNote.ts

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * useAppointmentNote Hook
 * Shared logic for managing appointment notes across Dashboard and Calendar
 */

export function useAppointmentNote() {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  /**
   * Save appointment note
   */
  async function saveAppointmentNote(appointmentId: string, note: string): Promise<void> {
    try {
      console.log('💾 Saving note:', { appointmentId, note });

      const { data, error } = await supabase
        .from('appointments')
        .update({ notes: note })
        .eq('id', appointmentId)
        .select();

      console.log('📊 Update result:', { data, error });

      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error('Update affected 0 rows');
      }

      console.log('✅ Note saved successfully');

      // Show success modal
      setShowSuccessModal(true);

      // Auto-close success modal after 3 seconds
      setTimeout(() => {
        setShowSuccessModal(false);
      }, 3000);
    } catch (error) {
      console.error('❌ Error saving note:', error);

      // Show error modal
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to save note. Please try again.'
      );
      setShowErrorModal(true);

      throw error;
    }
  }

  return {
    // State
    showSuccessModal,
    showErrorModal,
    errorMessage,

    // Actions
    saveAppointmentNote,
    setShowSuccessModal,
    setShowErrorModal,
  };
}