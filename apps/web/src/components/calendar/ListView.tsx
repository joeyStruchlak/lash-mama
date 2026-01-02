'use client';

interface AppointmentData {
  id: string;
  appointment_time: string;
  appointment_date: string;
  status: string;
  services: { name: string }[];
  staff: { name: string }[];
  users?: { full_name: string | null; email: string }[];
}

interface ListViewProps {
  appointments: AppointmentData[];
  onAppointmentClick?: (appointment: AppointmentData) => void;
  title?: string;
}

export function ListView({ appointments, onAppointmentClick, title = 'Upcoming Appointments' }: ListViewProps) {

  // Group appointments by date
  const groupedAppointments = appointments.reduce((groups, apt) => {
    const date = apt.appointment_date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(apt);
    return groups;
  }, {} as Record<string, AppointmentData[]>);

  // Sort dates
  const sortedDates = Object.keys(groupedAppointments).sort();

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

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  if (appointments.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border-2 border-gold-100 p-12 text-center">
        <p className="text-dark-secondary text-lg">No appointments found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border-2 border-gold-100 overflow-hidden">

      {/* Header */}
      <div className="bg-gold-50 border-b-2 border-gold-200 py-4 px-6">
        <h3 className="text-xl font-serif font-bold text-dark">{title}</h3>
        <p className="text-sm text-dark-secondary mt-1">
          {appointments.length} appointment{appointments.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* List */}
      <div className="divide-y divide-gold-100">
        {sortedDates.map((date) => (
          <div key={date} className="p-6">

            {/* Date Header */}
            <h4 className="text-lg font-semibold text-dark mb-4">
              {formatDate(date)}
            </h4>

            {/* Appointments for this date */}
            <div className="space-y-3">
              {groupedAppointments[date]
                .sort((a, b) => {
                  // Parse time properly
                  const timeA = a.appointment_time || '00:00:00';
                  const timeB = b.appointment_time || '00:00:00';
                  return timeA.localeCompare(timeB);
                })
                .map((apt) => {
                  // Format time from appointment_time field (HH:MM:SS format)
                  const formatTime = (timeStr: string): string => {
                    if (!timeStr) return 'Time TBD';
                    const [hours, minutes] = timeStr.split(':');
                    const hour = parseInt(hours, 10);
                    const period = hour >= 12 ? 'PM' : 'AM';
                    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
                    return `${displayHour}:${minutes} ${period}`;
                  };

                  return (
                    <button
                      key={apt.id}
                      onClick={() => onAppointmentClick?.(apt)}
                      className={`
          w-full text-left p-4 rounded-lg
          border-l-4 ${getStatusColor(apt.status)}
          hover:shadow-md transition-all
        `}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-lg font-bold">
                              {formatTime(apt.appointment_time)}
                            </span>
                            <span className="text-xs px-2 py-1 rounded-full bg-white bg-opacity-50 font-semibold capitalize">
                              {apt.status}
                            </span>
                          </div>

                          <div className="text-base font-semibold text-dark mb-2">
                            {apt.services[0]?.name || 'Service'}
                          </div>

                          <div className="flex gap-4 text-sm text-dark-secondary">
                            <div>
                              <span className="font-medium">Client:</span>{' '}
                              {apt.users?.[0]?.full_name || apt.users?.[0]?.email || 'Walk-in'}
                            </div>
                            <div>
                              <span className="font-medium">Artist:</span>{' '}
                              {apt.staff[0]?.name || 'Staff TBD'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}