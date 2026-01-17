// apps/web/src/features/profile/hooks/useProfile.ts

import { useState, useEffect } from 'react';
import { getCurrentUser } from '@/lib/auth';
import { profileService } from '../services/profile.service';
import { broadcastProfileUpdate } from '../utils/profile.helpers';
import type { ProfileData, ProfileFormData, EditableField } from '../types/profile.types';

/**
 * useProfile Hook
 * Manages profile state, editing, and updates
 */

export function useProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [editingField, setEditingField] = useState<EditableField | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const [profileData, setProfileData] = useState<ProfileData>({
    id: '',
    email: '',
    full_name: '',
    phone: '',
    avatar_url: '',
    role: 'user',
    created_at: '',
    display_name: '',
    title: '',
    bio: '',
    location: '',
  });

  const [originalData, setOriginalData] = useState<ProfileFormData>({
    display_name: '',
    email: '',
    phone: '',
    bio: '',
  });

  /**
   * Fetch profile on mount
   */
  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      setLoading(true);
      console.log('📊 Fetching profile...');

      const user = await getCurrentUser();
      if (!user) {
        console.error('❌ No user found');
        return;
      }

      setUserId(user.id);

      const data = await profileService.fetchProfile(user.id);
      if (!data) {
        console.error('❌ No profile data found');
        return;
      }

      setProfileData(data);
      setOriginalData({
        display_name: data.display_name || '',
        email: data.email || '',
        phone: data.phone || '',
        bio: data.bio || '',
      });

      console.log('✅ Profile loaded');
    } catch (error) {
      console.error('❌ Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Save field change
   */
  async function handleSaveField(field: EditableField) {
    if (!userId) return;

    try {
      setSaving(true);
      console.log('💾 Saving field:', field);

      const value = profileData[field as keyof ProfileData] as string;

      await profileService.updateField(userId, field, value);

      // Update original data
      setOriginalData({
        ...originalData,
        [field]: value,
      });

      setEditingField(null);

      // Broadcast update for header
      if (field === 'display_name') {
        broadcastProfileUpdate({
          display_name: value,
          avatar_url: profileData.avatar_url || undefined,
        });
      }

      // Notify admins
      await profileService.notifyAdmins(profileData.display_name || 'Staff Member', field);

      console.log('✅ Profile updated successfully');
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 3000);
    } catch (error) {
      console.error('❌ Error saving:', error);
      alert('Failed to save changes');
    } finally {
      setSaving(false);
    }
  }

  /**
   * Cancel field edit
   */
  function handleCancelEdit(field: EditableField) {
    setProfileData({
      ...profileData,
      [field]: originalData[field],
    });
    setEditingField(null);
  }

  /**
   * Update field value (local state)
   */
  function updateField(field: EditableField, value: string) {
    setProfileData({
      ...profileData,
      [field]: value,
    });
  }

  /**
   * Handle photo upload
   */
  async function handlePhotoUpload(file: File) {
    if (!userId) return;

    try {
      setUploadingPhoto(true);
      console.log('📸 Uploading photo...');

      const result = await profileService.uploadAvatar(userId, file);

      // Update local state
      setProfileData({
        ...profileData,
        avatar_url: result.url,
      });

      // Broadcast update
      broadcastProfileUpdate({
        display_name: profileData.display_name,
        avatar_url: result.url,
      });

      console.log('✅ Photo uploaded successfully');
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 3000);
    } catch (error: any) {
      console.error('❌ Error uploading photo:', error);
      alert(`Failed to upload photo: ${error.message}`);
    } finally {
      setUploadingPhoto(false);
    }
  }

  return {
    // State
    loading,
    saving,
    uploadingPhoto,
    showSuccessModal,
    editingField,
    profileData,
    originalData,

    // Actions
    setEditingField,
    setShowSuccessModal,
    handleSaveField,
    handleCancelEdit,
    updateField,
    handlePhotoUpload,
  };
}
