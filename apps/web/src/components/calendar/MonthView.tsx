'use client';

import type { CalendarAppointment } from '@/types/calendar';

interface MonthViewProps {
    currentDate: Date;
    appointments: CalendarAppointment[];
    onAppointmentClick?: (appointment: CalendarAppointment) => void;
}

export function MonthView({ currentDate, appointments, onAppointmentClick }: MonthViewProps) {

    // Get calendar grid data
    const getCalendarDays = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        // First day of month
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        // Start from Sunday of the week containing the first day
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - startDate.getDay());

        // End on Saturday of the week containing the last day
        const endDate = new Date(lastDay);
        endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

        const days = [];
        const currentDay = new Date(startDate);

        while (currentDay <= endDate) {
            days.push(new Date(currentDay));
            currentDay.setDate(currentDay.getDate() + 1);
        }

        return days;
    };

    const calendarDays = getCalendarDays();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get appointments for a specific day
    const getAppointmentsForDay = (date: Date): CalendarAppointment[] => {
        const dateStr = date.toISOString().split('T')[0];
        return appointments.filter(apt => {
            const aptDate = apt.appointment_date;
            return aptDate === dateStr;
        });
    };

    const isToday = (date: Date): boolean => {
        return date.toDateString() === today.toDateString();
    };

    const isCurrentMonth = (date: Date): boolean => {
        return date.getMonth() === currentDate.getMonth();
    };

    const getStatusColor = (status: string): string => {
        switch (status) {
            case 'confirmed':
                return 'bg-blue-500';
            case 'completed':
                return 'bg-green-500';
            case 'cancelled':
                return 'bg-red-500';
            default:
                return 'bg-yellow-500';
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border-2 border-gold-100 overflow-hidden">

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 border-b border-gold-200 bg-gold-50">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div
                        key={day}
                        className="py-3 text-center text-sm font-semibold text-dark-secondary"
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7">
                {calendarDays.map((day, index) => {
                    const dayAppointments = getAppointmentsForDay(day);
                    const isTodayDate = isToday(day);
                    const isInCurrentMonth = isCurrentMonth(day);

                    return (
                        <div
                            key={index}
                            className={`
                min-h-[120px] border-r border-b border-gold-100 p-2
                ${!isInCurrentMonth ? 'bg-gray-50' : 'bg-white'}
                ${isTodayDate ? 'bg-gold-50 ring-2 ring-gold-600 ring-inset' : ''}
                hover:bg-gold-50 transition-colors
              `}
                        >
                            {/* Day Number */}
                            <div className="flex justify-between items-center mb-1">
                                <span
                                    className={`
                    text-sm font-semibold
                    ${!isInCurrentMonth ? 'text-gray-400' : 'text-dark'}
                    ${isTodayDate ? 'text-gold-700' : ''}
                  `}
                                >
                                    {day.getDate()}
                                </span>

                                {dayAppointments.length > 0 && (
                                    <span className="text-xs text-dark-secondary">
                                        {dayAppointments.length}
                                    </span>
                                )}
                            </div>

                            {/* Appointment Dots */}
                            <div className="space-y-1">
                                {dayAppointments.slice(0, 3).map((apt) => {
                                    // Format time from HH:MM:SS format
                                    const formatTime = (timeStr: string): string => {
                                        if (!timeStr) return 'TBD';
                                        const [hours, minutes] = timeStr.split(':');
                                        const hour = parseInt(hours, 10);
                                        const period = hour >= 12 ? 'PM' : 'AM';
                                        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
                                        return `${displayHour}:${minutes}${period}`;
                                    };

                                    const timeDisplay = formatTime(apt.appointment_time);
                                    const serviceName = apt.services[0]?.name || 'Service';

                                    return (
                                        <button
                                            key={apt.id}
                                            onClick={() => onAppointmentClick?.(apt)}
                                            className={`
        w-full text-left px-2 py-1 rounded text-xs truncate
        ${getStatusColor(apt.status)} bg-opacity-20
        hover:bg-opacity-30 transition-all
        border-l-2 ${getStatusColor(apt.status)}
      `}
                                            title={`${timeDisplay} - ${serviceName}`}
                                        >
                                            <span className="font-medium">
                                                {timeDisplay}
                                            </span>
                                            {' '}
                                            <span className="text-dark-secondary">
                                                {serviceName}
                                            </span>
                                        </button>
                                    );
                                })}

                                {dayAppointments.length > 3 && (
                                    <div className="text-xs text-center text-dark-secondary pt-1">
                                        +{dayAppointments.length - 3} more
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}