'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ChevronLeft, ChevronRight, Filter, Plus, Calendar as CalIcon, Grid3x3 } from 'lucide-react';
import styles from './StaffCalendar.module.css';

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  total_price: number;
  user: {
    full_name: string;
  };
  service: {
    name: string;
  };
}

type ViewMode = 'day' | 'week' | 'month';

export default function StaffCalendarPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [loading, setLoading] = useState(true);
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [expectedRevenue, setExpectedRevenue] = useState(0);

  useEffect(() => {
    fetchCalendarData();
  }, [currentDate, viewMode]);

  async function fetchCalendarData() {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: staffProfile } = await supabase
        .from('staff')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!staffProfile) return;

      let startDate: Date, endDate: Date;

      if (viewMode === 'day') {
        startDate = new Date(currentDate);
        endDate = new Date(currentDate);
      } else if (viewMode === 'week') {
        startDate = new Date(currentDate);
        startDate.setDate(currentDate.getDate() - currentDate.getDay());
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
      } else {
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      }

      const { data: appointmentsData } = await supabase
        .from('appointments')
        .select(`
          *,
          user:user_id(full_name),
          service:service_id(name)
        `)
        .eq('staff_id', staffProfile.id)
        .gte('appointment_date', startDate.toISOString().split('T')[0])
        .lte('appointment_date', endDate.toISOString().split('T')[0])
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true });

      const apts = (appointmentsData as any) || [];
      setAppointments(apts);

      if (viewMode === 'month') {
        const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        const { data: monthAppointments } = await supabase
          .from('appointments')
          .select('id, total_price')
          .eq('staff_id', staffProfile.id)
          .gte('appointment_date', monthStart.toISOString().split('T')[0])
          .lte('appointment_date', monthEnd.toISOString().split('T')[0]);

        setTotalAppointments(monthAppointments?.length || 0);
        setExpectedRevenue(monthAppointments?.reduce((sum, apt) => sum + (apt.total_price || 0), 0) || 0);
      }

    } catch (err) {
      console.error('Error fetching calendar:', err);
    } finally {
      setLoading(false);
    }
  }

  function formatTime(timeStr: string): string {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  }

  function navigate(direction: 'prev' | 'next') {
    const newDate = new Date(currentDate);
    
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    
    setCurrentDate(newDate);
  }

  function getHeaderText(): string {
    if (viewMode === 'day') {
      return currentDate.toLocaleDateString('en-US', { 
        weekday: 'long',
        month: 'long', 
        day: 'numeric',
        year: 'numeric'
      });
    } else if (viewMode === 'week') {
      const start = new Date(currentDate);
      start.setDate(currentDate.getDate() - currentDate.getDay());
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      
      return `Week of ${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    } else {
      return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
  }

  function getDaysInMonth() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  }

  function getWeekDays() {
    const start = new Date(currentDate);
    start.setDate(currentDate.getDate() - currentDate.getDay());
    
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      return date;
    });
  }

  function getAppointmentsForDate(date: Date) {
    const dateStr = date.toISOString().split('T')[0];
    return appointments.filter(apt => apt.appointment_date === dateStr);
  }

  function isToday(date: Date): boolean {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
      </div>
    );
  }

  return (
    <div className={styles.calendarCard}>
      {/* Calendar Header */}
      <div className={styles.calendarHeader}>
        <div>
          <h2 className={styles.calendarTitle}>Calendar</h2>
          <p className={styles.calendarSubtitle}>View and manage all appointments</p>
        </div>

        <div className={styles.headerActions}>
          <button className={styles.filterButton}>
            <Filter size={16} />
            Filter
          </button>

          <button className={styles.newAppointmentButton}>
            <Plus size={16} />
            New Appointment
          </button>
        </div>
      </div>

      {/* View Controls */}
      <div className={styles.viewControls}>
        <div className={styles.dateNavigation}>
          <h3 className={styles.dateTitle}>{getHeaderText()}</h3>

          <div className={styles.navigationButtons}>
            <button onClick={() => navigate('prev')} className={styles.navButton}>
              <ChevronLeft size={18} />
            </button>
            <button onClick={() => navigate('next')} className={styles.navButton}>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className={styles.viewModeToggle}>
          <button
            onClick={() => setViewMode('day')}
            className={`${styles.viewModeButton} ${viewMode === 'day' ? styles.viewModeButtonActive : ''}`}
          >
            <CalIcon size={14} />
            Day
          </button>

          <button
            onClick={() => setViewMode('week')}
            className={`${styles.viewModeButton} ${viewMode === 'week' ? styles.viewModeButtonActive : ''}`}
          >
            <Grid3x3 size={14} />
            Week
          </button>

          <button
            onClick={() => setViewMode('month')}
            className={`${styles.viewModeButton} ${viewMode === 'month' ? styles.viewModeButtonActive : ''}`}
          >
            Month
          </button>
        </div>
      </div>

      {/* Week View */}
      {viewMode === 'week' && (
        <div>
          <div className={styles.weekDayHeaders}>
            {getWeekDays().map((date, i) => {
              const today = isToday(date);
              return (
                <div key={i} className={`${styles.weekDayHeader} ${today ? styles.weekDayHeaderToday : ''}`}>
                  <p className={`${styles.weekDayName} ${today ? styles.weekDayNameToday : styles.weekDayNameNormal}`}>
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </p>
                  <p className={`${styles.weekDayNumber} ${today ? styles.weekDayNumberToday : styles.weekDayNumberNormal}`}>
                    {date.getDate()}
                  </p>
                </div>
              );
            })}
          </div>

          <div className={styles.weekGrid}>
            {getWeekDays().map((date, i) => {
              const dayAppointments = getAppointmentsForDate(date);
              const today = isToday(date);

              return (
                <div key={i} className={`${styles.weekDayColumn} ${today ? styles.weekDayColumnToday : ''}`}>
                  {dayAppointments.length === 0 ? (
                    <p className={styles.emptyDayText}>No appointments</p>
                  ) : (
                    <div className={styles.weekAppointmentsList}>
                      {dayAppointments.map((apt: any) => (
                        <div
                          key={apt.id}
                          className={`${styles.weekAppointmentCard} ${
                            apt.status === 'completed' ? styles.weekAppointmentCardCompleted : ''
                          }`}
                        >
                          <p className={`${styles.weekAppointmentTime} ${
                            apt.status === 'completed' ? styles.weekAppointmentTimeCompleted : styles.weekAppointmentTimeConfirmed
                          }`}>
                            {formatTime(apt.appointment_time)}
                          </p>
                          <p className={styles.weekAppointmentClient}>{apt.user?.full_name}</p>
                          <p className={styles.weekAppointmentService}>{apt.service?.name}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Month View */}
      {viewMode === 'month' && (
        <div>
          <div className={styles.monthStats}>
            <div className={`${styles.monthStatCard} ${styles.monthStatCardAppointments}`}>
              <p className={`${styles.monthStatValue} ${styles.monthStatValueOrange}`}>
                {totalAppointments}
              </p>
              <p className={styles.monthStatLabel}>Appointments</p>
            </div>

            <div className={`${styles.monthStatCard} ${styles.monthStatCardRevenue}`}>
              <p className={`${styles.monthStatValue} ${styles.monthStatValueGold}`}>
                ${expectedRevenue.toFixed(0)}
              </p>
              <p className={styles.monthStatLabel}>Expected</p>
            </div>
          </div>

          <div className={styles.monthDayHeaders}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className={styles.monthDayHeader}>{day}</div>
            ))}
          </div>

          <div className={styles.monthGrid}>
            {getDaysInMonth().map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} />;
              }

              const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
              const dayAppointments = getAppointmentsForDate(date);
              const today = isToday(date);

              return (
                <div key={day} className={`${styles.monthDayCell} ${today ? styles.monthDayCellToday : ''}`}>
                  <div className={`${styles.monthDayNumber} ${today ? styles.monthDayNumberToday : styles.monthDayNumberNormal}`}>
                    {day}
                  </div>

                  {dayAppointments.length > 0 && (
                    <div className={styles.monthAppointmentDots}>
                      {dayAppointments.slice(0, 2).map((apt: any) => (
                        <div
                          key={apt.id}
                          className={`${styles.monthAppointmentDot} ${
                            apt.status === 'completed' ? styles.monthAppointmentDotCompleted : styles.monthAppointmentDotConfirmed
                          }`}
                        >
                          {formatTime(apt.appointment_time)}
                        </div>
                      ))}
                      {dayAppointments.length > 2 && (
                        <div className={styles.monthAppointmentMore}>
                          +{dayAppointments.length - 2}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Day View */}
      {viewMode === 'day' && (
        <div className={styles.dayViewContainer}>
          {getAppointmentsForDate(currentDate).length === 0 ? (
            <p className={styles.dayViewEmpty}>
              No appointments scheduled for this day
            </p>
          ) : (
            <div className={styles.dayAppointmentsList}>
              {getAppointmentsForDate(currentDate).map((apt: any) => (
                <div key={apt.id} className={styles.dayAppointmentCard}>
                  <div>
                    <p className={styles.dayAppointmentTime}>
                      {formatTime(apt.appointment_time)}
                    </p>
                    <p className={styles.dayAppointmentClient}>
                      {apt.user?.full_name}
                    </p>
                    <p className={styles.dayAppointmentService}>
                      {apt.service?.name}
                    </p>
                  </div>
                  <div>
                    <span className={`${styles.dayAppointmentStatus} ${
                      apt.status === 'completed' ? styles.dayAppointmentStatusCompleted : styles.dayAppointmentStatusPending
                    }`}>
                      {apt.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}