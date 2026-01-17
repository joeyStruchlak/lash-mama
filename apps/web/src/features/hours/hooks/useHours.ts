// apps/web/src/features/hours/hooks/useHours.ts

import { useState, useEffect } from 'react';
import { getCurrentUser } from '@/lib/auth';
import { hoursService } from '../services/hours.service';
import type {
  StaffProfile,
  TimeOffRequest,
  Milestone,
  WeeklyData,
  GrowthData,
  ThisWeekStats,
  GrowthView,
  TimeOffFormData,
  WeeklySchedule,
} from '../types/hours.types';

/**
 * useHours Hook
 * Manages hours/analytics state and data fetching
 */

export function useHours() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<StaffProfile | null>(null);
  const [timeOffRequests, setTimeOffRequests] = useState<TimeOffRequest[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule>({
    Monday: { start: '9:00 AM', end: '6:00 PM' },
    Tuesday: { start: '9:00 AM', end: '6:00 PM' },
    Wednesday: { start: '10:00 AM', end: '4:00 PM' },
    Thursday: { start: '9:00 AM', end: '6:00 PM' },
    Friday: { start: '9:00 AM', end: '6:00 PM' },
  });
  const [thisWeekStats, setThisWeekStats] = useState<ThisWeekStats>({
    clientsServed: 0,
    hoursWorked: 0,
    avgClientsPerDay: 0,
  });
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [growthData, setGrowthData] = useState<GrowthData[]>([]);
  const [weeklyGrowth, setWeeklyGrowth] = useState(0);
  const [growthView, setGrowthView] = useState<GrowthView>('week');

  // Modal states
  const [showTimeOffModal, setShowTimeOffModal] = useState(false);
  const [showAllRequestsModal, setShowAllRequestsModal] = useState(false);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [timeOffForm, setTimeOffForm] = useState<TimeOffFormData>({
    startDate: '',
    endDate: '',
    reason: '',
  });

  /**
   * Fetch all data on mount
   */
  useEffect(() => {
    fetchAllData();
  }, []);

  /**
   * Refetch growth data when view changes
   */
  useEffect(() => {
    if (profile) {
      loadGrowthData(growthView);
    }
  }, [growthView, profile]);

  async function fetchAllData() {
    try {
      setLoading(true);

      const user = await getCurrentUser();
      if (!user) {
        console.error('❌ No user found');
        return;
      }

      // Fetch staff profile
      const staffProfile = await hoursService.getStaffProfile(user.id);
      if (!staffProfile) {
        console.error('❌ No staff profile found');
        return;
      }

      setProfile(staffProfile);

      // Set weekly schedule from database
      if (staffProfile.weekly_schedule) {
        setWeeklySchedule(staffProfile.weekly_schedule);
      }

      // Fetch time off requests
      const timeOff = await hoursService.getTimeOffRequests(staffProfile.id);
      setTimeOffRequests(timeOff);

      // Fetch milestones
      const milestonesData = await hoursService.getMilestones(staffProfile.id);
      setMilestones(milestonesData);

      // Fetch weekly stats
      const { stats, weeklyData: weekly } = await hoursService.getWeeklyStats(staffProfile.id);
      setThisWeekStats(stats);
      setWeeklyData(weekly);

      // Fetch growth data
      const growth = await hoursService.generateGrowthData(growthView, staffProfile.id);
      setGrowthData(growth);

      // Calculate growth percentage
      const growthPercent = await hoursService.calculateGrowthPercentage(staffProfile.id);
      setWeeklyGrowth(growthPercent);

      console.log('✅ Hours data loaded');
    } catch (error) {
      console.error('❌ Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadGrowthData(view: GrowthView) {
    if (!profile) return;
    const growth = await hoursService.generateGrowthData(view, profile.id);
    setGrowthData(growth);
  }

  function changeGrowthView(view: GrowthView) {
    setGrowthView(view);
  }

  async function handleTimeOffRequest() {
    if (!profile) return;

    if (!timeOffForm.startDate || !timeOffForm.endDate || !timeOffForm.reason.trim()) {
      alert('Please fill in all fields');
      return;
    }

    try {
      await hoursService.submitTimeOffRequest(profile.id, timeOffForm);

      // Reset form and show success
      setShowTimeOffModal(false);
      setTimeOffForm({ startDate: '', endDate: '', reason: '' });
      setShowSuccessModal(true);

      // Auto-close success modal
      setTimeout(() => {
        setShowSuccessModal(false);
      }, 3000);

      // Refresh data
      await fetchAllData();
    } catch (error) {
      console.error('❌ Error submitting request:', error);
      alert('Failed to submit request');
    }
  }

  async function handleDeleteRequest(requestId: string) {
    try {
      await hoursService.deleteTimeOffRequest(requestId);
      setDeleteConfirmModal(null);
      await fetchAllData();
    } catch (error) {
      console.error('❌ Error deleting request:', error);
      alert('Failed to delete request');
    }
  }

  function openDeleteConfirmation(requestId: string) {
    setDeleteConfirmModal(requestId);
  }

  function closeDeleteConfirmation() {
    setDeleteConfirmModal(null);
  }

  return {
    // State
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

    // Modal states
    showTimeOffModal,
    showAllRequestsModal,
    deleteConfirmModal,
    showSuccessModal,
    timeOffForm,

    // Actions
    setShowTimeOffModal,
    setShowAllRequestsModal,
    setShowSuccessModal,
    setTimeOffForm,
    changeGrowthView,
    handleTimeOffRequest,
    handleDeleteRequest,
    openDeleteConfirmation,
    closeDeleteConfirmation,
    fetchAllData,
  };
}