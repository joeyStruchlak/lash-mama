export interface RevenueData {
  date: string;
  revenue: number;
  bookings: number;
}

export interface ServiceStats {
  service_name: string;
  category: string;
  total_bookings: number;
  total_revenue: number;
}

export interface StaffPerformance {
  staff_name: string;
  tier: string;
  total_bookings: number;
  total_revenue: number;
  avg_rating: number;
}

export interface DashboardStats {
  total_revenue: number;
  total_bookings: number;
  total_clients: number;
  vip_clients: number;
  avg_booking_value: number;
  growth_rate: number;
}

export interface StaffProfile {
  id: string;
  name: string;
  title: string;
  total_clients: number;
  rating: number;
  birthday: string;
  specialties: string[];
  avatar_url?: string;
  created_at?: string;
}

export interface TimeOffRequest {
  id: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface Milestone {
  id: string;
  title: string;
  date_achieved: string;
  icon: string;
}

export interface WeeklySchedule {
  [key: string]: {
    start: string;
    end: string;
  };
}

export interface WeeklyData {
  day: string;
  clients: number;
  hours: number;
}

export interface GrowthData {
  label: string;
  value: number;
}

export interface ThisWeekStats {
  clientsServed: number;
  hoursWorked: number;
  avgClientsPerDay: number;
}