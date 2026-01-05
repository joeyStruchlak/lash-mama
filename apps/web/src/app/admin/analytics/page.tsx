'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { DollarSign, TrendingUp, Users, Crown, Calendar, Award } from 'lucide-react';
import type { DashboardStats, ServiceStats, StaffPerformance } from '@/types/analytics';

export default function AnalyticsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [serviceStats, setServiceStats] = useState<ServiceStats[]>([]);
  const [staffPerformance, setStaffPerformance] = useState<StaffPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  async function fetchAnalytics(): Promise<void> {
    try {
      setLoading(true);
      setError(null);

      // Fetch all completed appointments
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          id,
          total_price,
          status,
          user_id,
          services:service_id(name, category),
          staff:staff_id(name, tier)
        `)
        .eq('status', 'completed');

      if (appointmentsError) throw appointmentsError;

      // Calculate dashboard stats
      const totalRevenue = appointments?.reduce((sum, a) => sum + a.total_price, 0) || 0;
      const totalBookings = appointments?.length || 0;

      // Get unique clients
      const uniqueClients = new Set(appointments?.map(a => a.user_id) || []).size;

      // Get VIP count
      const { data: vipData, error: vipError } = await supabase
        .from('users')
        .select('id')
        .eq('role', 'vip');

      if (vipError) throw vipError;

      const vipClients = vipData?.length || 0;

      const avgBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

      setStats({
        total_revenue: totalRevenue,
        total_bookings: totalBookings,
        total_clients: uniqueClients,
        vip_clients: vipClients,
        avg_booking_value: avgBookingValue,
        growth_rate: 12.5, // Placeholder
      });

      // Service stats
      const serviceMap = new Map<string, ServiceStats>();
      appointments?.forEach((apt: any) => {
        const serviceName = apt.services?.name || 'Unknown';
        const category = apt.services?.category || 'Unknown';
        
        if (!serviceMap.has(serviceName)) {
          serviceMap.set(serviceName, {
            service_name: serviceName,
            category: category,
            total_bookings: 0,
            total_revenue: 0,
          });
        }
        
        const service = serviceMap.get(serviceName)!;
        service.total_bookings += 1;
        service.total_revenue += apt.total_price;
      });

      const serviceStatsArray = Array.from(serviceMap.values())
        .sort((a, b) => b.total_revenue - a.total_revenue)
        .slice(0, 5);

      setServiceStats(serviceStatsArray);

      // Staff performance
      const staffMap = new Map<string, StaffPerformance>();
      appointments?.forEach((apt: any) => {
        const staffName = apt.staff?.name || 'Unknown';
        const tier = apt.staff?.tier || 'standard';
        
        if (!staffMap.has(staffName)) {
          staffMap.set(staffName, {
            staff_name: staffName,
            tier: tier,
            total_bookings: 0,
            total_revenue: 0,
            avg_rating: 4.8, // Placeholder
          });
        }
        
        const staff = staffMap.get(staffName)!;
        staff.total_bookings += 1;
        staff.total_revenue += apt.total_price;
      });

      const staffPerformanceArray = Array.from(staffMap.values())
        .sort((a, b) => b.total_revenue - a.total_revenue);

      setStaffPerformance(staffPerformanceArray);

    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
    }).format(amount);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FAFAF7]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#C9A871] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-[#2A2A2A]">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FAFAF7]">
        <div className="text-center">
          <p className="text-red-600 text-lg">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="mt-4 px-6 py-2 bg-[#C9A871] text-white rounded-lg hover:bg-[#B89761] transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-4xl font-bold text-[#2A2A2A] mb-2"
            style={{ fontFamily: 'Cormorant Garamond, serif' }}
          >
            Analytics Dashboard
          </h1>
          <p className="text-[#3D3D3D]">Business insights and performance metrics</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Total Revenue */}
          <div className="bg-gradient-to-br from-[#C9A871] to-[#D4AF37] text-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <DollarSign size={32} />
              <span className="text-sm opacity-90">Total Revenue</span>
            </div>
            <p className="text-4xl font-bold mb-2">{formatCurrency(stats?.total_revenue || 0)}</p>
            <p className="text-sm opacity-90">All time earnings</p>
          </div>

          {/* Total Bookings */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <Calendar size={32} />
              <span className="text-sm opacity-90">Total Bookings</span>
            </div>
            <p className="text-4xl font-bold mb-2">{stats?.total_bookings || 0}</p>
            <p className="text-sm opacity-90">Completed appointments</p>
          </div>

          {/* Total Clients */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <Users size={32} />
              <span className="text-sm opacity-90">Total Clients</span>
            </div>
            <p className="text-4xl font-bold mb-2">{stats?.total_clients || 0}</p>
            <p className="text-sm opacity-90">Unique customers</p>
          </div>

          {/* VIP Clients */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <Crown size={32} />
              <span className="text-sm opacity-90">VIP Clients</span>
            </div>
            <p className="text-4xl font-bold mb-2">{stats?.vip_clients || 0}</p>
            <p className="text-sm opacity-90">Loyalty members</p>
          </div>

          {/* Avg Booking Value */}
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <Award size={32} />
              <span className="text-sm opacity-90">Avg Booking</span>
            </div>
            <p className="text-4xl font-bold mb-2">{formatCurrency(stats?.avg_booking_value || 0)}</p>
            <p className="text-sm opacity-90">Per appointment</p>
          </div>

          {/* Growth Rate */}
          <div className="bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp size={32} />
              <span className="text-sm opacity-90">Growth Rate</span>
            </div>
            <p className="text-4xl font-bold mb-2">{stats?.growth_rate || 0}%</p>
            <p className="text-sm opacity-90">Month over month</p>
          </div>
        </div>

        {/* Service Stats */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-bold text-[#2A2A2A] mb-6">Top Services</h2>
          <div className="space-y-4">
            {serviceStats.map((service, index) => (
              <div key={service.service_name} className="flex items-center justify-between p-4 bg-[#FAFAF7] rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#C9A871] text-white flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-[#2A2A2A]">{service.service_name}</p>
                    <p className="text-sm text-[#3D3D3D]">{service.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#C9A871]">{formatCurrency(service.total_revenue)}</p>
                  <p className="text-sm text-[#3D3D3D]">{service.total_bookings} bookings</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Staff Performance */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-2xl font-bold text-[#2A2A2A] mb-6">Staff Performance</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F5F2EF]">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#2A2A2A]">Staff Member</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#2A2A2A]">Tier</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#2A2A2A]">Bookings</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#2A2A2A]">Revenue</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#2A2A2A]">Avg/Booking</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {staffPerformance.map((staff) => (
                  <tr key={staff.staff_name} className="hover:bg-[#FAFAF7] transition">
                    <td className="px-6 py-4 font-medium text-[#2A2A2A]">{staff.staff_name}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                        {staff.tier}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#3D3D3D]">{staff.total_bookings}</td>
                    <td className="px-6 py-4 font-semibold text-[#C9A871]">{formatCurrency(staff.total_revenue)}</td>
                    <td className="px-6 py-4 text-[#3D3D3D]">
                      {formatCurrency(staff.total_revenue / staff.total_bookings)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}