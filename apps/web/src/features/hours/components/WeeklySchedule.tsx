// apps/web/src/features/hours/components/WeeklySchedule.tsx

import { Clock } from 'lucide-react';
import { calculateWeeklyHours } from '../utils/hours.helpers';
import type { WeeklySchedule as ScheduleType } from '../types/hours.types';
import styles from '../Hours.module.css';

interface WeeklyScheduleProps {
  schedule: ScheduleType;
}

export function WeeklySchedule({ schedule }: WeeklyScheduleProps) {
  return (
    <div className={styles.scheduleCard}>
      <div className={styles.cardHeader}>
        <div className={styles.cardHeaderLeft}>
          <Clock size={20} className={styles.cardIcon} />
          <h3 className={styles.cardTitle}>Weekly Schedule</h3>
        </div>
      </div>
      <div className={styles.scheduleGrid}>
        {Object.entries(schedule).map(([day, hours]) => (
          <div key={day} className={styles.scheduleDay}>
            <p className={styles.scheduleDayName}>{day}</p>
            <p className={styles.scheduleHours}>
              {hours.start} - {hours.end}
            </p>
          </div>
        ))}
      </div>
      <div className={styles.scheduleFooter}>
        <p className={styles.scheduleFooterText}>Weekly Hours</p>
        <p className={styles.scheduleFooterValue}>{calculateWeeklyHours(schedule)}h scheduled</p>
      </div>
    </div>
  );
}