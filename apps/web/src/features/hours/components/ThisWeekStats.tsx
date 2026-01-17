// apps/web/src/features/hours/components/ThisWeekStats.tsx

import { Users, Clock, Target } from 'lucide-react';
import type { ThisWeekStats as StatsType } from '../types/hours.types';
import styles from '../Hours.module.css';

interface ThisWeekStatsProps {
  stats: StatsType;
  weeklyGrowth: number;
}

export function ThisWeekStats({ stats, weeklyGrowth }: ThisWeekStatsProps) {
  return (
    <div className={styles.thisWeekCard}>
      <h3 className={styles.sectionTitle}>This Week</h3>
      <div className={styles.thisWeekStats}>
        <div className={styles.thisWeekStat}>
          <div className={styles.thisWeekIcon}>
            <Users size={24} />
          </div>
          <div>
            <p className={styles.thisWeekValue}>{stats.clientsServed}</p>
            <p className={styles.thisWeekLabel}>Clients Served</p>
          </div>
          <div className={styles.thisWeekChange}>
            {weeklyGrowth >= 0 ? '+' : ''}
            {weeklyGrowth.toFixed(1)}% vs last week
          </div>
        </div>
        <div className={styles.thisWeekStat}>
          <div className={styles.thisWeekIcon}>
            <Clock size={24} />
          </div>
          <div>
            <p className={styles.thisWeekValue}>{stats.hoursWorked.toFixed(0)}h</p>
            <p className={styles.thisWeekLabel}>Hours Worked</p>
          </div>
        </div>
        <div className={styles.thisWeekStat}>
          <div className={styles.thisWeekIcon}>
            <Target size={24} />
          </div>
          <div>
            <p className={styles.thisWeekValue}>{stats.avgClientsPerDay.toFixed(1)}</p>
            <p className={styles.thisWeekLabel}>Avg Clients/Day</p>
          </div>
        </div>
      </div>
    </div>
  );
}