// apps/web/src/features/dashboard/Dashboard.tsx

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Calendar } from 'lucide-react';
import { useDashboard } from './hooks/useDashboard';
import { AppointmentCard } from './components/AppointmentCard';
import { AppointmentModal } from '@/features/shared/components/AppointmentModal';
import { SuccessModal } from '@/features/shared/components/SuccessModal';
import { ErrorModal } from '@/features/shared/components/ErrorModal';
import type { DashboardProps } from './types/dashboard.types';
import styles from './Dashboard.module.css';

/**
 * Dashboard Component
 * Today's schedule - reusable across Staff/Admin/Manager roles
 */

export function Dashboard(_props: DashboardProps) {
  const router = useRouter();
  
  const {
    loading,
    appointments,
    selectedAppointment,
    showModal,
    note,
    savingNote,
    showSuccessModal,
    showErrorModal,
    errorMessage,
    openAppointmentModal,
    closeModal,
    setNote,
    handleSaveNote,
    setShowSuccessModal,
    setShowErrorModal,
  } = useDashboard();

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
    <>
      <div className={styles.scheduleCard}>
        <div className={styles.scheduleHeader}>
          <div>
            <h2 className={styles.scheduleTitle}>Today's Schedule</h2>
            <p className={styles.scheduleSubtitle}>Your appointments for today</p>
          </div>
          <Link href="/staff/calendar" className={styles.viewCalendarButton}>
            <Calendar size={16} />
            View Calendar
          </Link>
        </div>

        {appointments.length === 0 ? (
          <div className={styles.emptyState}>
            <Calendar size={48} className={styles.emptyStateIcon} />
            <p className={styles.emptyStateText}>No appointments today</p>
          </div>
        ) : (
          <div className={styles.appointmentsList}>
            {appointments.map((apt) => (
              <AppointmentCard
                key={apt.id}
                appointment={apt}
                onClick={() => openAppointmentModal(apt)}
                onMessageClick={handleMessageClient}
              />
            ))}
          </div>
        )}
      </div>

      {/* Appointment Modal - SHARED */}
      {showModal && selectedAppointment && (
        <AppointmentModal
          appointment={selectedAppointment}
          note={note}
          saving={savingNote}
          onNoteChange={setNote}
          onSave={handleSaveNote}
          onClose={closeModal}
          onMessageClient={handleMessageClient}
        />
      )}

      {/* Success Modal - SHARED */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
      />

      {/* Error Modal - SHARED */}
      <ErrorModal
        isOpen={showErrorModal}
        message={errorMessage}
        onClose={() => setShowErrorModal(false)}
      />
    </>
  );
}