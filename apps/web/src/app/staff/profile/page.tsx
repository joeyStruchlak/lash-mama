'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Camera, Mail, Phone, MapPin, User, Check, X, Edit2 } from 'lucide-react';
import styles from './StaffProfile.module.css';

export default function StaffProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [staffData, setStaffData] = useState({
    display_name: '',
    title: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
    avatar_url: '',
  });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [originalData, setOriginalData] = useState({
    display_name: '',
    email: '',
    phone: '',
    bio: '',
  });

  useEffect(() => {
    fetchStaffProfile();
  }, []);

  async function fetchStaffProfile() {
    try {
      setLoading(true);
      console.log('📊 Fetching staff profile...');

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: staffRecord } = await supabase
        .from('staff')
        .select('*')
        .eq('user_id', user.id)
        .single();

      const { data: userRecord } = await supabase
        .from('users')
        .select('email, full_name, phone, avatar_url')
        .eq('id', user.id)
        .single();

      if (staffRecord && userRecord) {
        const data = {
          display_name: userRecord.full_name || staffRecord.name || '',
          title: staffRecord.specialty || 'Lash Artist',
          email: userRecord.email || '',
          phone: userRecord.phone || '',
          bio: staffRecord.bio || '',
          location: staffRecord.location || 'Sydney, NSW',
          avatar_url: userRecord.avatar_url || '',
        };
        setStaffData(data);
        setOriginalData({
          display_name: data.display_name,
          email: data.email,
          phone: data.phone,
          bio: data.bio,
        });
      }
    } catch (err) {
      console.error('❌ Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveField(field: string) {
    try {
      setSaving(true);
      console.log('💾 Saving field:', field);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      if (field === 'display_name') {
        await supabase
          .from('users')
          .update({ full_name: staffData.display_name })
          .eq('id', user.id);
        await supabase
          .from('staff')
          .update({ name: staffData.display_name })
          .eq('user_id', user.id);
      } else if (field === 'email') {
        await supabase.from('users').update({ email: staffData.email }).eq('id', user.id);
      } else if (field === 'phone') {
        await supabase.from('users').update({ phone: staffData.phone }).eq('id', user.id);
      } else if (field === 'bio') {
        await supabase.from('staff').update({ bio: staffData.bio }).eq('user_id', user.id);
      }

      // Update original data
      setOriginalData({ ...originalData, [field]: staffData[field as keyof typeof staffData] });
      setEditingField(null);

      // Dispatch custom event to update Header immediately
      window.dispatchEvent(
        new CustomEvent('profileUpdate', {
          detail: {
            display_name: staffData.display_name,
            avatar_url: staffData.avatar_url,
          },
        })
      );

      console.log('✅ Profile updated successfully');
      await notifyAdmin(field);
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 3000);
    } catch (err) {
      console.error('❌ Error saving:', err);
      alert('Failed to save changes');
    } finally {
      setSaving(false);
    }
  }

  function handleCancelEdit(field: string) {
    setStaffData({ ...staffData, [field]: originalData[field as keyof typeof originalData] });
    setEditingField(null);
  }

  async function notifyAdmin(field: string) {
    try {
      const { data: admins } = await supabase.from('users').select('id').eq('role', 'admin');
      if (!admins) return;

      const fieldNames: Record<string, string> = {
        display_name: 'Display Name',
        email: 'Email',
        phone: 'Phone',
        bio: 'Bio',
      };

      const notifications = admins.map((admin) => ({
        user_id: admin.id,
        type: 'general',
        title: 'Profile Update',
        message: `${staffData.display_name} updated their ${fieldNames[field]}`,
        is_read: false,
      }));

      await supabase.from('notifications').insert(notifications);
    } catch (err) {
      console.error('Error notifying admin:', err);
    }
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    try {
      setUploadingPhoto(true);
      console.log('📸 Uploading photo...');

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(filePath);

      await supabase.from('users').update({ avatar_url: publicUrl }).eq('id', user.id);
      await supabase.from('staff').update({ avatar_url: publicUrl }).eq('user_id', user.id);

      // Update local state immediately
      setStaffData({ ...staffData, avatar_url: publicUrl });

      // Dispatch custom event to update Header immediately
      window.dispatchEvent(
        new CustomEvent('profileUpdate', {
          detail: {
            display_name: staffData.display_name,
            avatar_url: publicUrl,
          },
        })
      );

      console.log('✅ Photo uploaded successfully');
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 3000);
    } catch (err: any) {
      console.error('❌ Error uploading photo:', err);
      alert(`Failed to upload photo: ${err.message}`);
    } finally {
      setUploadingPhoto(false);
    }
  }

  function getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

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
        {/* Top Section - Avatar + Form */}
        <div className={styles.topSection}>
          {/* Avatar */}
          <div className={styles.avatarSection}>
            <div className={styles.avatarWrapper}>
              {staffData.avatar_url ? (
                <img
                  src={staffData.avatar_url}
                  alt={staffData.display_name}
                  className={styles.avatar}
                />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  <User size={48} color="hsl(37 42% 62%)" />
                </div>
              )}
              {uploadingPhoto && (
                <div className={styles.uploadingOverlay}>
                  <div className={styles.uploadSpinner} />
                </div>
              )}
            </div>
            <label htmlFor="photo-upload" className={styles.changePhotoBtn}>
              <Camera size={16} />
              Change Photo
            </label>
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              disabled={uploadingPhoto}
              style={{ display: 'none' }}
            />
          </div>

          {/* Form Fields */}
          <div className={styles.formSection}>
            {/* Display Name */}
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Display Name</label>
                <div className={styles.inputWrapper}>
                  <input
                    type="text"
                    className={styles.input}
                    value={staffData.display_name}
                    onChange={(e) => setStaffData({ ...staffData, display_name: e.target.value })}
                    disabled={editingField !== 'display_name'}
                  />
                  {editingField === 'display_name' ? (
                    <div className={styles.iconGroup}>
                      <button
                        className={styles.iconBtn}
                        onClick={() => handleSaveField('display_name')}
                      >
                        <Check size={16} />
                      </button>
                      <button
                        className={styles.iconBtn}
                        onClick={() => handleCancelEdit('display_name')}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <button
                      className={styles.iconBtn}
                      onClick={() => setEditingField('display_name')}
                    >
                      <Edit2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Title */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Title</label>
                <input
                  type="text"
                  className={`${styles.input} ${styles.inputDisabled}`}
                  value={staffData.title}
                  disabled
                />
              </div>
            </div>

            {/* Email & Phone */}
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <Mail size={16} />
                  Email
                </label>
                <div className={styles.inputWrapper}>
                  <input
                    type="email"
                    className={styles.input}
                    value={staffData.email}
                    onChange={(e) => setStaffData({ ...staffData, email: e.target.value })}
                    disabled={editingField !== 'email'}
                  />
                  {editingField === 'email' ? (
                    <div className={styles.iconGroup}>
                      <button className={styles.iconBtn} onClick={() => handleSaveField('email')}>
                        <Check size={16} />
                      </button>
                      <button className={styles.iconBtn} onClick={() => handleCancelEdit('email')}>
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <button className={styles.iconBtn} onClick={() => setEditingField('email')}>
                      <Edit2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <Phone size={16} />
                  Phone
                </label>
                <div className={styles.inputWrapper}>
                  <input
                    type="tel"
                    className={styles.input}
                    value={staffData.phone}
                    onChange={(e) => setStaffData({ ...staffData, phone: e.target.value })}
                    disabled={editingField !== 'phone'}
                  />
                  {editingField === 'phone' ? (
                    <div className={styles.iconGroup}>
                      <button className={styles.iconBtn} onClick={() => handleSaveField('phone')}>
                        <Check size={16} />
                      </button>
                      <button className={styles.iconBtn} onClick={() => handleCancelEdit('phone')}>
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <button className={styles.iconBtn} onClick={() => setEditingField('phone')}>
                      <Edit2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Bio</label>
              <div className={styles.inputWrapper}>
                <textarea
                  className={styles.textarea}
                  value={staffData.bio}
                  onChange={(e) => setStaffData({ ...staffData, bio: e.target.value })}
                  rows={3}
                  disabled={editingField !== 'bio'}
                />
                {editingField === 'bio' ? (
                  <div className={styles.iconGroup}>
                    <button className={styles.iconBtn} onClick={() => handleSaveField('bio')}>
                      <Check size={16} />
                    </button>
                    <button className={styles.iconBtn} onClick={() => handleCancelEdit('bio')}>
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <button className={styles.iconBtn} onClick={() => setEditingField('bio')}>
                    <Edit2 size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Location */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <MapPin size={16} />
                Location
              </label>
              <input
                type="text"
                className={`${styles.input} ${styles.inputDisabled}`}
                value={staffData.location}
                disabled
              />
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className={styles.modalOverlay} onClick={() => setShowSuccessModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.successIcon}>
              <Check size={48} />
            </div>
            <h3 className={styles.modalTitle}>Profile Updated!</h3>
            <p className={styles.modalText}>
              Your changes have been sent to <strong>Lash Mama</strong> for approval.
            </p>
            <button className={styles.modalButton} onClick={() => setShowSuccessModal(false)}>
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
