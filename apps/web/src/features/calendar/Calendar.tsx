// apps/web/src/features/calendar/Calendar.tsx

'use client';

import { Filter, Plus, Calendar as CalIcon, Grid3x3 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCalendar } from './hooks/useCalendar';
import { MiniCalendar } from './components/MiniCalendar';
import { CalendarStats } from './components/CalendarStats';
import { CalendarWeekView } from './components/CalendarWeekView';
import { CalendarDayView } from './components/CalendarDayView';
import { AppointmentModal } from './components/AppointmentModal';
import { getHeaderText } from './utils/calendar.helpers';
import type { CalendarProps } from './types/calendar.types';
import styles from './Calendar.module.css';

/**
 * Calendar Component
 * Main calendar UI - reusable across Staff/Admin/Manager roles
 */

export function Calendar({ role, staffId, showFilters = true, showNewButton = true }: CalendarProps) {
  const router = useRouter();
  
  const {
    loading,
    appointments,
    currentDate,
    viewMode,
    stats,
    selectedAppointment,
    showModal,
    note,
    savingNote,
    setCurrentDate,
    navigate,
    goToToday,
    changeViewMode,
    openAppointmentModal,
    closeModal,
    setNote,
    saveNote,
  } = useCalendar();

  function handleMessageClient(clientId: string, clientName: string) {
    router.push(`/staff/messages?clientId=${clientId}&clientName=${encodeURIComponent(clientName)}`);
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Left Side: Calendar + Stats */}
      <div className={styles.leftPanel}>
        <div className={styles.calendarHeader}>
          <div>
            <h2 className={styles.calendarTitle}>Calendar</h2>
            <p className={styles.calendarSubtitle}>View and manage all appointments</p>
          </div>
          <div className={styles.headerActions}>
            {showFilters && (
              <button className={styles.filterButton}>
                <Filter size={16} />
                Filter
              </button>
            )}
            {showNewButton && (
              <button className={styles.newAppointmentButton}>
                <Plus size={16} />
                New Appointment
              </button>
            )}
          </div>
        </div>

        {/* Mini Month Calendar */}
        <MiniCalendar
          currentDate={currentDate}
          appointments={appointments}
          onDateSelect={setCurrentDate}
          onNavigate={navigate}
        />

        {/* Stats */}
        <CalendarStats stats={stats} />
      </div>

      {/* Right Side: Week/Day View */}
      <div className={styles.rightPanel}>
        <div className={styles.viewHeader}>
          <h3 className={styles.viewTitle}>{getHeaderText(currentDate, viewMode)}</h3>
          <div className={styles.viewToggle}>
            <button
              onClick={() => changeViewMode('day')}
              className={`${styles.viewToggleButton} ${
                viewMode === 'day' ? styles.viewToggleButtonActive : ''
              }`}
            >
              <CalIcon size={14} />
              Day
            </button>
            <button
              onClick={() => changeViewMode('week')}
              className={`${styles.viewToggleButton} ${
                viewMode === 'week' ? styles.viewToggleButtonActive : ''
              }`}
            >
              <Grid3x3 size={14} />
              Week
            </button>
          </div>
        </div>

        {/* Week View */}
        {viewMode === 'week' && (
          <CalendarWeekView
            currentDate={currentDate}
            appointments={appointments}
            onAppointmentClick={openAppointmentModal}
          />
        )}

        {/* Day View */}
        {viewMode === 'day' && (
          <CalendarDayView
            currentDate={currentDate}
            appointments={appointments}
            onAppointmentClick={openAppointmentModal}
            onMessageClient={handleMessageClient}
          />
        )}
      </div>

      {/* Appointment Detail Modal */}
      {showModal && selectedAppointment && (
        <AppointmentModal
          appointment={selectedAppointment}
          note={note}
          saving={savingNote}
          onNoteChange={setNote}
          onSave={saveNote}
          onClose={closeModal}
          onMessageClient={handleMessageClient}
        />
      )}
    </div>
  );
}