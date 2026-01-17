// apps/web/src/features/calendar/components/MiniCalendar.tsx

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getDaysInMonth, getAppointmentsForDate, isToday } from '../utils/calendar.helpers';
import type { CalendarAppointment } from '../types/calendar.types';
import styles from '../Calendar.module.css';

interface MiniCalendarProps {
  currentDate: Date;
  appointments: CalendarAppointment[];
  onDateSelect: (date: Date) => void;
  onNavigate: (direction: 'prev' | 'next') => void;
}

export function MiniCalendar({
  currentDate,
  appointments,
  onDateSelect,
  onNavigate,
}: MiniCalendarProps) {
  const days = getDaysInMonth(currentDate);

  return (
    <div className={styles.miniCalendar}>
      <div className={styles.miniHeader}>
        <h3 className={styles.miniMonthTitle}>
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h3>
        <div className={styles.miniNavButtons}>
          <button onClick={() => onNavigate('prev')} className={styles.miniNavButton}>
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => onNavigate('next')} className={styles.miniNavButton}>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className={styles.miniDayHeaders}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className={styles.miniDayHeader}>
            {day}
          </div>
        ))}
      </div>

      <div className={styles.miniGrid}>
        {days.map((day, index) => {
          if (day === null)
            return <div key={`empty-${index}`} className={styles.miniEmptyCell} />;

          const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
          const dayAppointments = getAppointmentsForDate(appointments, date);
          const today = isToday(date);

          return (
            <div
              key={day}
              className={`${styles.miniDayCell} ${today ? styles.miniDayCellToday : ''}`}
              onClick={() => onDateSelect(date)}
            >
              {day}
              {dayAppointments.length > 0 && <div className={styles.miniDot} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}