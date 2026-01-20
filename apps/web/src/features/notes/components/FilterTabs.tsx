/**
 * FilterTabs Component
 * Tab navigation for filtering notes (All/Important/Reminders)
 */

'use client';

import { Star, Bell } from 'lucide-react';
import type { FilterTabsProps } from '../types/notes.types';
import styles from '../Notes.module.css';

export function FilterTabs({ filter, onFilterChange, counts }: FilterTabsProps) {
  return (
    <div className={styles.filterTabs}>
      <button
        onClick={() => onFilterChange('all')}
        className={`${styles.filterTab} ${filter === 'all' ? styles.filterTabActive : ''}`}
      >
        All Notes
        <span className={styles.filterCount}>{counts.all}</span>
      </button>
      
      <button
        onClick={() => onFilterChange('important')}
        className={`${styles.filterTab} ${filter === 'important' ? styles.filterTabActive : ''}`}
      >
        <Star size={16} />
        Important
        <span className={styles.filterCount}>{counts.important}</span>
      </button>
      
      <button
        onClick={() => onFilterChange('reminders')}
        className={`${styles.filterTab} ${filter === 'reminders' ? styles.filterTabActive : ''}`}
      >
        <Bell size={16} />
        Reminders
        <span className={styles.filterCount}>{counts.reminders}</span>
      </button>
    </div>
  );
}