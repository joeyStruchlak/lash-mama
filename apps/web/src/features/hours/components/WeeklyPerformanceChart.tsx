// apps/web/src/features/hours/components/WeeklyPerformanceChart.tsx

import type { WeeklyData } from '../types/hours.types';
import styles from '../Hours.module.css';

interface WeeklyPerformanceChartProps {
  data: WeeklyData[];
}

export function WeeklyPerformanceChart({ data }: WeeklyPerformanceChartProps) {
  const maxClients = Math.max(...data.map((d) => d.clients), 8);

  return (
    <div className={styles.performanceCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.sectionTitle}>Weekly Performance</h3>
        <div className={styles.chartLegend}>
          <div className={styles.legendItem}>
            <div className={styles.legendDot} style={{ background: '#D4AF37' }} />
            <span>Clients</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendDot} style={{ background: '#E5E5E5' }} />
            <span>Hours</span>
          </div>
        </div>
      </div>
      <div className={styles.barChart}>
        {data.map((dayData, index) => {
          const isToday = new Date().getDay() === index;
          return (
            <div key={index} className={styles.barColumn}>
              <div className={styles.barGroup}>
                <div
                  className={styles.barClients}
                  style={{ height: `${(dayData.clients / maxClients) * 200}px` }}
                  title={`${dayData.clients} clients`}
                />
                <div
                  className={styles.barHours}
                  style={{ height: `${(dayData.hours / (maxClients * 2)) * 200}px` }}
                  title={`${dayData.hours.toFixed(1)}h`}
                />
              </div>
              <p className={`${styles.barLabel} ${isToday ? styles.barLabelToday : ''}`}>
                {dayData.day}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}