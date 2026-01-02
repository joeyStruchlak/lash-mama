export type UserRole = 'user' | 'vip' | 'admin' | 'manager' | 'staff';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  vip_streak: number;
  last_booking_date: string | null;
  birthday: string | null;
  created_at: string;
}

export interface AdminStats {
  totalUsers: number;
  totalBookings: number;
  totalRevenue: number;
  vipUsers: number;
  todayBookings: number;
  todayRevenue: number;
}

export interface ManagerStats {
  totalUsers: number;
  totalBookings: number;
  vipUsers: number;
  todayBookings: number;
  staffOnDuty: number;
}

export interface StaffStats {
  myBookingsToday: number;
  myBookingsWeek: number;
  upcomingAppointments: number;
}