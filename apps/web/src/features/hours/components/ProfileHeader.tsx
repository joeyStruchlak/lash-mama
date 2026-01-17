// apps/web/src/features/hours/components/ProfileHeader.tsx

import { Calendar, Star, TrendingUp, Users, Gift } from 'lucide-react';
import { getInitials, formatDate, calculateMonthsEmployed } from '../utils/hours.helpers';
import type { StaffProfile } from '../types/hours.types';
import styles from '../Hours.module.css';

interface ProfileHeaderProps {
  profile: StaffProfile;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  return (
    <>
      {/* Profile Card */}
      <div className={styles.profileCard}>
        <div className={styles.profileLeft}>
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.name} className={styles.avatar} />
          ) : (
            <div className={styles.avatarPlaceholder}>{getInitials(profile.name)}</div>
          )}
          <div className={styles.profileInfo}>
            <div className={styles.profileHeader}>
              <h1 className={styles.profileName}>{profile.name}</h1>
              <span className={styles.profileBadge}>senior</span>
            </div>
            <p className={styles.profileTitle}>{profile.title}</p>
            <div className={styles.profileMeta}>
              <div className={styles.metaItem}>
                <Calendar size={14} />
                <span>{profile.total_clients || 156}</span>
              </div>
              <div className={styles.metaItem}>
                <Star size={14} fill="currentColor" />
                <span>{profile.rating}</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.profileStats}>
          <div className={styles.statItem}>
            <div className={styles.statIcon}>
              <TrendingUp size={20} />
            </div>
            <div>
              <p className={styles.statValue}>
                {calculateMonthsEmployed(profile.created_at || profile.birthday)}
              </p>
              <p className={styles.statLabel}>At Lash Mama</p>
            </div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statIcon}>
              <Users size={20} />
            </div>
            <div>
              <p className={styles.statValue}>{profile.total_clients?.toLocaleString()}</p>
              <p className={styles.statLabel}>Total Clients</p>
            </div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statIcon}>
              <Gift size={20} />
            </div>
            <div>
              <p className={styles.statValue}>{formatDate(profile.birthday)}</p>
              <p className={styles.statLabel}>Birthday</p>
            </div>
          </div>
        </div>
      </div>

      {/* Specialties */}
      {profile.specialties && profile.specialties.length > 0 && (
        <div className={styles.specialties}>
          {profile.specialties.map((specialty, index) => (
            <span key={index} className={styles.specialtyBadge}>
              {specialty}
            </span>
          ))}
        </div>
      )}
    </>
  );
}