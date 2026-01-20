// apps/web/src/features/calendar/hooks/useCalendar.ts

import { useState, useEffect } from 'react';
import { getCurrentUser } from '@/lib/auth';
import { calendarService } from '../services/calendar.service';
import { getDateRange, navigateDate } from '../utils/calendar.helpers';
import { useAppointmentNote } from '@/features/shared/hooks/useAppointmentNote';
import type { CalendarAppointment, CalendarStats } from '../types/calendar.types';

/**
 * useCalendar Hook
 * Manages calendar state, data fetching, and navigation
 */

export function useCalendar() {
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<CalendarAppointment[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week'>('week');
  const [stats, setStats] = useState<CalendarStats>({
    totalAppointments: 0,
    expectedRevenue: 0,
  });
  const [staffId, setStaffId] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<CalendarAppointment | null>(null);
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
   * Fetch calendar data on mount and when dependencies change
   */
  useEffect(() => {
    fetchCalendarData();
  }, [currentDate, viewMode]);

  async function fetchCalendarData() {
    try {
      setLoading(true);

      const user = await getCurrentUser();
      if (!user) {
        console.error('❌ No user found');
        return;
      }

      const userStaffId = await calendarService.getStaffId(user.id);
      if (!userStaffId) {
        console.error('❌ No staff profile found');
        return;
      }

      setStaffId(userStaffId);

      // Get date range for current view
      const { startDate, endDate } = getDateRange(currentDate, viewMode);

      // Fetch appointments
      const appointmentsData = await calendarService.fetchAppointments(
        userStaffId,
        startDate,
        endDate
      );
      setAppointments(appointmentsData);

      // Fetch monthly stats
      const statsData = await calendarService.fetchMonthlyStats(userStaffId, currentDate);
      setStats(statsData);

      console.log('✅ Calendar data loaded');
    } catch (error) {
      console.error('❌ Error fetching calendar:', error);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Navigate to previous/next period
   */
  function navigate(direction: 'prev' | 'next') {
    const newDate = navigateDate(currentDate, direction, viewMode);
    setCurrentDate(newDate);
  }

  /**
   * Go to today
   */
  function goToToday() {
    setCurrentDate(new Date());
  }

  /**
   * Change view mode
   */
  function changeViewMode(mode: 'day' | 'week') {
    setViewMode(mode);
  }

  /**
   * Open appointment modal
   */
  function openAppointmentModal(appointment: CalendarAppointment) {
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
      await fetchCalendarData();
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
    currentDate,
    viewMode,
    stats,
    selectedAppointment,
    showModal,
    note,
    savingNote,
    showSuccessModal,
    showErrorModal,
    errorMessage,

    // Actions
    setCurrentDate,
    navigate,
    goToToday,
    changeViewMode,
    openAppointmentModal,
    closeModal,
    setNote,
    handleSaveNote,
    setShowSuccessModal,
    setShowErrorModal,
  };
}