// apps/web/src/features/calendar/components/CalendarStats.tsx

import type { CalendarStats as StatsType } from '../types/calendar.types';
import styles from '../Calendar.module.css';

interface CalendarStatsProps {
  stats: StatsType;
}

export function CalendarStats({ stats }: CalendarStatsProps) {
  return (
    <div className={styles.statsRow}>
      <div className={styles.statCard}>
        <p className={styles.statValue}>{stats.totalAppointments}</p>
        <p className={styles.statLabel}>Appointments</p>
      </div>
      <div className={styles.statCard}>
        <p className={styles.statValueGold}>${stats.expectedRevenue.toFixed(0)}</p>
        <p className={styles.statLabel}>Expected</p>
      </div>
    </div>
  );
}