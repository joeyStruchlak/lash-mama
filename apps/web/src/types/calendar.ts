export interface CalendarAppointment {
  id: string;
  appointment_time: string;
  appointment_date: string;
  status: string;
  services: { name: string }[];
  staff: { name: string }[];
  users?: { full_name: string | null; email: string }[];
}