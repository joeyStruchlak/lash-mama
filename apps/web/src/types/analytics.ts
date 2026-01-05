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