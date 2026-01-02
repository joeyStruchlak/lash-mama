'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/Card';
import type { User } from '@supabase/supabase-js';
import type { AdminStats } from '@/types/user';
import { DashboardSidebar } from '@/components/DashboardSidebar';

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    vipUsers: 0,
    todayBookings: 0,
    todayRevenue: 0,
  });

  useEffect(() => {
    async function checkAdminAccess(): Promise<void> {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          router.push('/login');
          return;
        }

        setUser(user);

        // Check if user is admin
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profileError || profile?.role !== 'admin') {
          // Not an admin - redirect to home
          router.push('/');
          return;
        }

        setIsAdmin(true);
        await loadAdminStats();
      } catch (error) {
        console.error('Error checking admin access:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    }

    checkAdminAccess();
  }, [router]);

  const loadAdminStats = async (): Promise<void> => {
    try {
      // Get total users
      const { count: usersCount, error: usersError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      if (usersError) {
        console.error('Error counting users:', usersError);
      }

      // Get VIP users
      const { count: vipCount, error: vipError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'vip');

      if (vipError) {
        console.error('Error counting VIP users:', vipError);
      }

      // Get total bookings
      const { count: bookingsCount, error: bookingsError } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true });

      if (bookingsError) {
        console.error('Error counting bookings:', bookingsError);
      }

      // Get ALL appointments for revenue calculation
      const { data: allAppointments, error: allAppointmentsError } = await supabase
        .from('appointments')
        .select('total_price, appointment_date, status');

      if (allAppointmentsError) {
        console.error('Error fetching appointments:', allAppointmentsError);
      }

      // Calculate total revenue
      const totalRevenue = allAppointments?.reduce(
        (sum, booking) => sum + (booking.total_price || 0), 
        0
      ) || 0;

      // Calculate today's stats
      const today = new Date().toISOString().split('T')[0];
      const todayAppointments = allAppointments?.filter(
        apt => apt.appointment_date === today
      ) || [];

      const todayRevenue = todayAppointments.reduce(
        (sum, booking) => sum + (booking.total_price || 0), 
        0
      );

      setStats({
        totalUsers: usersCount || 0,
        vipUsers: vipCount || 0,
        totalBookings: bookingsCount || 0,
        totalRevenue,
        todayBookings: todayAppointments.length,
        todayRevenue,
      });

    } catch (error) {
      console.error('Error loading admin stats:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gold-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gold-600 border-r-transparent mb-4"></div>
          <p className="text-xl text-dark-secondary">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

return (
  <div className="flex min-h-screen bg-gold-50">
    <DashboardSidebar 
      userRole="admin"
      unreadNotifications={0}
      unreadMessages={0}
    />
    
    <main className="flex-1 py-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-serif font-bold text-dark mb-4">
            Admin Dashboard
          </h1>
          <p className="text-xl text-dark-secondary">
            Manage your salon business
          </p>
        </div>

        {/* Today's Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card className="text-center p-6">
            <p className="text-dark-secondary mb-2">Today's Revenue</p>
            <h3 className="text-4xl font-serif font-bold text-gold-600">
              ${stats.todayRevenue.toFixed(2)}
            </h3>
          </Card>

          <Card className="text-center p-6">
            <p className="text-dark-secondary mb-2">Today's Bookings</p>
            <h3 className="text-4xl font-serif font-bold text-dark">
              {stats.todayBookings}
            </h3>
          </Card>
        </div>

        {/* All-Time Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="text-center p-6">
            <p className="text-dark-secondary mb-2">Total Users</p>
            <h3 className="text-3xl font-serif font-bold text-dark">
              {stats.totalUsers}
            </h3>
          </Card>

          <Card className="text-center p-6">
            <p className="text-dark-secondary mb-2">VIP Members</p>
            <h3 className="text-3xl font-serif font-bold text-gold-600">
              {stats.vipUsers}
            </h3>
          </Card>

          <Card className="text-center p-6">
            <p className="text-dark-secondary mb-2">Total Bookings</p>
            <h3 className="text-3xl font-serif font-bold text-dark">
              {stats.totalBookings}
            </h3>
          </Card>

          <Card className="text-center p-6">
            <p className="text-dark-secondary mb-2">All-Time Revenue</p>
            <h3 className="text-3xl font-serif font-bold text-gold-600">
              ${stats.totalRevenue.toFixed(2)}
            </h3>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="p-6">
          <h3 className="text-2xl font-serif font-bold text-dark mb-6">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => router.push('/admin/bookings')}
              className="p-4 border-2 border-gold-300 rounded-lg hover:bg-gold-50 transition-colors text-left"
            >
              <h4 className="font-serif font-bold text-dark mb-2">View Bookings</h4>
              <p className="text-sm text-dark-secondary">Manage all appointments</p>
            </button>
            <button 
              onClick={() => router.push('/admin/users')}
              className="p-4 border-2 border-gold-300 rounded-lg hover:bg-gold-50 transition-colors text-left"
            >
              <h4 className="font-serif font-bold text-dark mb-2">Manage Users</h4>
              <p className="text-sm text-dark-secondary">View and edit user accounts</p>
            </button>
            <button 
              onClick={() => router.push('/admin/services')}
              className="p-4 border-2 border-gold-300 rounded-lg hover:bg-gold-50 transition-colors text-left"
            >
              <h4 className="font-serif font-bold text-dark mb-2">Services & Staff</h4>
              <p className="text-sm text-dark-secondary">Update services and team</p>
            </button>
          </div>
        </Card>
      </div>
    </main>
  </div>
);
}