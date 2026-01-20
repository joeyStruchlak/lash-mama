// apps/web/src/features/dashboard/services/dashboard.service.ts

import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import type { DashboardAppointment } from '../types/dashboard.types';

/**
 * Dashboard Service
 * Handles all Supabase queries for dashboard data
 */

export const dashboardService = {
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
   * Fetch today's appointments for staff
   */
  async fetchTodaysAppointments(staffId: string): Promise<DashboardAppointment[]> {
    try {
      const today = new Date().toISOString().split('T')[0];

      const { data: appointments, error } = await supabase
        .from('appointments')
        .select(
          `
          *,
          service:service_id(name, duration),
          user:user_id(
            full_name, 
            avatar_url,
            is_vip,
            vip_streak,
            referral_count,
            birthday,
            created_at
          )
        `
        )
        .eq('staff_id', staffId)
        .eq('appointment_date', today)
        .eq('status', 'confirmed')
        .order('appointment_time', { ascending: true })
        .limit(10);

      if (error) throw error;

      if (!appointments) return [];

      // Enrich with previous appointment data
      const enrichedAppointments = await Promise.all(
        appointments.map(async (apt: any) => {
          const { data: previousApts } = await supabase
            .from('appointments')
            .select('appointment_date')
            .eq('user_id', apt.user_id)
            .eq('status', 'completed')
            .lt('appointment_date', apt.appointment_date)
            .order('appointment_date', { ascending: false })
            .limit(1);

          return {
            ...apt,
            lastVisit:
              previousApts && previousApts.length > 0 ? previousApts[0].appointment_date : null,
          };
        })
      );

      return enrichedAppointments;
    } catch (error) {
      console.error('❌ Error fetching appointments:', error);
      return [];
    }
  },

  /**
   * Save appointment note
   */
  async saveAppointmentNote(appointmentId: string, note: string): Promise<void> {
    try {
      console.log('💾 Saving note:', { appointmentId, note });

      // First, check if appointment exists
      const { data: checkData, error: checkError } = await supabase
        .from('appointments')
        .select('id, notes')
        .eq('id', appointmentId);

      console.log('🔍 Appointment check:', { checkData, checkError });

      if (!checkData || checkData.length === 0) {
        throw new Error(`Appointment ${appointmentId} not found`);
      }

      // Now update
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
    } catch (error) {
      console.error('❌ Error saving note:', error);
      throw error;
    }
  },
};
