// apps/web/src/features/calendar/services/calendar.service.ts

import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import type { CalendarAppointment, CalendarStats, AppointmentNote } from '../types/calendar.types';

/**
 * Calendar Service
 * Handles all Supabase queries for calendar data
 */

export const calendarService = {
  /**
   * Get staff ID for current user
   */
  async getStaffId(userId: string): Promise<string | null> {
    try {
      const { data: staffProfile } = await supabase
        .from('staff')
        .select('id')
        .eq('user_id', userId)
        .single();

      return staffProfile?.id || null;
    } catch (error) {
      console.error('❌ Error getting staff ID:', error);
      return null;
    }
  },

  /**
   * Fetch appointments for date range
   */
  async fetchAppointments(
    staffId: string,
    startDate: Date,
    endDate: Date
  ): Promise<CalendarAppointment[]> {
    try {
      const { data: appointmentsData } = await supabase
        .from('appointments')
        .select(
          `
          *,
          user:user_id(
            full_name,
            avatar_url,
            is_vip,
            vip_streak,
            referral_count,
            birthday,
            created_at
          ),
          service:service_id(name, duration),
          staff:staff_id(name)
        `
        )
        .eq('staff_id', staffId)
        .gte('appointment_date', startDate.toISOString().split('T')[0])
        .lte('appointment_date', endDate.toISOString().split('T')[0])
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true });

      return (appointmentsData as any) || [];
    } catch (error) {
      console.error('❌ Error fetching appointments:', error);
      return [];
    }
  },

  /**
   * Fetch monthly stats
   */
  async fetchMonthlyStats(staffId: string, currentDate: Date): Promise<CalendarStats> {
    try {
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const { data: monthAppointments } = await supabase
        .from('appointments')
        .select('id, total_price')
        .eq('staff_id', staffId)
        .gte('appointment_date', monthStart.toISOString().split('T')[0])
        .lte('appointment_date', monthEnd.toISOString().split('T')[0]);

      return {
        totalAppointments: monthAppointments?.length || 0,
        expectedRevenue:
          monthAppointments?.reduce((sum, apt) => sum + (apt.total_price || 0), 0) || 0,
      };
    } catch (error) {
      console.error('❌ Error fetching monthly stats:', error);
      return {
        totalAppointments: 0,
        expectedRevenue: 0,
      };
    }
  },

  /**
   * Load appointment note
   */
  async loadAppointmentNote(appointmentId: string, staffId: string): Promise<string> {
    try {
      const { data: noteData } = await supabase
        .from('appointment_notes')
        .select('note')
        .eq('appointment_id', appointmentId)
        .eq('staff_id', staffId)
        .single();

      return noteData?.note || '';
    } catch (error) {
      console.error('❌ Error loading note:', error);
      return '';
    }
  },

  /**
   * Save appointment note
   */
  async saveAppointmentNote(appointmentId: string, staffId: string, note: string): Promise<void> {
    try {
      const { error } = await supabase.from('appointment_notes').upsert(
        {
          appointment_id: appointmentId,
          staff_id: staffId,
          note: note,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'appointment_id,staff_id',
        }
      );

      if (error) throw error;
    } catch (error) {
      console.error('❌ Error saving note:', error);
      throw error;
    }
  },
};
