// apps/web/src/features/calendar/utils/calendar.helpers.ts

/**
 * Calendar Utilities
 * Pure functions for date formatting, filtering, and calculations
 */

/**
 * Format time from HH:MM:SS to 12-hour format
 */
export function formatTime(timeStr: string): string {
  if (!timeStr) return 'Time TBD';
  const [hours, minutes] = timeStr.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

/**
 * Get initials from full name
 */
export function getInitials(name: string): string {
  if (!name) return '??';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Format birthday for display
 */
export function formatBirthday(birthday: string | null | undefined): string {
  if (!birthday) return 'Not set';
  const date = new Date(birthday);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Check if date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Get week days starting from Sunday
 */
export function getWeekDays(currentDate: Date): Date[] {
  const start = new Date(currentDate);
  start.setDate(currentDate.getDate() - currentDate.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    return date;
  });
}

/**
 * Get days in month with padding
 */
export function getDaysInMonth(currentDate: Date): (number | null)[] {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const days: (number | null)[] = [];

  // Add empty cells for days before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }

  // Add actual days
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  return days;
}

/**
 * Get date range for current view
 */
export function getDateRange(
  currentDate: Date,
  viewMode: 'day' | 'week' | 'month'
): { startDate: Date; endDate: Date } {
  let startDate: Date, endDate: Date;

  if (viewMode === 'week') {
    startDate = new Date(currentDate);
    startDate.setDate(currentDate.getDate() - currentDate.getDay());
    endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
  } else if (viewMode === 'month') {
    startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  } else {
    // day
    startDate = new Date(currentDate);
    endDate = new Date(currentDate);
  }

  return { startDate, endDate };
}

/**
 * Get header text based on view mode
 */
export function getHeaderText(currentDate: Date, viewMode: 'day' | 'week' | 'month'): string {
  if (viewMode === 'week') {
    const start = new Date(currentDate);
    start.setDate(currentDate.getDate() - currentDate.getDay());
    return `Week of ${start.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}`;
  } else if (viewMode === 'month') {
    return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  } else {
    return currentDate.toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
    });
  }
}

/**
 * Navigate date by direction
 */
export function navigateDate(
  currentDate: Date,
  direction: 'prev' | 'next',
  viewMode: 'day' | 'week' | 'month'
): Date {
  const newDate = new Date(currentDate);

  if (viewMode === 'week') {
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
  } else if (viewMode === 'month') {
    newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
  } else {
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
  }

  return newDate;
}

/**
 * Filter appointments for specific date
 */
export function getAppointmentsForDate(appointments: any[], date: Date): any[] {
  const dateStr = date.toISOString().split('T')[0];
  return appointments.filter((apt) => apt.appointment_date === dateStr);
}
