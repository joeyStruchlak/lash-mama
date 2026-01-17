// apps/web/src/features/profile/components/ProfileAvatar.tsx

import { Camera, User } from 'lucide-react';
import { getInitials } from '../utils/profile.helpers';
import styles from '../Profile.module.css';

interface ProfileAvatarProps {
  avatarUrl: string | null;
  displayName: string;
  uploading: boolean;
  onPhotoChange: (file: File) => void;
}

export function ProfileAvatar({
  avatarUrl,
  displayName,
  uploading,
  onPhotoChange,
}: ProfileAvatarProps) {
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      onPhotoChange(file);
    }
  }

  return (
    <div className={styles.avatarSection}>
      <div className={styles.avatarWrapper}>
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className={styles.avatar}
          />
        ) : (
          <div className={styles.avatarPlaceholder}>
            <User size={48} color="hsl(37 42% 62%)" />
          </div>
        )}
        {uploading && (
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
        onChange={handleFileChange}
        disabled={uploading}
        style={{ display: 'none' }}
      />
    </div>
  );
}