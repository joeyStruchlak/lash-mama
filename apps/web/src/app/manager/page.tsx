'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/Card';
import type { User } from '@supabase/supabase-js';
import type { ManagerStats } from '@/types/user';
import { DashboardSidebar } from '@/components/DashboardSidebar';

export default function ManagerPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isManager, setIsManager] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ManagerStats>({
    totalUsers: 0,
    totalBookings: 0,
    vipUsers: 0,
    todayBookings: 0,
    staffOnDuty: 0,
  });

  useEffect(() => {
    async function checkManagerAccess(): Promise<void> {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          router.push('/login');
          return;
        }

        setUser(user);

        // Check if user is manager
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profileError || profile?.role !== 'manager') {
          // Not a manager - redirect to home
          router.push('/');
          return;
        }

        setIsManager(true);
        await loadManagerStats();
      } catch (error) {
        console.error('Error checking manager access:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    }

    checkManagerAccess();
  }, [router]);

  const loadManagerStats = async (): Promise<void> => {
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

      // Get today's bookings (NO REVENUE - managers can't see money)
      const today = new Date().toISOString().split('T')[0];
      const { count: todayCount, error: todayError } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('appointment_date', today);

      if (todayError) {
        console.error('Error counting today bookings:', todayError);
      }

      // Get active staff count
      const { count: staffCount, error: staffError } = await supabase
        .from('staff')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      if (staffError) {
        console.error('Error counting staff:', staffError);
      }

      setStats({
        totalUsers: usersCount || 0,
        vipUsers: vipCount || 0,
        totalBookings: bookingsCount || 0,
        todayBookings: todayCount || 0,
        staffOnDuty: staffCount || 0,
      });

    } catch (error) {
      console.error('Error loading manager stats:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gold-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gold-600 border-r-transparent mb-4"></div>
          <p className="text-xl text-dark-secondary">Loading manager dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isManager) {
    return null;
  }

return (
  <div className="flex min-h-screen bg-gold-50">
    <DashboardSidebar 
      userRole="manager"
      unreadNotifications={0}
      unreadMessages={0}
    />
    
    <main className="flex-1 py-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-serif font-bold text-dark mb-4">
            Manager Dashboard
          </h1>
          <p className="text-xl text-dark-secondary">
            Operations overview
          </p>
        </div>

        {/* Today's Stats - NO REVENUE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card className="text-center p-6">
            <p className="text-dark-secondary mb-2">Today's Bookings</p>
            <h3 className="text-4xl font-serif font-bold text-dark">
              {stats.todayBookings}
            </h3>
          </Card>

          <Card className="text-center p-6">
            <p className="text-dark-secondary mb-2">Total Clients</p>
            <h3 className="text-4xl font-serif font-bold text-dark">
              {stats.totalUsers}
            </h3>
          </Card>
        </div>

        {/* All Stats Grid - NO MONEY */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center p-6">
            <p className="text-dark-secondary mb-2">Total Bookings</p>
            <h3 className="text-3xl font-serif font-bold text-dark">
              {stats.totalBookings}
            </h3>
          </Card>

          <Card className="text-center p-6">
            <p className="text-dark-secondary mb-2">VIP Members</p>
            <h3 className="text-3xl font-serif font-bold text-gold-600">
              {stats.vipUsers}
            </h3>
          </Card>

          <Card className="text-center p-6">
            <p className="text-dark-secondary mb-2">Staff Active</p>
            <h3 className="text-3xl font-serif font-bold text-dark">
              {stats.staffOnDuty}
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
              onClick={() => router.push('/manager/bookings')}
              className="p-4 border-2 border-gold-300 rounded-lg hover:bg-gold-50 transition-colors text-left"
            >
              <h4 className="font-serif font-bold text-dark mb-2">View Bookings</h4>
              <p className="text-sm text-dark-secondary">Manage all appointments</p>
            </button>
            <button 
              onClick={() => router.push('/manager/clients')}
              className="p-4 border-2 border-gold-300 rounded-lg hover:bg-gold-50 transition-colors text-left"
            >
              <h4 className="font-serif font-bold text-dark mb-2">Manage Clients</h4>
              <p className="text-sm text-dark-secondary">View client database</p>
            </button>
            <button 
              onClick={() => router.push('/manager/staff')}
              className="p-4 border-2 border-gold-300 rounded-lg hover:bg-gold-50 transition-colors text-left"
            >
              <h4 className="font-serif font-bold text-dark mb-2">Staff Schedule</h4>
              <p className="text-sm text-dark-secondary">Manage team schedules</p>
            </button>
          </div>
        </Card>
      </div>
    </main>
  </div>
);
}