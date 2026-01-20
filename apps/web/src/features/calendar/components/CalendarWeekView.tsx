// apps/web/src/features/calendar/components/CalendarWeekView.tsx

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [isMobile, setIsMobile] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Find today's index to start on that slide - ONLY RUN ONCE
  useEffect(() => {
    if (isMobile && !hasInitialized) {
      const todayIndex = weekDays.findIndex((date) => isToday(date));
      if (todayIndex !== -1) {
        // Start at slide containing today (0: Sun-Tue, 1: Wed-Fri, 2: Sat)
        const slideIndex = Math.floor(todayIndex / 3);
        console.log(
          '🎬 Initial setup - Today index:',
          todayIndex,
          'Starting at slide:',
          slideIndex
        );
        setCurrentSlide(slideIndex);
      }
      setHasInitialized(true);
    }
  }, [isMobile, hasInitialized]);

  const totalSlides = 3; // Sun-Tue, Wed-Fri, Sat alone

  const getVisibleDays = () => {
    if (!isMobile) return weekDays;

    const start = currentSlide * 3;
    const end = Math.min(start + 3, weekDays.length);
    console.log('🔍 Current Slide:', currentSlide);
    console.log('📅 Visible Days Range:', start, 'to', end);
    console.log('📊 Total Week Days:', weekDays.length);
    return weekDays.slice(start, end);
  };

  const canGoPrev = currentSlide > 0;
  const canGoNext = currentSlide < 2; // 0, 1, 2 = 3 slides total

  const handlePrev = () => {
    console.log('⬅️ PREV clicked - Current:', currentSlide, 'Can go?', canGoPrev);
    if (canGoPrev) {
      const newSlide = currentSlide - 1;
      console.log('✅ Moving to slide:', newSlide);
      setCurrentSlide(newSlide);
    } else {
      console.log('❌ Cannot go previous');
    }
  };

  const handleNext = () => {
    console.log('➡️ NEXT clicked - Current:', currentSlide, 'Can go?', canGoNext);
    if (canGoNext) {
      const newSlide = currentSlide + 1;
      console.log('✅ Moving to slide:', newSlide);
      setCurrentSlide(newSlide);
    } else {
      console.log('❌ Cannot go next');
    }
  };

  console.log('🎯 Render - isMobile:', isMobile, 'currentSlide:', currentSlide);

  const visibleDays = getVisibleDays();

  return (
    <div className={styles.weekViewCompact}>
      {/* Mobile Navigation */}
      {isMobile && (
        <div className={styles.mobileNavigation}>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('🔴 LEFT BUTTON CLICKED!!!');
              handlePrev();
            }}
            disabled={!canGoPrev}
            className={styles.navButton}
          >
            <ChevronLeft size={20} />
          </button>
          <div className={styles.slideIndicator}>
            {Array.from({ length: totalSlides }).map((_, i) => (
              <div
                key={i}
                className={`${styles.slideDot} ${i === currentSlide ? styles.slideDotActive : ''}`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('🔴 RIGHT BUTTON CLICKED!!!');
              handleNext();
            }}
            disabled={!canGoNext}
            className={styles.navButton}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* Day Headers */}
      <div className={`${styles.weekHeaderRow} ${isMobile ? styles.weekHeaderRowMobile : ''}`}>
        {visibleDays.map((date, i) => {
          const today = isToday(date);
          return (
            <div
              key={i}
              className={`${styles.weekHeaderCell} ${today ? styles.weekHeaderCellToday : ''}`}
            >
              <div className={styles.weekHeaderDay}>
                {date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}
              </div>
              <div className={styles.weekHeaderDate}>{date.getDate()}</div>
            </div>
          );
        })}
      </div>

      {/* Appointments Grid */}
      <div
        className={`${styles.weekAppointmentsRow} ${isMobile ? styles.weekAppointmentsRowMobile : ''}`}
      >
        {visibleDays.map((date, i) => {
          const dayAppointments = getAppointmentsForDate(appointments, date);
          const today = isToday(date);

          return (
            <div
              key={i}
              className={`${styles.weekDayCell} ${today ? styles.weekDayCellToday : ''}`}
            >
              {dayAppointments.length === 0 ? (
                <div className={styles.emptyState}>No appointments</div>
              ) : (
                <div className={styles.appointmentsList}>
                  {dayAppointments.map((apt) => (
                    <div
                      key={apt.id}
                      className={styles.appointmentChip}
                      onClick={() => onAppointmentClick(apt)}
                    >
                      <div className={styles.appointmentTime}>
                        {formatTime(apt.appointment_time)}
                      </div>
                      <div className={styles.appointmentName}>
                        {apt.user?.full_name || 'Unknown'}
                      </div>
                      <div className={styles.appointmentLocation}>
                        {apt.user?.full_name?.split(' ')[1] || 'Studio'}
                      </div>
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
