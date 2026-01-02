'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/Card';
import type { User } from '@supabase/supabase-js';
import type { StaffStats } from '@/types/user';
import { DashboardSidebar } from '@/components/DashboardSidebar';

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  services: { name: string }[];
  users: { full_name: string | null; email: string }[];
}

export default function StaffPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isStaff, setIsStaff] = useState(false);
  const [loading, setLoading] = useState(true);
  const [staffId, setStaffId] = useState<string | null>(null);
  const [staffName, setStaffName] = useState<string>('');
  const [stats, setStats] = useState<StaffStats>({
    myBookingsToday: 0,
    myBookingsWeek: 0,
    upcomingAppointments: 0,
  });
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    async function checkStaffAccess(): Promise<void> {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          router.push('/login');
          return;
        }

        setUser(user);

        // Check if user is staff
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('role, full_name')
          .eq('id', user.id)
          .single();

        if (profileError || profile?.role !== 'staff') {
          // Not staff - redirect to home
          router.push('/');
          return;
        }

        setIsStaff(true);

        // Get staff record (match by email or name)
        const { data: staffRecord, error: staffError } = await supabase
          .from('staff')
          .select('id, name')
          .eq('email', user.email)
          .single();

        if (staffError) {
          console.error('Error fetching staff record:', staffError);
          // Staff user but no staff record yet
          setStaffName(profile.full_name || user.email?.split('@')[0] || 'Staff Member');
        } else if (staffRecord) {
          setStaffId(staffRecord.id);
          setStaffName(staffRecord.name);
          await loadStaffStats(staffRecord.id);
          await loadTodayAppointments(staffRecord.id);
        }

      } catch (error) {
        console.error('Error checking staff access:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    }

    checkStaffAccess();
  }, [router]);

  const loadStaffStats = async (staffRecordId: string): Promise<void> => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week
      const weekStartStr = weekStart.toISOString().split('T')[0];

      // Get today's bookings for this staff member
      const { count: todayCount, error: todayError } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('staff_id', staffRecordId)
        .eq('appointment_date', today);

      if (todayError) {
        console.error('Error counting today bookings:', todayError);
      }

      // Get this week's bookings
      const { count: weekCount, error: weekError } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('staff_id', staffRecordId)
        .gte('appointment_date', weekStartStr);

      if (weekError) {
        console.error('Error counting week bookings:', weekError);
      }

      // Get upcoming appointments (future dates)
      const { count: upcomingCount, error: upcomingError } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('staff_id', staffRecordId)
        .gt('appointment_date', today)
        .in('status', ['pending', 'confirmed']);

      if (upcomingError) {
        console.error('Error counting upcoming:', upcomingError);
      }

      setStats({
        myBookingsToday: todayCount || 0,
        myBookingsWeek: weekCount || 0,
        upcomingAppointments: upcomingCount || 0,
      });

    } catch (error) {
      console.error('Error loading staff stats:', error);
    }
  };

  const loadTodayAppointments = async (staffRecordId: string): Promise<void> => {
    try {
      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          appointment_date,
          appointment_time,
          status,
          services (name),
          users (full_name, email)
        `)
        .eq('staff_id', staffRecordId)
        .eq('appointment_date', today)
        .order('appointment_time', { ascending: true });

      if (error) {
        console.error('Error loading appointments:', error);
      } else if (data) {
        setTodayAppointments(data as Appointment[]);
      }

    } catch (error) {
      console.error('Error loading today appointments:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gold-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gold-600 border-r-transparent mb-4"></div>
          <p className="text-xl text-dark-secondary">Loading your schedule...</p>
        </div>
      </div>
    );
  }

  if (!isStaff) {
    return null;
  }

return (
  <div className="flex min-h-screen bg-gold-50">
    <DashboardSidebar 
      userRole="staff"
      unreadNotifications={0}
      unreadMessages={0}
    />
    
    <main className="flex-1 py-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-serif font-bold text-dark mb-4">
            Welcome, {staffName}
          </h1>
          <p className="text-xl text-dark-secondary">
            Your schedule and appointments
          </p>
        </div>

        {/* Stats Grid - Only Their Own Bookings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center p-6">
            <p className="text-dark-secondary mb-2">Today's Appointments</p>
            <h3 className="text-4xl font-serif font-bold text-dark">
              {stats.myBookingsToday}
            </h3>
          </Card>

          <Card className="text-center p-6">
            <p className="text-dark-secondary mb-2">This Week</p>
            <h3 className="text-4xl font-serif font-bold text-dark">
              {stats.myBookingsWeek}
            </h3>
          </Card>

          <Card className="text-center p-6">
            <p className="text-dark-secondary mb-2">Upcoming</p>
            <h3 className="text-4xl font-serif font-bold text-gold-600">
              {stats.upcomingAppointments}
            </h3>
          </Card>
        </div>

        {/* Today's Appointments */}
        <Card className="p-6">
          <h3 className="text-2xl font-serif font-bold text-dark mb-6">
            Today's Schedule
          </h3>
          
          {todayAppointments.length === 0 ? (
            <p className="text-dark-secondary text-center py-8">
              No appointments scheduled for today
            </p>
          ) : (
            <div className="space-y-4">
              {todayAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="p-4 border-2 border-gold-100 rounded-lg hover:border-gold-300 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-serif font-bold text-dark text-lg">
                        {apt.services[0]?.name || 'Service'}
                      </p>
                      <p className="text-dark-secondary">
                        Client: {apt.users[0]?.full_name || apt.users[0]?.email || 'Unknown'}
                      </p>
                      <p className="text-sm text-dark-secondary mt-2">
                        {apt.appointment_time}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      apt.status === 'completed' ? 'bg-green-100 text-green-700' :
                      apt.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                      apt.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {apt.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            onClick={() => router.push('/staff/calendar')}
            className="p-4 border-2 border-gold-300 rounded-lg hover:bg-gold-50 transition-colors text-left"
          >
            <h4 className="font-serif font-bold text-dark mb-2">My Calendar</h4>
            <p className="text-sm text-dark-secondary">View full schedule</p>
          </button>
          <button 
            onClick={() => router.push('/staff/notes')}
            className="p-4 border-2 border-gold-300 rounded-lg hover:bg-gold-50 transition-colors text-left"
          >
            <h4 className="font-serif font-bold text-dark mb-2">My Notes</h4>
            <p className="text-sm text-dark-secondary">Personal reminders</p>
          </button>
        </div>
      </div>
    </main>
  </div>
);
}