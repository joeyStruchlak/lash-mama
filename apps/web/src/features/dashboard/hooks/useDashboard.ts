// apps/web/src/features/dashboard/hooks/useDashboard.ts

import { useState, useEffect } from 'react';
import { getCurrentUser } from '@/lib/auth';
import { dashboardService } from '../services/dashboard.service';
import { useAppointmentNote } from '@/features/shared/hooks/useAppointmentNote';
import type { DashboardAppointment } from '../types/dashboard.types';

/**
 * useDashboard Hook
 * Manages dashboard state and data fetching
 */

export function useDashboard() {
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<DashboardAppointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<DashboardAppointment | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [note, setNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  // Use shared appointment note hook
  const {
    showSuccessModal,
    showErrorModal,
    errorMessage,
    saveAppointmentNote,
    setShowSuccessModal,
    setShowErrorModal,
  } = useAppointmentNote();

  /**
   * Fetch dashboard data on mount
   */
  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      setLoading(true);
      console.log('📊 Fetching dashboard data...');

      const user = await getCurrentUser();
      if (!user) {
        console.error('❌ No user found');
        return;
      }

      const staffId = await dashboardService.getStaffId(user.id);
      if (!staffId) {
        console.error('❌ No staff profile found');
        alert('Staff profile not found');
        return;
      }

      // Fetch today's appointments
      const appointmentsData = await dashboardService.fetchTodaysAppointments(staffId);
      setAppointments(appointmentsData);

      console.log('✅ Dashboard data loaded:', appointmentsData.length, 'appointments');
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Open appointment modal
   */
  function openAppointmentModal(appointment: DashboardAppointment) {
    setSelectedAppointment(appointment);
    setNote(appointment.notes || '');
    setShowModal(true);
  }

  /**
   * Close modal
   */
  function closeModal() {
    setShowModal(false);
    setSelectedAppointment(null);
    setNote('');
  }

  /**
   * Save appointment note
   */
  async function handleSaveNote() {
    if (!selectedAppointment) return;

    try {
      setSavingNote(true);
      await saveAppointmentNote(selectedAppointment.id, note);
      
      // Close main modal
      closeModal();
      
      // Refresh data
      await fetchDashboardData();
    } catch (error) {
      // Error modal already shown by useAppointmentNote hook
    } finally {
      setSavingNote(false);
    }
  }

  return {
    // State
    loading,
    appointments,
    selectedAppointment,
    showModal,
    note,
    savingNote,
    showSuccessModal,
    showErrorModal,
    errorMessage,

    // Actions
    openAppointmentModal,
    closeModal,
    setNote,
    handleSaveNote,
    setShowSuccessModal,
    setShowErrorModal,
  };
}