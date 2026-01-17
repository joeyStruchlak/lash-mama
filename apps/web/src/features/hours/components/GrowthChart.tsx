// apps/web/src/features/hours/components/GrowthChart.tsx

import type { GrowthData, GrowthView } from '../types/hours.types';
import styles from '../Hours.module.css';

interface GrowthChartProps {
  data: GrowthData[];
  view: GrowthView;
  onViewChange: (view: GrowthView) => void;
}

export function GrowthChart({ data, view, onViewChange }: GrowthChartProps) {
  const maxGrowth = Math.max(...data.map((d) => d.value), 100);

  return (
    <div className={styles.growthCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.sectionTitle}>Client Growth Trend</h3>
        <div className={styles.viewToggle}>
          <button
            className={`${styles.viewButton} ${view === 'week' ? styles.viewButtonActive : ''}`}
            onClick={() => onViewChange('week')}
          >
            Week
          </button>
          <button
            className={`${styles.viewButton} ${view === 'month' ? styles.viewButtonActive : ''}`}
            onClick={() => onViewChange('month')}
          >
            Month
          </button>
          <button
            className={`${styles.viewButton} ${view === 'year' ? styles.viewButtonActive : ''}`}
            onClick={() => onViewChange('year')}
          >
            Year
          </button>
        </div>
      </div>
      <div className={styles.lineChart}>
        <svg viewBox="0 0 600 200" className={styles.lineChartSvg}>
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((val) => (
            <line
              key={val}
              x1="0"
              y1={200 - val * 2}
              x2="600"
              y2={200 - val * 2}
              stroke="#F0F0F0"
              strokeWidth="1"
            />
          ))}

          {/* Area fill */}
          <path
            d={`
              ${data
                .map((d, i) => {
                  const x = (i / (data.length - 1)) * 600;
                  const y = 200 - (d.value / maxGrowth) * 180;
                  return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                })
                .join(' ')}
              L 600 200 L 0 200 Z
            `}
            fill="url(#areaGradient)"
          />

          {/* Line */}
          <path
            d={data
              .map((d, i) => {
                const x = (i / (data.length - 1)) * 600;
                const y = 200 - (d.value / maxGrowth) * 180;
                return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
              })
              .join(' ')}
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {data.map((d, i) => {
            const x = (i / (data.length - 1)) * 600;
            const y = 200 - (d.value / maxGrowth) * 180;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="5"
                fill="#D4AF37"
                stroke="white"
                strokeWidth="2"
              />
            );
          })}

          {/* Gradients */}
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#D4AF37" />
              <stop offset="100%" stopColor="#B8941F" />
            </linearGradient>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(212, 175, 55, 0.2)" />
              <stop offset="100%" stopColor="rgba(212, 175, 55, 0)" />
            </linearGradient>
          </defs>
        </svg>
        <div className={styles.lineChartLabels}>
          {data.map((d, i) => (
            <span key={i} className={styles.lineChartLabel}>
              {d.label}
            </span>
          ))}
        </div>
      </div>
      <p className={styles.growthSubtext}>Performance over time</p>
    </div>
  );
}