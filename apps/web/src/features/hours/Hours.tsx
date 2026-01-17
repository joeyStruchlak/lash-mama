// apps/web/src/features/hours/Hours.tsx

'use client';

import { useHours } from './hooks/useHours';
import { ProfileHeader } from './components/ProfileHeader';
import { WeeklySchedule } from './components/WeeklySchedule';
import { TimeOffSection } from './components/TimeOffSection';
import { ThisWeekStats } from './components/ThisWeekStats';
import { WeeklyPerformanceChart } from './components/WeeklyPerformanceChart';
import { GrowthChart } from './components/GrowthChart';
import { MilestonesSection } from './components/MilestonesSection';
import { TimeOffModal } from './components/TimeOffModal';
import { AllRequestsModal } from './components/AllRequestsModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { SuccessModal } from './components/SuccessModal';
import type { HoursProps } from './types/hours.types';
import styles from './Hours.module.css';

/**
 * Hours Component
 * Staff hours/analytics dashboard - reusable across Staff/Admin/Manager roles
 */

export function Hours(_props: HoursProps) {
  const {
    loading,
    profile,
    timeOffRequests,
    milestones,
    weeklySchedule,
    thisWeekStats,
    weeklyData,
    growthData,
    weeklyGrowth,
    growthView,
    showTimeOffModal,
    showAllRequestsModal,
    deleteConfirmModal,
    showSuccessModal,
    timeOffForm,
    setShowTimeOffModal,
    setShowAllRequestsModal,
    setShowSuccessModal,
    setTimeOffForm,
    changeGrowthView,
    handleTimeOffRequest,
    handleDeleteRequest,
    openDeleteConfirmation,
    closeDeleteConfirmation,
  } = useHours();

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className={styles.container}>
      {/* Profile Header */}
      <ProfileHeader profile={profile} />

      {/* Main Grid: Schedule + Time Off */}
      <div className={styles.mainGrid}>
        <WeeklySchedule schedule={weeklySchedule} />

        <TimeOffSection
          requests={timeOffRequests}
          onRequestClick={() => setShowTimeOffModal(true)}
          onViewAllClick={() => setShowAllRequestsModal(true)}
          onDeleteClick={openDeleteConfirmation}
        />
      </div>

      {/* Stats & Charts Row */}
      <div className={styles.statsRow}>
        <ThisWeekStats stats={thisWeekStats} weeklyGrowth={weeklyGrowth} />

        <WeeklyPerformanceChart data={weeklyData} />
      </div>

      {/* Growth & Milestones Row */}
      <div className={styles.bottomRow}>
        <GrowthChart data={growthData} view={growthView} onViewChange={changeGrowthView} />

        <MilestonesSection milestones={milestones} />
      </div>

      {/* Modals */}
      <TimeOffModal
        isOpen={showTimeOffModal}
        formData={timeOffForm}
        onFormChange={setTimeOffForm}
        onSubmit={handleTimeOffRequest}
        onClose={() => setShowTimeOffModal(false)}
      />

      <AllRequestsModal
        isOpen={showAllRequestsModal}
        requests={timeOffRequests}
        onClose={() => setShowAllRequestsModal(false)}
        onDeleteClick={openDeleteConfirmation}
      />

      <DeleteConfirmModal
        isOpen={deleteConfirmModal !== null}
        onConfirm={() => {
          if (deleteConfirmModal) handleDeleteRequest(deleteConfirmModal);
        }}
        onCancel={closeDeleteConfirmation}
      />

      <SuccessModal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} />
    </div>
  );
}
