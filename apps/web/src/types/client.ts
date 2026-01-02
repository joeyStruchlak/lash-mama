export interface Client {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: string;
  vip_streak: number;
  birthday: string | null;
  created_at: string;
}

export interface ClientWithBookings extends Client {
  bookings: ClientBooking[];
}

export interface ClientBooking {
  id: string;
  appointment_date: string;
  appointment_time: string;
  total_price: number;
  status: string;
  service_name: string;
  staff_name: string;
}