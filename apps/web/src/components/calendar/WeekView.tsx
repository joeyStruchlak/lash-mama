'use client';

import type { CalendarAppointment } from '@/types/calendar';


interface WeekViewProps {
  currentDate: Date;
  appointments: CalendarAppointment[];
  onAppointmentClick?: (appointment: CalendarAppointment) => void;
}

export function WeekView({ currentDate, appointments, onAppointmentClick }: WeekViewProps) {
  
  // Get week days (Sunday - Saturday)
  const getWeekDays = () => {
    const days = [];
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(day.getDate() + i);
      days.push(day);
    }
    
    return days;
  };

  const weekDays = getWeekDays();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Business hours: 8 AM - 8 PM
  const hours = Array.from({ length: 13 }, (_, i) => i + 8); // 8-20 (8am-8pm)

  const isToday = (date: Date): boolean => {
    return date.toDateString() === today.toDateString();
  };

    const getAppointmentsForDayAndHour = (date: Date, hour: number): CalendarAppointment[] => {
    const dateStr = date.toISOString().split('T')[0];
    
    return appointments.filter(apt => {
      const aptDate = apt.appointment_date;
      const aptTime = new Date(apt.appointment_time);
      const aptHour = aptTime.getHours();
      
      return aptDate === dateStr && aptHour === hour;
    });
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-100 border-blue-400 text-blue-900';
      case 'completed':
        return 'bg-green-100 border-green-400 text-green-900';
      case 'cancelled':
        return 'bg-red-100 border-red-400 text-red-900';
      default:
        return 'bg-yellow-100 border-yellow-400 text-yellow-900';
    }
  };

  const formatHour = (hour: number): string => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border-2 border-gold-100 overflow-hidden">
      
      {/* Header with days */}
      <div className="grid grid-cols-8 border-b-2 border-gold-200 bg-gold-50">
        <div className="py-4 px-2 text-center text-sm font-semibold text-dark-secondary">
          Time
        </div>
        {weekDays.map((day, index) => {
          const isTodayDate = isToday(day);
          return (
            <div
              key={index}
              className={`
                py-4 px-2 text-center border-l border-gold-200
                ${isTodayDate ? 'bg-gold-100' : ''}
              `}
            >
              <div className={`text-xs font-medium ${isTodayDate ? 'text-gold-700' : 'text-dark-secondary'}`}>
                {day.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className={`
                text-2xl font-bold mt-1
                ${isTodayDate ? 'text-gold-700' : 'text-dark'}
              `}>
                {day.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Time slots grid */}
      <div className="overflow-auto max-h-[600px]">
        {hours.map((hour) => (
          <div key={hour} className="grid grid-cols-8 border-b border-gold-100">
            
            {/* Hour label */}
            <div className="py-4 px-2 text-center text-sm font-medium text-dark-secondary bg-gray-50">
              {formatHour(hour)}
            </div>

            {/* Day columns */}
            {weekDays.map((day, dayIndex) => {
              const dayAppointments = getAppointmentsForDayAndHour(day, hour);
              const isTodayDate = isToday(day);

              return (
                <div
                  key={dayIndex}
                  className={`
                    min-h-[80px] p-2 border-l border-gold-100
                    ${isTodayDate ? 'bg-gold-50 bg-opacity-30' : ''}
                    hover:bg-gold-50 transition-colors
                  `}
                >
                  {dayAppointments.map((apt) => (
                    <button
                      key={apt.id}
                      onClick={() => onAppointmentClick?.(apt)}
                      className={`
                        w-full text-left p-2 rounded-lg mb-1
                        border-l-4 ${getStatusColor(apt.status)}
                        hover:shadow-md transition-all
                      `}
                    >
                      <div className="font-semibold text-sm truncate">
                        {new Date(apt.appointment_time).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </div>
                      <div className="text-xs truncate mt-1">
                        {apt.services[0]?.name || 'Service'}
                      </div>
                      <div className="text-xs opacity-75 truncate">
                        {apt.users?.[0]?.full_name || apt.users?.[0]?.email || 'Client'}
                      </div>
                      <div className="text-xs font-medium mt-1">
                        with {apt.staff[0]?.name || 'Staff'}
                      </div>
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}