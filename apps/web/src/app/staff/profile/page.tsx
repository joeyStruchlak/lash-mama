'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Camera, Mail, Phone, MapPin, User, Lock, Calendar, X } from 'lucide-react';
import styles from './StaffProfile.module.css';
import type { TimeOffRequest } from '@/types/time-off-request';

export default function StaffProfilePage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [staffData, setStaffData] = useState({
        display_name: '',
        title: '',
        email: '',
        phone: '',
        bio: '',
        location: '',
        avatar_url: ''
    });
    const [editMode, setEditMode] = useState({
        display_name: false,
        email: false,
        phone: false
    });
    const [showTimeOffModal, setShowTimeOffModal] = useState(false);
    const [timeOffRequests, setTimeOffRequests] = useState<TimeOffRequest[]>([]);
    const [timeOffForm, setTimeOffForm] = useState({
        start_date: '',
        end_date: '',
        reason: ''
    });

    useEffect(() => {
        fetchStaffProfile();
        fetchTimeOffRequests();
    }, []);

    async function fetchStaffProfile() {
        try {
            setLoading(true);

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Get staff record
            const { data: staffRecord } = await supabase
                .from('staff')
                .select('*')
                .eq('user_id', user.id)
                .single();

            // Get user record for email
            const { data: userRecord } = await supabase
                .from('users')
                .select('email, full_name, phone, avatar_url')
                .eq('id', user.id)
                .single();

            if (staffRecord && userRecord) {
                setStaffData({
                    display_name: userRecord.full_name || staffRecord.name || '',
                    title: staffRecord.specialty || 'Lash Artist',
                    email: userRecord.email || '',
                    phone: userRecord.phone || '',
                    bio: staffRecord.bio || '',
                    location: staffRecord.location || 'Sydney, NSW',
                    avatar_url: userRecord.avatar_url || ''
                });
            }

        } catch (err) {
            console.error('Error fetching profile:', err);
        } finally {
            setLoading(false);
        }
    }

    async function handleSave() {
        try {
            setSaving(true);

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Update users table
            const { error: userError } = await supabase
                .from('users')
                .update({
                    full_name: staffData.display_name,
                    phone: staffData.phone
                })
                .eq('id', user.id);

            if (userError) throw userError;

            // Update staff table
            const { error: staffError } = await supabase
                .from('staff')
                .update({
                    name: staffData.display_name
                })
                .eq('user_id', user.id);

            if (staffError) throw staffError;

            alert('Profile updated successfully!');
            setEditMode({ display_name: false, email: false, phone: false });

        } catch (err) {
            console.error('Error saving profile:', err);
            alert('Failed to save profile');
        } finally {
            setSaving(false);
        }
    }

    async function fetchTimeOffRequests() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: staffRecord } = await supabase
                .from('staff')
                .select('id')
                .eq('user_id', user.id)
                .single();

            if (!staffRecord) return;

            const { data: requests } = await supabase
                .from('time_off_requests')
                .select('*')
                .eq('staff_id', staffRecord.id)
                .order('created_at', { ascending: false });

            setTimeOffRequests(requests || []);
        } catch (err) {
            console.error('Error fetching time off requests:', err);
        }
    }

    async function handleTimeOffSubmit(e: React.FormEvent) {
        e.preventDefault();

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: staffRecord } = await supabase
                .from('staff')
                .select('id')
                .eq('user_id', user.id)
                .single();

            if (!staffRecord) return;

            const { error } = await supabase
                .from('time_off_requests')
                .insert([{
                    staff_id: staffRecord.id,
                    start_date: timeOffForm.start_date,
                    end_date: timeOffForm.end_date,
                    reason: timeOffForm.reason,
                    status: 'pending'
                }]);

            if (error) throw error;

            alert('Time off request submitted successfully!');
            setShowTimeOffModal(false);
            setTimeOffForm({ start_date: '', end_date: '', reason: '' });
            fetchTimeOffRequests();

        } catch (err) {
            console.error('Error submitting time off request:', err);
            alert('Failed to submit request');
        }
    }

    async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Image size must be less than 5MB');
            return;
        }

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert('You must be logged in to upload a photo');
                return;
            }

            // Delete old avatar if exists
            if (staffData.avatar_url) {
                const oldPath = staffData.avatar_url.split('/').pop();
                if (oldPath) {
                    await supabase.storage.from('avatars').remove([oldPath]);
                }
            }

            // Upload to Supabase Storage
            const fileExt = file.name.split('.').pop();
            const filePath = `${user.id}-${Date.now()}.${fileExt}`;

            console.log('Uploading file:', filePath);

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) {
                console.error('Upload error:', uploadError);
                throw uploadError;
            }

            console.log('Upload successful:', uploadData);

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            console.log('Public URL:', publicUrl);

            // Update user record
            const { error: updateError } = await supabase
                .from('users')
                .update({ avatar_url: publicUrl })
                .eq('id', user.id);

            if (updateError) {
                console.error('Update error:', updateError);
                throw updateError;
            }

            // Update staff record too
            await supabase
                .from('staff')
                .update({ avatar_url: publicUrl })
                .eq('user_id', user.id);

            setStaffData({ ...staffData, avatar_url: publicUrl });
            alert('Profile picture updated successfully!');

        } catch (err: any) {
            console.error('Error uploading photo:', err);
            alert(`Failed to upload photo: ${err.message}`);
        }
    }

    function getInitials(name: string): string {
        return name
            .split(' ')
            .map(n => n[0])
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
            {/* Page Header */}
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Profile Settings</h1>
                <p className={styles.pageSubtitle}>Manage your profile and preferences</p>
            </div>

            {/* Profile Card */}
            <div className={styles.profileCard}>
                {/* Avatar Section */}
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
                                {getInitials(staffData.display_name || 'U')}
                            </div>
                        )}
                    </div>

                    <div>
                        <label htmlFor="photo-upload" className={styles.changePhotoButton}>
                            <Camera size={18} />
                            Change Photo
                        </label>
                        <input
                            id="photo-upload"
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            style={{ display: 'none' }}
                        />
                    </div>
                </div>

                {/* Form Fields */}
                <div className={styles.formGrid}>
                    {/* Display Name */}
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                            <User size={16} className={styles.labelIcon} />
                            Display Name
                        </label>
                        <div className={styles.inputWrapper}>
                            <input
                                type="text"
                                className={styles.input}
                                value={staffData.display_name}
                                onChange={(e) => setStaffData({ ...staffData, display_name: e.target.value })}
                                disabled={!editMode.display_name}
                            />
                            <button
                                className={styles.editButton}
                                onClick={() => setEditMode({ ...editMode, display_name: !editMode.display_name })}
                            >
                                {editMode.display_name ? 'Cancel' : 'Edit'}
                            </button>
                        </div>
                    </div>

                    {/* Title (Locked) */}
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                            <User size={16} className={styles.labelIcon} />
                            Title
                        </label>
                        <div className={styles.inputWrapper}>
                            <input
                                type="text"
                                className={`${styles.input} ${styles.inputDisabled}`}
                                value={staffData.title}
                                disabled
                            />
                            <div className={styles.lockedBadge}>
                                <Lock size={12} />
                                Locked
                            </div>
                        </div>
                    </div>

                    {/* Email */}
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                            <Mail size={16} className={styles.labelIcon} />
                            Email
                        </label>
                        <div className={styles.inputWrapper}>
                            <input
                                type="email"
                                className={styles.input}
                                value={staffData.email}
                                onChange={(e) => setStaffData({ ...staffData, email: e.target.value })}
                                disabled={!editMode.email}
                            />
                            <button
                                className={styles.editButton}
                                onClick={() => setEditMode({ ...editMode, email: !editMode.email })}
                            >
                                {editMode.email ? 'Cancel' : 'Edit'}
                            </button>
                        </div>
                    </div>

                    {/* Phone */}
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                            <Phone size={16} className={styles.labelIcon} />
                            Phone
                        </label>
                        <div className={styles.inputWrapper}>
                            <input
                                type="tel"
                                className={styles.input}
                                value={staffData.phone}
                                onChange={(e) => setStaffData({ ...staffData, phone: e.target.value })}
                                disabled={!editMode.phone}
                            />
                            <button
                                className={styles.editButton}
                                onClick={() => setEditMode({ ...editMode, phone: !editMode.phone })}
                            >
                                {editMode.phone ? 'Cancel' : 'Edit'}
                            </button>
                        </div>
                    </div>

                    {/* Bio (Locked) */}
                    <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                        <label className={styles.formLabel}>
                            Bio
                        </label>
                        <div className={styles.inputWrapper}>
                            <textarea
                                className={styles.textarea}
                                value={staffData.bio}
                                disabled
                            />
                            <div className={styles.lockedBadge}>
                                <Lock size={12} />
                                Set by Lash Mama
                            </div>
                        </div>
                    </div>

                    {/* Location (Locked) */}
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                            <MapPin size={16} className={styles.labelIcon} />
                            Location
                        </label>
                        <div className={styles.inputWrapper}>
                            <input
                                type="text"
                                className={`${styles.input} ${styles.inputDisabled}`}
                                value={staffData.location}
                                disabled
                            />
                            <div className={styles.lockedBadge}>
                                <Lock size={12} />
                                Locked
                            </div>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className={styles.saveButtonWrapper}>
                    <button
                        className={styles.saveButton}
                        onClick={handleSave}
                        disabled={saving || (!editMode.display_name && !editMode.email && !editMode.phone)}
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            {/* Time Off Request Card */}
            <div className={styles.timeOffCard}>
                <div className={styles.timeOffHeader}>
                    <div>
                        <h2 className={styles.sectionTitle}>Time Off Requests</h2>
                        <p className={styles.sectionSubtitle}>
                            Submit time off requests for Lash Mama approval
                        </p>
                    </div>
                    <button
                        className={styles.requestButton}
                        onClick={() => setShowTimeOffModal(true)}
                    >
                        <Calendar size={18} />
                        Request Time Off
                    </button>
                </div>

                {/* Requests List */}
                {timeOffRequests.length > 0 && (
                    <div className={styles.requestsList}>
                        {timeOffRequests.map((request) => (
                            <div
                                key={request.id}
                                className={`${styles.requestItem} ${request.status === 'approved' ? styles.requestItemApproved :
                                    request.status === 'rejected' ? styles.requestItemRejected :
                                        styles.requestItemPending
                                    }`}
                            >
                                <div className={styles.requestInfo}>
                                    <p className={styles.requestDate}>
                                        {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                                    </p>
                                    {request.reason && (
                                        <p className={styles.requestReason}>
                                            {request.reason}
                                        </p>
                                    )}
                                </div>
                                <span className={`${styles.requestStatus} ${request.status === 'approved' ? styles.requestStatusApproved :
                                    request.status === 'rejected' ? styles.requestStatusRejected :
                                        styles.requestStatusPending
                                    }`}>
                                    {request.status}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Time Off Modal */}
            {showTimeOffModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>
                                Request Time Off
                            </h3>
                            <button
                                onClick={() => setShowTimeOffModal(false)}
                                className={styles.modalCloseButton}
                            >
                                <X size={24} color="#6B6B6B" />
                            </button>
                        </div>

                        <form onSubmit={handleTimeOffSubmit}>
                            <div className={styles.modalFormGroup}>
                                <label className={styles.modalLabel}>
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={timeOffForm.start_date}
                                    onChange={(e) => setTimeOffForm({ ...timeOffForm, start_date: e.target.value })}
                                    className={styles.modalInput}
                                />
                            </div>

                            <div className={styles.modalFormGroup}>
                                <label className={styles.modalLabel}>
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={timeOffForm.end_date}
                                    onChange={(e) => setTimeOffForm({ ...timeOffForm, end_date: e.target.value })}
                                    className={styles.modalInput}
                                />
                            </div>

                            <div className={styles.modalFormGroup}>
                                <label className={styles.modalLabel}>
                                    Reason (Optional)
                                </label>
                                <textarea
                                    value={timeOffForm.reason}
                                    onChange={(e) => setTimeOffForm({ ...timeOffForm, reason: e.target.value })}
                                    placeholder="e.g., Vacation, Family event, Medical..."
                                    className={styles.modalTextarea}
                                />
                            </div>

                            <div className={styles.modalActions}>
                                <button
                                    type="button"
                                    onClick={() => setShowTimeOffModal(false)}
                                    className={styles.modalCancelButton}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={styles.modalSubmitButton}
                                >
                                    Submit Request
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Time Off Modal */}
            {showTimeOffModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '24px'
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '24px',
                        padding: '32px',
                        maxWidth: '500px',
                        width: '100%',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{
                                fontFamily: "'Playfair Display', serif",
                                fontSize: '24px',
                                fontWeight: '600',
                                color: '#2B2B2B'
                            }}>
                                Request Time Off
                            </h3>
                            <button
                                onClick={() => setShowTimeOffModal(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '8px',
                                    borderRadius: '8px',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#F8F5F0'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                            >
                                <X size={24} color="#6B6B6B" />
                            </button>
                        </div>

                        <form onSubmit={handleTimeOffSubmit}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#2B2B2B', marginBottom: '8px' }}>
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={timeOffForm.start_date}
                                    onChange={(e) => setTimeOffForm({ ...timeOffForm, start_date: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '2px solid #E8E3DC',
                                        borderRadius: '12px',
                                        fontSize: '14px'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#2B2B2B', marginBottom: '8px' }}>
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={timeOffForm.end_date}
                                    onChange={(e) => setTimeOffForm({ ...timeOffForm, end_date: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        border: '2px solid #E8E3DC',
                                        borderRadius: '12px',
                                        fontSize: '14px'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#2B2B2B', marginBottom: '8px' }}>
                                    Reason (Optional)
                                </label>
                                <textarea
                                    value={timeOffForm.reason}
                                    onChange={(e) => setTimeOffForm({ ...timeOffForm, reason: e.target.value })}
                                    placeholder="e.g., Vacation, Family event, Medical..."
                                    style={{
                                        width: '100%',
                                        minHeight: '100px',
                                        padding: '12px',
                                        border: '2px solid #E8E3DC',
                                        borderRadius: '12px',
                                        fontSize: '14px',
                                        fontFamily: 'inherit',
                                        resize: 'vertical'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowTimeOffModal(false)}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        background: 'white',
                                        border: '2px solid #E8E3DC',
                                        color: '#6B6B6B',
                                        borderRadius: '12px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        background: 'linear-gradient(135deg, #C9A872 0%, #B8956A 100%)',
                                        border: 'none',
                                        color: 'white',
                                        borderRadius: '12px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 12px rgba(184, 149, 106, 0.25)'
                                    }}
                                >
                                    Submit Request
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}