// apps/web/src/features/profile/Profile.tsx

'use client';

import { Mail, Phone, MapPin } from 'lucide-react';
import { useProfile } from './hooks/useProfile';
import { ProfileAvatar } from './components/ProfileAvatar';
import { EditableField } from './components/EditableField';
import { SuccessModal } from './components/SuccessModal';
import type { ProfileProps } from './types/profile.types';
import styles from './Profile.module.css';

/**
 * Profile Component
 * Main profile management UI - reusable across Staff/Admin/Manager roles
 */

export function Profile({ canEdit = true }: ProfileProps) {
  const {
    loading,
    uploadingPhoto,
    showSuccessModal,
    editingField,
    profileData,
    setEditingField,
    setShowSuccessModal,
    handleSaveField,
    handleCancelEdit,
    updateField,
    handlePhotoUpload,
  } = useProfile();

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
      </div>
    );
  }

  return (
    <div className={styles.profileContainer}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Profile Settings</h1>
          <p className={styles.subtitle}>Manage your profile and preferences</p>
        </div>
      </div>

      {/* Main Card */}
      <div className={styles.card}>
        <div className={styles.topSection}>
          {/* Avatar */}
          {canEdit && (
            <ProfileAvatar
              avatarUrl={profileData.avatar_url}
              displayName={profileData.display_name || ''}
              uploading={uploadingPhoto}
              onPhotoChange={handlePhotoUpload}
            />
          )}

          {!canEdit && (
            <div className={styles.avatarSection}>
              <div className={styles.avatarWrapper}>
                {profileData.avatar_url ? (
                  <img
                    src={profileData.avatar_url}
                    alt={profileData.display_name || ''}
                    className={styles.avatar}
                  />
                ) : (
                  <div className={styles.avatarPlaceholder}>
                    <span>{profileData.display_name?.charAt(0) || '?'}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Form Fields */}
          <div className={styles.formSection}>
            {/* Display Name & Title */}
            <div className={styles.formRow}>
              <EditableField
                field="display_name"
                label="Display Name"
                value={profileData.display_name || ''}
                isEditing={editingField === 'display_name' && canEdit}
                disabled={!canEdit}
                onEdit={() => canEdit && setEditingField('display_name')}
                onSave={() => handleSaveField('display_name')}
                onCancel={() => handleCancelEdit('display_name')}
                onChange={(value) => updateField('display_name', value)}
              />

              <EditableField
                field="display_name"
                label="Title"
                value={profileData.title || ''}
                isEditing={false}
                disabled={true}
                onEdit={() => {}}
                onSave={() => {}}
                onCancel={() => {}}
                onChange={() => {}}
              />
            </div>

            {/* Email & Phone */}
            <div className={styles.formRow}>
              <EditableField
                field="email"
                label="Email"
                value={profileData.email || ''}
                type="email"
                icon={<Mail size={16} />}
                isEditing={editingField === 'email' && canEdit}
                disabled={!canEdit}
                onEdit={() => canEdit && setEditingField('email')}
                onSave={() => handleSaveField('email')}
                onCancel={() => handleCancelEdit('email')}
                onChange={(value) => updateField('email', value)}
              />

              <EditableField
                field="phone"
                label="Phone"
                value={profileData.phone || ''}
                type="tel"
                icon={<Phone size={16} />}
                isEditing={editingField === 'phone' && canEdit}
                disabled={!canEdit}
                onEdit={() => canEdit && setEditingField('phone')}
                onSave={() => handleSaveField('phone')}
                onCancel={() => handleCancelEdit('phone')}
                onChange={(value) => updateField('phone', value)}
              />
            </div>

            {/* Bio */}
            <EditableField
              field="bio"
              label="Bio"
              value={profileData.bio || ''}
              type="textarea"
              isEditing={editingField === 'bio' && canEdit}
              disabled={!canEdit}
              onEdit={() => canEdit && setEditingField('bio')}
              onSave={() => handleSaveField('bio')}
              onCancel={() => handleCancelEdit('bio')}
              onChange={(value) => updateField('bio', value)}
            />

            {/* Location */}
            <EditableField
              field="display_name"
              label="Location"
              value={profileData.location || ''}
              icon={<MapPin size={16} />}
              isEditing={false}
              disabled={true}
              onEdit={() => {}}
              onSave={() => {}}
              onCancel={() => {}}
              onChange={() => {}}
            />
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <SuccessModal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} />
    </div>
  );
}
