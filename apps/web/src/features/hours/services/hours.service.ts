// apps/web/src/features/hours/services/hours.service.ts

import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import type {
  StaffProfile,
  TimeOffRequest,
  Milestone,
  WeeklyData,
  GrowthData,
  ThisWeekStats,
  GrowthView,
  TimeOffFormData,
} from '../types/hours.types';

/**
 * Hours Service
 * Handles all Supabase queries for hours/analytics data
 */

export const hoursService = {
  /**
   * Get staff profile with schedule
   */
  async getStaffProfile(userId: string): Promise<StaffProfile | null> {
    try {
      const { data: staffData } = await supabase
        .from('staff')
        .select('*, created_at')
        .eq('user_id', userId)
        .single();

      if (!staffData) return null;

      const { data: userData } = await supabase
        .from('users')
        .select('avatar_url')
        .eq('id', userId)
        .single();

      return {
        ...staffData,
        avatar_url: userData?.avatar_url,
      };
    } catch (error) {
      console.error('❌ Error fetching staff profile:', error);
      return null;
    }
  },

  /**
   * Fetch time off requests
   */
  async getTimeOffRequests(staffId: string): Promise<TimeOffRequest[]> {
    try {
      const { data } = await supabase
        .from('time_off_requests')
        .select('*')
        .eq('staff_id', staffId)
        .order('start_date', { ascending: false });

      return data || [];
    } catch (error) {
      console.error('❌ Error fetching time off requests:', error);
      return [];
    }
  },

  /**
   * Fetch milestones
   */
  async getMilestones(staffId: string): Promise<Milestone[]> {
    try {
      const { data } = await supabase
        .from('staff_milestones')
        .select('*')
        .eq('staff_id', staffId)
        .order('date_achieved', { ascending: false });

      return data || [];
    } catch (error) {
      console.error('❌ Error fetching milestones:', error);
      return [];
    }
  },

  /**
   * Fetch this week's stats
   */
  async getWeeklyStats(staffId: string): Promise<{
    stats: ThisWeekStats;
    weeklyData: WeeklyData[];
  }> {
    try {
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      const { data: appointments } = await supabase
        .from('appointments')
        .select(`
          *,
          service:service_id(duration)
        `)
        .eq('staff_id', staffId)
        .gte('appointment_date', startOfWeek.toISOString().split('T')[0])
        .lte('appointment_date', endOfWeek.toISOString().split('T')[0]);

      if (!appointments) {
        return {
          stats: { clientsServed: 0, hoursWorked: 0, avgClientsPerDay: 0 },
          weeklyData: [],
        };
      }

      let totalClients = 0;
      let totalHours = 0;

      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const weeklyData = days.map((day, index) => {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + index);
        const dateStr = date.toISOString().split('T')[0];

        const dayApts = appointments.filter((apt) => apt.appointment_date === dateStr);
        const clients = dayApts.length;
        const hours = dayApts.reduce((sum, apt) => {
          const duration = this.parseDuration(apt.service?.duration);
          return sum + duration;
        }, 0);

        totalClients += clients;
        totalHours += hours;

        return { day, clients, hours };
      });

      return {
        stats: {
          clientsServed: totalClients,
          hoursWorked: totalHours,
          avgClientsPerDay: totalClients / 7,
        },
        weeklyData,
      };
    } catch (error) {
      console.error('❌ Error fetching weekly stats:', error);
      return {
        stats: { clientsServed: 0, hoursWorked: 0, avgClientsPerDay: 0 },
        weeklyData: [],
      };
    }
  },

  /**
   * Parse service duration string to hours
   */
  parseDuration(duration: string | null | undefined): number {
    if (!duration || typeof duration !== 'string') return 2;
    const match = duration.match(/(\d+\.?\d*)/);
    return match ? parseFloat(match[1]) : 2;
  },

  /**
   * Generate growth data
   */
  async generateGrowthData(view: GrowthView, staffId: string): Promise<GrowthData[]> {
    try {
      const now = new Date();
      let startDate: Date;
      let labels: string[] = [];

      if (view === 'week') {
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 6);
        labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      } else if (view === 'month') {
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 27);
        labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      } else {
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 5);
        labels = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now);
          d.setMonth(now.getMonth() - i);
          labels.push(d.toLocaleDateString('en-US', { month: 'short' }));
        }
      }

      const { data: appointments } = await supabase
        .from('appointments')
        .select('appointment_date')
        .eq('staff_id', staffId)
        .gte('appointment_date', startDate.toISOString().split('T')[0])
        .lte('appointment_date', now.toISOString().split('T')[0]);

      if (!appointments || appointments.length === 0) {
        return labels.map((label) => ({ label, value: 0 }));
      }

      const grouped = new Map<string, number>();

      if (view === 'week') {
        const dayMap = new Map<number, string>([
          [0, 'Sun'],
          [1, 'Mon'],
          [2, 'Tue'],
          [3, 'Wed'],
          [4, 'Thu'],
          [5, 'Fri'],
          [6, 'Sat'],
        ]);

        appointments.forEach((apt) => {
          const date = new Date(apt.appointment_date);
          const dayName = dayMap.get(date.getDay()) || '';
          grouped.set(dayName, (grouped.get(dayName) || 0) + 1);
        });
      } else if (view === 'month') {
        appointments.forEach((apt) => {
          const date = new Date(apt.appointment_date);
          const daysSinceStart = Math.floor(
            (date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          const weekNum = Math.floor(daysSinceStart / 7);
          const label = `Week ${weekNum + 1}`;
          if (weekNum >= 0 && weekNum < 4) {
            grouped.set(label, (grouped.get(label) || 0) + 1);
          }
        });
      } else {
        appointments.forEach((apt) => {
          const date = new Date(apt.appointment_date);
          const monthLabel = date.toLocaleDateString('en-US', { month: 'short' });
          grouped.set(monthLabel, (grouped.get(monthLabel) || 0) + 1);
        });
      }

      return labels.map((label) => ({
        label,
        value: grouped.get(label) || 0,
      }));
    } catch (error) {
      console.error('❌ Error generating growth data:', error);
      return [];
    }
  },

  /**
   * Calculate growth percentage (this week vs last week)
   */
  async calculateGrowthPercentage(staffId: string): Promise<number> {
    try {
      const now = new Date();
      const thisWeekStart = new Date(now);
      thisWeekStart.setDate(now.getDate() - now.getDay());

      const lastWeekStart = new Date(thisWeekStart);
      lastWeekStart.setDate(thisWeekStart.getDate() - 7);

      const { data: thisWeek } = await supabase
        .from('appointments')
        .select('id')
        .eq('staff_id', staffId)
        .gte('appointment_date', thisWeekStart.toISOString().split('T')[0])
        .lte('appointment_date', now.toISOString().split('T')[0]);

      const { data: lastWeek } = await supabase
        .from('appointments')
        .select('id')
        .eq('staff_id', staffId)
        .gte('appointment_date', lastWeekStart.toISOString().split('T')[0])
        .lt('appointment_date', thisWeekStart.toISOString().split('T')[0]);

      const thisCount = thisWeek?.length || 0;
      const lastCount = lastWeek?.length || 0;

      if (lastCount === 0) return 0;

      return ((thisCount - lastCount) / lastCount) * 100;
    } catch (error) {
      console.error('❌ Error calculating growth:', error);
      return 0;
    }
  },

  /**
   * Submit time off request
   */
  async submitTimeOffRequest(
    staffId: string,
    formData: TimeOffFormData
  ): Promise<void> {
    try {
      const { error } = await supabase.from('time_off_requests').insert({
        staff_id: staffId,
        start_date: formData.startDate,
        end_date: formData.endDate,
        reason: formData.reason,
        status: 'pending',
      });

      if (error) throw error;
    } catch (error) {
      console.error('❌ Error submitting time off request:', error);
      throw error;
    }
  },

  /**
   * Delete time off request
   */
  async deleteTimeOffRequest(requestId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('time_off_requests')
        .delete()
        .eq('id', requestId);

      if (error) throw error;
    } catch (error) {
      console.error('❌ Error deleting request:', error);
      throw error;
    }
  },
};