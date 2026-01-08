'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Calendar, Clock, CheckCircle, TrendingUp, Briefcase, MessageSquare, StickyNote } from 'lucide-react';

interface StaffStats {
  todayAppointments: number;
  weekAppointments: number;
  completedToday: number;
  scheduledHours: number;
  completedHours: number;
  avgHoursPerDay: number;
  completionRate: number;
  weeklyData: {
    day: string;
    scheduled: number;
    completed: number;
  }[];
}

export default function StaffDashboard() {
  const router = useRouter();
  const [staffName, setStaffName] = useState('');
  const [stats, setStats] = useState<StaffStats>({
    todayAppointments: 0,
    weekAppointments: 0,
    completedToday: 0,
    scheduledHours: 0,
    completedHours: 0,
    avgHoursPerDay: 0,
    completionRate: 0,
    weeklyData: []
  });
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    fetchStaffData();
  }, []);

  async function fetchStaffData() {
    try {
      setLoading(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // Get staff profile
      const { data: staffProfile } = await supabase
        .from('staff')
        .select('id, name')
        .eq('user_id', user.id)
        .single();

      if (!staffProfile) {
        alert('Staff profile not found');
        return;
      }

      setStaffName(staffProfile.name);

      // Get user profile for name
      const { data: userProfile } = await supabase
        .from('users')
        .select('full_name')
        .eq('id', user.id)
        .single();

      if (userProfile?.full_name) {
        setStaffName(userProfile.full_name);
      }

      // Fetch all appointments for this staff member
      const { data: appointments } = await supabase
        .from('appointments')
        .select(`
          *,
          service:service_id(name, duration),
          user:user_id(full_name)
        `)
        .eq('staff_id', staffProfile.id)
        .order('appointment_date', { ascending: true });

      if (appointments) {
        calculateStats(appointments);
        
        // Get today's upcoming appointments
        const today = new Date().toISOString().split('T')[0];
        const todaysAppointments = appointments
          .filter(apt => apt.appointment_date === today && apt.status === 'confirmed')
          .slice(0, 5);
        
        setUpcomingAppointments(todaysAppointments);
      }

      // Mock unread messages (you can fetch real data later)
      setUnreadMessages(2);

    } catch (err) {
      console.error('Error fetching staff data:', err);
    } finally {
      setLoading(false);
    }
  }

  function calculateStats(appointments: any[]) {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // Get start of current week (Sunday)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    // Today's appointments
    const todayApts = appointments.filter(apt => apt.appointment_date === today);
    const completedToday = todayApts.filter(apt => apt.status === 'completed').length;

    // This week's appointments
    const weekApts = appointments.filter(apt => {
      const aptDate = new Date(apt.appointment_date);
      return aptDate >= startOfWeek && apt.status !== 'cancelled';
    });

    // Calculate hours
    let scheduledHours = 0;
    let completedHours = 0;

    weekApts.forEach(apt => {
      const duration = parseDuration(apt.service?.duration || '2 hours');
      scheduledHours += duration;
      if (apt.status === 'completed') {
        completedHours += duration;
      }
    });

    const avgHoursPerDay = scheduledHours / 7;
    const completionRate = scheduledHours > 0 ? (completedHours / scheduledHours) * 100 : 0;

    // Weekly data for chart
    const weeklyData = generateWeeklyData(weekApts);

    setStats({
      todayAppointments: todayApts.length,
      weekAppointments: weekApts.length,
      completedToday,
      scheduledHours,
      completedHours,
      avgHoursPerDay,
      completionRate,
      weeklyData
    });
  }

  function parseDuration(duration: string): number {
    const match = duration.match(/(\d+\.?\d*)/);
    return match ? parseFloat(match[1]) : 2;
  }

  function generateWeeklyData(appointments: any[]) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());

    return days.map((day, index) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + index);
      const dateStr = date.toISOString().split('T')[0];

      const dayApts = appointments.filter(apt => apt.appointment_date === dateStr);
      
      let scheduled = 0;
      let completed = 0;

      dayApts.forEach(apt => {
        const duration = parseDuration(apt.service?.duration || '2 hours');
        scheduled += duration;
        if (apt.status === 'completed') {
          completed += duration;
        }
      });

      return { day, scheduled, completed };
    });
  }

  function formatTime(timeStr: string): string {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  }

  function calculateDuration(duration: string): string {
    const hours = parseDuration(duration);
    if (hours >= 1) {
      return `${hours} hrs`;
    } else {
      return `${hours * 60} min`;
    }
  }

  function getTimeUntil(dateStr: string, timeStr: string): string {
    const now = new Date();
    const aptDate = new Date(`${dateStr}T${timeStr}`);
    const diffMs = aptDate.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) {
      return `in ${diffMins} min`;
    } else {
      const hours = Math.floor(diffMins / 60);
      return `${hours} hrs`;
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#FAF8F5' }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid #F8F5F0',
          borderTop: '4px solid #B8956A',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#FAF8F5', padding: '32px 24px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Hero Header */}
        <div style={{
          background: 'linear-gradient(135deg, #2B2B2B 0%, #3D3D3D 100%)',
          borderRadius: '24px',
          padding: '48px',
          marginBottom: '32px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #C9A872 0%, #B8956A 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(184, 149, 106, 0.3)'
            }}>
              <Briefcase size={36} color="white" />
            </div>
            <div>
              <p style={{ fontSize: '14px', color: '#B8B8B8', marginBottom: '4px' }}>
                Welcome back
              </p>
              <h1 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '36px',
                fontWeight: '600',
                color: 'white'
              }}>
                Staff Dashboard
              </h1>
            </div>
          </div>

          {/* Stats Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              padding: '28px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <p style={{
                fontSize: '48px',
                fontWeight: '700',
                color: 'white',
                marginBottom: '8px',
                fontFamily: "'Playfair Display', serif"
              }}>
                {stats.todayAppointments}
              </p>
              <p style={{ fontSize: '14px', color: '#B8B8B8' }}>
                Today's Appointments
              </p>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              padding: '28px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <p style={{
                fontSize: '48px',
                fontWeight: '700',
                color: 'white',
                marginBottom: '8px',
                fontFamily: "'Playfair Display', serif"
              }}>
                {stats.weekAppointments}
              </p>
              <p style={{ fontSize: '14px', color: '#B8B8B8' }}>
                This Week
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '280px 1fr',
          gap: '24px'
        }}>
          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={() => router.push('/staff')}
              style={{
                padding: '16px 24px',
                background: 'linear-gradient(135deg, #C9A872 0%, #B8956A 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: '0 4px 12px rgba(184, 149, 106, 0.25)',
                transition: 'transform 0.2s'
              }}
            >
              <Briefcase size={20} />
              Dashboard
            </button>

            <button
              onClick={() => router.push('/staff/calendar')}
              style={{
                padding: '16px 24px',
                background: 'white',
                color: '#2B2B2B',
                border: '1px solid #E8E3DC',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#F8F5F0'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
            >
              <Calendar size={20} />
              Calendar
            </button>

            <button
              onClick={() => router.push('/staff/hours')}
              style={{
                padding: '16px 24px',
                background: 'white',
                color: '#2B2B2B',
                border: '1px solid #E8E3DC',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#F8F5F0'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
            >
              <Clock size={20} />
              My Hours
            </button>

            <button
              onClick={() => router.push('/staff/messages')}
              style={{
                padding: '16px 24px',
                background: 'white',
                color: '#2B2B2B',
                border: '1px solid #E8E3DC',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                position: 'relative',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#F8F5F0'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
            >
              <MessageSquare size={20} />
              Messages
              {unreadMessages > 0 && (
                <span style={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: '#B8956A',
                  color: 'white',
                  borderRadius: '12px',
                  padding: '2px 8px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  {unreadMessages}
                </span>
              )}
            </button>

            <button
              onClick={() => router.push('/staff/notes')}
              style={{
                padding: '16px 24px',
                background: 'white',
                color: '#2B2B2B',
                border: '1px solid #E8E3DC',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#F8F5F0'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
            >
              <StickyNote size={20} />
              Notes
            </button>
          </div>

          {/* Main Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Today's Schedule */}
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '32px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
              border: '1px solid #E8E3DC'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px'
              }}>
                <div>
                  <h2 style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: '28px',
                    fontWeight: '600',
                    color: '#2B2B2B',
                    marginBottom: '4px'
                  }}>
                    Today's Schedule
                  </h2>
                  <p style={{ fontSize: '14px', color: '#6B6B6B' }}>
                    Your appointments for today
                  </p>
                </div>
                <button
                  onClick={() => router.push('/staff/calendar')}
                  style={{
                    padding: '12px 24px',
                    background: 'white',
                    color: '#2B2B2B',
                    border: '1.5px solid #E8E3DC',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#B8956A';
                    e.currentTarget.style.color = '#B8956A';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#E8E3DC';
                    e.currentTarget.style.color = '#2B2B2B';
                  }}
                >
                  <Calendar size={16} />
                  View Calendar
                </button>
              </div>

              {/* Appointments List */}
              {upcomingAppointments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <Calendar size={48} color="#D0D0D0" style={{ margin: '0 auto 16px' }} />
                  <p style={{ color: '#6B6B6B' }}>No appointments today</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {upcomingAppointments.map((apt: any, index) => (
                    <div
                      key={apt.id}
                      style={{
                        background: 'linear-gradient(135deg, #FFFCF8 0%, #FAF8F5 100%)',
                        border: '2px solid #E8E3DC',
                        borderLeft: '4px solid #B8956A',
                        borderRadius: '16px',
                        padding: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px',
                        position: 'relative'
                      }}
                    >
                      {/* Time indicator dot */}
                      <div style={{
                        position: 'absolute',
                        left: '-8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: '#B8956A',
                        border: '3px solid white'
                      }} />

                      <div style={{ flex: 1 }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          marginBottom: '8px'
                        }}>
                          <p style={{
                            fontSize: '22px',
                            fontWeight: '700',
                            color: '#B8956A',
                            fontFamily: "'Playfair Display', serif"
                          }}>
                            {formatTime(apt.appointment_time)}
                          </p>
                          <span style={{
                            fontSize: '13px',
                            color: '#6B6B6B',
                            fontWeight: '500'
                          }}>
                            • {calculateDuration(apt.service?.duration || '2 hours')}
                          </span>
                          <span style={{
                            background: '#E8DCC8',
                            color: '#8B6F47',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            {getTimeUntil(apt.appointment_date, apt.appointment_time)}
                          </span>
                        </div>

                        <p style={{
                          fontSize: '17px',
                          fontWeight: '600',
                          color: '#2B2B2B',
                          marginBottom: '4px'
                        }}>
                          {apt.user?.full_name}
                        </p>

                        <p style={{
                          fontSize: '14px',
                          color: '#6B6B6B',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <span style={{ fontSize: '16px' }}>✨</span>
                          {apt.service?.name}
                        </p>
                      </div>

                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        gap: '8px'
                      }}>
                        <span style={{
                          background: apt.status === 'confirmed' ? '#D4EDDA' : '#FFF3CD',
                          color: apt.status === 'confirmed' ? '#155724' : '#856404',
                          padding: '6px 16px',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: '600',
                          textTransform: 'capitalize'
                        }}>
                          {apt.status}
                        </span>
                        <button style={{
                          background: 'none',
                          border: 'none',
                          color: '#B8956A',
                          fontSize: '24px',
                          cursor: 'pointer',
                          padding: '4px'
                        }}>
                          👤
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}