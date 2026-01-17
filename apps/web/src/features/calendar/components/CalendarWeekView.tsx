// apps/web/src/features/calendar/components/CalendarWeekView.tsx

import {
  getWeekDays,
  getAppointmentsForDate,
  isToday,
  formatTime,
} from '../utils/calendar.helpers';
import type { CalendarAppointment } from '../types/calendar.types';
import styles from '../Calendar.module.css';

interface CalendarWeekViewProps {
  currentDate: Date;
  appointments: CalendarAppointment[];
  onAppointmentClick: (appointment: CalendarAppointment) => void;
}

export function CalendarWeekView({
  currentDate,
  appointments,
  onAppointmentClick,
}: CalendarWeekViewProps) {
  const weekDays = getWeekDays(currentDate);

  return (
    <div className={styles.weekView}>
      <div className={styles.weekDayHeaders}>
        {weekDays.map((date, i) => {
          const today = isToday(date);
          return (
            <div
              key={i}
              className={`${styles.weekDayHeader} ${today ? styles.weekDayHeaderToday : ''}`}
            >
              <p className={styles.weekDayName}>
                {date.toLocaleDateString('en-US', { weekday: 'short' })}
              </p>
              <p className={styles.weekDayNumber}>{date.getDate()}</p>
            </div>
          );
        })}
      </div>

      <div className={styles.weekGrid}>
        {weekDays.map((date, i) => {
          const dayAppointments = getAppointmentsForDate(appointments, date);
          const today = isToday(date);

          return (
            <div
              key={i}
              className={`${styles.weekDayColumn} ${today ? styles.weekDayColumnToday : ''}`}
            >
              {dayAppointments.length === 0 ? (
                <p className={styles.emptyDayText}>No appointments</p>
              ) : (
                <div className={styles.weekAppointmentsList}>
                  {dayAppointments.map((apt) => (
                    <div
                      key={apt.id}
                      className={styles.weekAppointmentCard}
                      onClick={() => onAppointmentClick(apt)}
                    >
                      <p className={styles.weekAppointmentTime}>
                        {formatTime(apt.appointment_time)}
                      </p>
                      <p className={styles.weekAppointmentClient}>{apt.user?.full_name}</p>
                      <p className={styles.weekAppointmentLocation}>
                        {apt.user?.full_name?.split(' ')[1] || 'Studio'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
