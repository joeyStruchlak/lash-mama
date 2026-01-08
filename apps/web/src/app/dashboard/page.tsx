'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Calendar, Clock, CheckCircle, Star, TrendingUp, Gift, Sparkles } from 'lucide-react';

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  total_price: number;
  service: {
    name: string;
  };
  staff: {
    name: string;
  };
}

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  vip_streak: number;
  avatar_url: string | null;
}

export default function ClientDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [upcomingBookings, setUpcomingBookings] = useState<Appointment[]>([]);
  const [pastBookings, setPastBookings] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [vipProgress, setVipProgress] = useState(0);
  const [showFastTrack, setShowFastTrack] = useState(false);

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  async function checkAuthAndFetchData() {
    try {
      setLoading(true);

      // Get current user
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        router.push('/login');
        return;
      }

      // Get user profile
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (!profile) return;

      setUser(profile);

      // If already VIP, redirect to VIP dashboard
      if (profile.role === 'vip') {
        router.push('/vip');
        return;
      }

      // Fetch appointments
      const { data: appointments } = await supabase
        .from('appointments')
        .select(`
          *,
          service:service_id(name),
          staff:staff_id(name)
        `)
        .eq('user_id', authUser.id)
        .order('appointment_date', { ascending: false });

      if (appointments) {
        const now = new Date();
        const today = now.toISOString().split('T')[0];

        const upcoming = appointments.filter(
          apt => apt.appointment_date >= today && apt.status !== 'cancelled'
        );
        const past = appointments.filter(
          apt => (apt.appointment_date < today || apt.status === 'completed') && apt.status !== 'cancelled'
        );

        setUpcomingBookings(upcoming);
        setPastBookings(past);

        // Calculate VIP progress
        const completedCount = appointments.filter(
          apt => apt.status === 'completed'
        ).length;

        setVipProgress(Math.min(completedCount, 10));

        // Show fast-track offer at 5 consecutive bookings
        if (profile.vip_streak === 5 && !profile.referral_code) {
          setShowFastTrack(true);
        }
      }

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-AU', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  function formatTime(timeStr: string): string {
    return new Date(`2000-01-01T${timeStr}`).toLocaleTimeString('en-AU', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  function getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FAFAF7]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#C9A871] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-[#2A2A2A]">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const bookingsToVIP = 10 - vipProgress;

  return (
    <div className="min-h-screen bg-[#FAFAF7] py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-4xl font-bold text-[#2A2A2A] mb-2"
            style={{ fontFamily: 'Cormorant Garamond, serif' }}
          >
            Welcome back, {user?.full_name}!
          </h1>
          <p className="text-[#3D3D3D]">Your beauty journey with Lash Mama</p>
        </div>

        {/* Fast-Track VIP Offer */}
        {showFastTrack && (
          <div className="mb-6 bg-gradient-to-r from-[#C9A871] to-[#D4AF37] rounded-xl p-6 text-white animate-pulse">
            <div className="flex items-start gap-4">
              <Gift size={48} className="flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2">🎉 Unlock VIP Status Now!</h3>
                <p className="mb-4">
                  You've completed 5 bookings! Skip the wait and become VIP instantly by 
                  referring a friend who completes their first booking.
                </p>
                <button
                  onClick={() => router.push('/referral')}
                  className="px-6 py-3 bg-white text-[#C9A871] font-bold rounded-xl hover:shadow-lg transition"
                >
                  Get My Referral Link →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIP Progress */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-[#2A2A2A] flex items-center gap-2">
              <TrendingUp size={28} className="text-[#C9A871]" />
              Your VIP Progress
            </h2>
            <span className="text-sm text-[#3D3D3D]">
              {vipProgress}/10 bookings
            </span>
          </div>

          {/* Progress Bar */}
          <div className="relative mb-4">
            <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#C9A871] to-[#D4AF37] transition-all duration-500 flex items-center justify-end pr-3"
                style={{ width: `${(vipProgress / 10) * 100}%` }}
              >
                {vipProgress > 0 && (
                  <span className="text-white text-xs font-bold">
                    {vipProgress}
                  </span>
                )}
              </div>
            </div>
          </div>

          {bookingsToVIP > 0 ? (
            <p className="text-[#3D3D3D] text-center">
              <strong className="text-[#C9A871]">{bookingsToVIP} more booking{bookingsToVIP !== 1 ? 's' : ''}</strong> until you unlock VIP benefits! 
              💎
            </p>
          ) : (
            <p className="text-green-600 text-center font-medium">
              🎉 Congratulations! You're eligible for VIP status!
            </p>
          )}

          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: Star, label: 'Priority Booking', locked: vipProgress < 10 },
              { icon: Gift, label: '$10-$30 Off', locked: vipProgress < 10 },
              { icon: Sparkles, label: 'Exclusive Perks', locked: vipProgress < 10 },
              { icon: CheckCircle, label: 'VIP Support', locked: vipProgress < 10 },
            ].map((perk, i) => (
              <div
                key={i}
                className={`p-3 rounded-lg text-center ${
                  perk.locked
                    ? 'bg-gray-100 text-gray-400'
                    : 'bg-gradient-to-br from-[#C9A871] to-[#D4AF37] text-white'
                }`}
              >
                <perk.icon size={24} className="mx-auto mb-1" />
                <p className="text-xs font-medium">{perk.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Bookings */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-2xl font-bold text-[#2A2A2A] mb-4 flex items-center gap-2">
            <Calendar size={28} className="text-[#C9A871]" />
            Upcoming Appointments
          </h2>

          {upcomingBookings.length === 0 ? (
            <div className="text-center py-8">
              <Calendar size={48} className="mx-auto text-gray-400 mb-3" />
              <p className="text-[#3D3D3D] mb-4">No upcoming appointments</p>
              <button
                onClick={() => router.push('/book')}
                className="px-6 py-3 bg-gradient-to-r from-[#C9A871] to-[#D4AF37] text-white rounded-xl hover:shadow-lg transition font-medium"
              >
                Book Your Next Appointment
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingBookings.map((booking: any) => (
                <div
                  key={booking.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-[#C9A871] transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-[#2A2A2A] mb-1">
                        {booking.service?.name}
                      </h3>
                      <p className="text-sm text-[#3D3D3D] mb-2">
                        with {booking.staff?.name}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-[#3D3D3D]">
                        <span className="flex items-center gap-1">
                          <Calendar size={16} />
                          {formatDate(booking.appointment_date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={16} />
                          {formatTime(booking.appointment_time)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {booking.status.toUpperCase()}
                      </span>
                      <p className="text-lg font-bold text-[#C9A871] mt-2">
                        ${booking.total_price}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Booking History */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-2xl font-bold text-[#2A2A2A] mb-4 flex items-center gap-2">
            <CheckCircle size={28} className="text-[#C9A871]" />
            Booking History
          </h2>

          {pastBookings.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle size={48} className="mx-auto text-gray-400 mb-3" />
              <p className="text-[#3D3D3D]">No booking history yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pastBookings.slice(0, 5).map((booking: any) => (
                <div
                  key={booking.id}
                  className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-[#2A2A2A]">
                        {booking.service?.name}
                      </p>
                      <p className="text-xs text-[#3D3D3D]">
                        {formatDate(booking.appointment_date)} • {booking.staff?.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {booking.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {pastBookings.length > 5 && (
                <p className="text-center text-sm text-[#3D3D3D] pt-2">
                  + {pastBookings.length - 5} more bookings
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}