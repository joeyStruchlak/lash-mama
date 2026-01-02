'use client';

import type { CalendarAppointment } from '@/types/calendar';

interface DayViewProps {
  currentDate: Date;
  appointments: CalendarAppointment[];
  onAppointmentClick?: (appointment: CalendarAppointment) => void;
}

export function DayView({ currentDate, appointments, onAppointmentClick }: DayViewProps) {
  
  // Business hours: 8 AM - 8 PM
  const hours = Array.from({ length: 13 }, (_, i) => i + 8);

  const getAppointmentsForHour = (hour: number): CalendarAppointment[] => {
    const dateStr = currentDate.toISOString().split('T')[0];
    
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
      
      {/* Day Header */}
      <div className="bg-gold-50 border-b-2 border-gold-200 py-6 text-center">
        <div className="text-sm font-medium text-dark-secondary">
          {currentDate.toLocaleDateString('en-US', { weekday: 'long' })}
        </div>
        <div className="text-4xl font-bold text-dark mt-2">
          {currentDate.getDate()}
        </div>
        <div className="text-sm text-dark-secondary mt-1">
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* Time slots */}
      <div className="overflow-auto max-h-[600px]">
        {hours.map((hour) => {
          const hourAppointments = getAppointmentsForHour(hour);

          return (
            <div key={hour} className="flex border-b border-gold-100 hover:bg-gold-50 transition-colors">
              
              {/* Hour label */}
              <div className="w-24 flex-shrink-0 py-4 px-4 text-sm font-medium text-dark-secondary bg-gray-50 border-r border-gold-100">
                {formatHour(hour)}
              </div>

              {/* Appointments */}
              <div className="flex-1 p-4 space-y-2">
                {hourAppointments.length === 0 ? (
                  <div className="text-sm text-dark-secondary italic">No appointments</div>
                ) : (
                  hourAppointments.map((apt) => (
                    <button
                      key={apt.id}
                      onClick={() => onAppointmentClick?.(apt)}
                      className={`
                        w-full text-left p-4 rounded-lg
                        border-l-4 ${getStatusColor(apt.status)}
                        hover:shadow-md transition-all
                      `}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-bold text-lg">
                            {new Date(apt.appointment_time).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </div>
                          <div className="text-sm font-semibold mt-1">
                            {apt.services[0]?.name || 'Service'}
                          </div>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full bg-white bg-opacity-50 font-semibold">
                          {apt.status}
                        </span>
                      </div>
                      
                      <div className="text-sm space-y-1">
                        <div>
                          <span className="text-dark-secondary">Client:</span>{' '}
                          <span className="font-medium">
                            {apt.users?.[0]?.full_name || apt.users?.[0]?.email || 'Unknown'}
                          </span>
                        </div>
                        <div>
                          <span className="text-dark-secondary">Artist:</span>{' '}
                          <span className="font-medium">
                            {apt.staff[0]?.name || 'Unknown'}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}