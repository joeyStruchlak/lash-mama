// apps/web/src/features/profile/services/profile.service.ts

import { supabase } from '@/lib/supabase';
import type { ProfileData, EditableField, PhotoUploadResult } from '../types/profile.types';

/**
 * Profile Service
 * Handles all Supabase queries for profile data
 */

export const profileService = {
  /**
   * Fetch complete profile data (users + staff)
   */
  async fetchProfile(userId: string): Promise<ProfileData | null> {
    try {
      // Get user data
      const { data: userRecord, error: userError } = await supabase
        .from('users')
        .select('id, email, full_name, phone, avatar_url, role, created_at')
        .eq('id', userId)
        .single();

      if (userError) throw userError;
      if (!userRecord) return null;

      // Get staff data if user is staff/manager/admin
      if (['staff', 'manager', 'admin'].includes(userRecord.role)) {
        const { data: staffRecord } = await supabase
          .from('staff')
          .select('name, specialty, bio, tier, title')
          .eq('user_id', userId)
          .single();

        return {
          ...userRecord,
          display_name: userRecord.full_name || staffRecord?.name || '',
          title: staffRecord?.title || staffRecord?.specialty || 'Lash Artist',
          specialty: staffRecord?.specialty,
          bio: staffRecord?.bio,
          tier: staffRecord?.tier,
          location: 'Adelaide, SA', // Default - can be made dynamic
        };
      }

      return {
        ...userRecord,
        display_name: userRecord.full_name || '',
      };
    } catch (error) {
      console.error('❌ Error fetching profile:', error);
      throw error;
    }
  },

  /**
   * Update a single profile field
   */
  async updateField(userId: string, field: EditableField, value: string): Promise<void> {
    try {
      switch (field) {
        case 'display_name':
          await supabase.from('users').update({ full_name: value }).eq('id', userId);
          await supabase.from('staff').update({ name: value }).eq('user_id', userId);
          break;

        case 'email':
          await supabase.from('users').update({ email: value }).eq('id', userId);
          break;

        case 'phone':
          await supabase.from('users').update({ phone: value }).eq('id', userId);
          break;

        case 'bio':
          await supabase.from('staff').update({ bio: value }).eq('user_id', userId);
          break;
      }
    } catch (error) {
      console.error(`❌ Error updating ${field}:`, error);
      throw error;
    }
  },

  /**
   * Upload avatar photo
   */
  async uploadAvatar(userId: string, file: File): Promise<PhotoUploadResult> {
    try {
      // Validate file
      if (!file.type.startsWith('image/')) {
        throw new Error('Please upload an image file');
      }
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image size must be less than 5MB');
      }

      // Upload to storage
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(filePath);

      // Update database
      await supabase.from('users').update({ avatar_url: publicUrl }).eq('id', userId);

      await supabase.from('staff').update({ avatar_url: publicUrl }).eq('user_id', userId);

      return {
        url: publicUrl,
        path: filePath,
      };
    } catch (error) {
      console.error('❌ Error uploading avatar:', error);
      throw error;
    }
  },

  /**
   * Notify admins of profile changes
   */
  async notifyAdmins(staffName: string, field: EditableField): Promise<void> {
    try {
      const { data: admins } = await supabase.from('users').select('id').eq('role', 'admin');

      if (!admins || admins.length === 0) return;

      const fieldNames: Record<EditableField, string> = {
        display_name: 'Display Name',
        email: 'Email',
        phone: 'Phone',
        bio: 'Bio',
      };

      const notifications = admins.map((admin) => ({
        user_id: admin.id,
        type: 'general',
        title: 'Profile Update',
        message: `${staffName} updated their ${fieldNames[field]}`,
        is_read: false,
      }));

      await supabase.from('notifications').insert(notifications);
    } catch (error) {
      console.error('❌ Error notifying admins:', error);
      // Don't throw - notification failure shouldn't block profile update
    }
  },
};
