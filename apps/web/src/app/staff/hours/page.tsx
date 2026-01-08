'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Calendar, Clock, CheckCircle, TrendingUp, Briefcase, MessageSquare, StickyNote, Award, Target } from 'lucide-react';

interface WeeklyData {
  day: string;
  scheduled: number;
  completed: number;
}

export default function StaffHoursPage() {
  const router = useRouter();
  const [staffName, setStaffName] = useState('');
  const [stats, setStats] = useState({
    scheduledHours: 0,
    completedHours: 0,
    avgHoursPerDay: 0,
    completionRate: 0
  });
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadMessages] = useState(2);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  async function fetchAnalytics() {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: staffProfile } = await supabase
        .from('staff')
        .select('id, name')
        .eq('user_id', user.id)
        .single();

      if (!staffProfile) return;

      const { data: userProfile } = await supabase
        .from('users')
        .select('full_name')
        .eq('id', user.id)
        .single();

      setStaffName(userProfile?.full_name || staffProfile.name);

      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const { data: appointments } = await supabase
        .from('appointments')
        .select(`
          *,
          service:service_id(name, duration)
        `)
        .eq('staff_id', staffProfile.id)
        .gte('appointment_date', startOfWeek.toISOString().split('T')[0]);

      if (appointments) {
        calculateAnalytics(appointments);
      }

    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  }

  function parseDuration(duration: string | null | undefined): number {
    if (!duration || typeof duration !== 'string') {
      return 2;
    }
    const match = duration.match(/(\d+\.?\d*)/);
    return match ? parseFloat(match[1]) : 2;
  }

  function calculateAnalytics(appointments: any[]) {
    let scheduledHours = 0;
    let completedHours = 0;

    appointments.forEach(apt => {
      const duration = parseDuration(apt.service?.duration || '2 hours');
      scheduledHours += duration;
      if (apt.status === 'completed') {
        completedHours += duration;
      }
    });

    const avgHoursPerDay = scheduledHours / 7;
    const completionRate = scheduledHours > 0 ? (completedHours / scheduledHours) * 100 : 0;

    setStats({
      scheduledHours,
      completedHours,
      avgHoursPerDay,
      completionRate
    });

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());

    const weeklyData = days.map((day, index) => {
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

    setWeeklyData(weeklyData);
  }

  const maxHours = Math.max(...weeklyData.map(d => Math.max(d.scheduled, d.completed)), 8);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#FAF8F5' }}>
        <div style={{
          width: '56px',
          height: '56px',
          border: '5px solid #F8F5F0',
          borderTop: '5px solid #B8956A',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
      </div>
    );
  }

  // Calculate circular progress for completion rate
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const progress = (stats.completionRate / 100) * circumference;

  return (
    <div className="min-h-screen" style={{ background: '#FAF8F5', padding: '32px 24px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Compact Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '40px',
            fontWeight: '600',
            color: '#2B2B2B',
            marginBottom: '8px'
          }}>
            {staffName}'s Performance
          </h1>
          <p style={{ fontSize: '16px', color: '#6B6B6B' }}>
            Weekly analytics and insights
          </p>
        </div>

        {/* Main Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '280px 1fr',
          gap: '24px'
        }}>
          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { icon: Briefcase, label: 'Dashboard', path: '/staff', active: false },
              { icon: Calendar, label: 'Calendar', path: '/staff/calendar', active: false },
              { icon: Clock, label: 'My Hours', path: '/staff/hours', active: true },
              { icon: MessageSquare, label: 'Messages', path: '/staff/messages', active: false, badge: unreadMessages },
              { icon: StickyNote, label: 'Notes', path: '/staff/notes', active: false }
            ].map((item, i) => (
              <button
                key={i}
                onClick={() => router.push(item.path)}
                style={{
                  padding: '16px 24px',
                  background: item.active ? 'linear-gradient(135deg, #C9A872 0%, #B8956A 100%)' : 'white',
                  color: item.active ? 'white' : '#2B2B2B',
                  border: item.active ? 'none' : '1px solid #E8E3DC',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: item.active ? '600' : '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  position: 'relative',
                  transition: 'all 0.2s',
                  boxShadow: item.active ? '0 4px 12px rgba(184, 149, 106, 0.25)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (!item.active) e.currentTarget.style.background = '#F8F5F0';
                }}
                onMouseLeave={(e) => {
                  if (!item.active) e.currentTarget.style.background = 'white';
                }}
              >
                <item.icon size={20} />
                {item.label}
                {item.badge && item.badge > 0 && (
                  <span style={{
                    position: 'absolute',
                    right: '16px',
                    background: '#B8956A',
                    color: 'white',
                    borderRadius: '12px',
                    padding: '2px 8px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Main Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Premium Stats Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '20px'
            }}>
              {/* Stat 1 - Scheduled Hours */}
              <div style={{
                background: 'linear-gradient(135deg, #C9A872 0%, #B8956A 100%)',
                borderRadius: '20px',
                padding: '32px',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 8px 24px rgba(184, 149, 106, 0.3)'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-20px',
                  right: '-20px',
                  width: '120px',
                  height: '120px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '50%'
                }} />
                <Calendar size={32} style={{ marginBottom: '16px', opacity: 0.9 }} />
                <p style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>
                  Scheduled This Week
                </p>
                <p style={{
                  fontSize: '44px',
                  fontWeight: '700',
                  fontFamily: "'Playfair Display', serif",
                  position: 'relative'
                }}>
                  {stats.scheduledHours.toFixed(1)}<span style={{ fontSize: '24px' }}>h</span>
                </p>
              </div>

              {/* Stat 2 - Completed Hours */}
              <div style={{
                background: 'linear-gradient(135deg, #2B2B2B 0%, #3D3D3D 100%)',
                borderRadius: '20px',
                padding: '32px',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-20px',
                  right: '-20px',
                  width: '120px',
                  height: '120px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '50%'
                }} />
                <CheckCircle size={32} style={{ marginBottom: '16px', opacity: 0.9 }} />
                <p style={{ fontSize: '14px', opacity: 0.7, marginBottom: '8px' }}>
                  Completed Hours
                </p>
                <p style={{
                  fontSize: '44px',
                  fontWeight: '700',
                  fontFamily: "'Playfair Display', serif",
                  position: 'relative'
                }}>
                  {stats.completedHours.toFixed(0)}<span style={{ fontSize: '24px' }}>h</span>
                </p>
              </div>

              {/* Stat 3 - Avg Per Day */}
              <div style={{
                background: 'white',
                borderRadius: '20px',
                padding: '32px',
                border: '2px solid #E8E3DC',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)'
              }}>
                <Clock size={32} color="#B8956A" style={{ marginBottom: '16px' }} />
                <p style={{ fontSize: '14px', color: '#6B6B6B', marginBottom: '8px' }}>
                  Avg Hours/Day
                </p>
                <p style={{
                  fontSize: '44px',
                  fontWeight: '700',
                  color: '#2B2B2B',
                  fontFamily: "'Playfair Display', serif"
                }}>
                  {stats.avgHoursPerDay.toFixed(1)}<span style={{ fontSize: '24px', color: '#6B6B6B' }}>h</span>
                </p>
              </div>

              {/* Stat 4 - Completion Rate with Circle */}
              <div style={{
                background: 'white',
                borderRadius: '20px',
                padding: '32px',
                border: '2px solid #E8E3DC',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
                display: 'flex',
                alignItems: 'center',
                gap: '24px'
              }}>
                <div style={{ position: 'relative', width: '120px', height: '120px' }}>
                  {/* Background circle */}
                  <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
                    <circle
                      cx="60"
                      cy="60"
                      r={radius}
                      stroke="#F8F5F0"
                      strokeWidth="8"
                      fill="none"
                    />
                    {/* Progress circle */}
                    <circle
                      cx="60"
                      cy="60"
                      r={radius}
                      stroke="url(#gradient)"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={circumference}
                      strokeDashoffset={circumference - progress}
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dashoffset 1s ease' }}
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#C9A872" />
                        <stop offset="100%" stopColor="#B8956A" />
                      </linearGradient>
                    </defs>
                  </svg>
                  {/* Center text */}
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center'
                  }}>
                    <p style={{
                      fontSize: '32px',
                      fontWeight: '700',
                      color: '#2B2B2B',
                      fontFamily: "'Playfair Display', serif",
                      lineHeight: '1'
                    }}>
                      {stats.completionRate.toFixed(0)}%
                    </p>
                  </div>
                </div>
                <div>
                  <Target size={28} color="#B8956A" style={{ marginBottom: '8px' }} />
                  <p style={{ fontSize: '14px', color: '#6B6B6B', marginBottom: '4px' }}>
                    Completion Rate
                  </p>
                  <p style={{ fontSize: '13px', color: '#9B9B9B' }}>
                    {stats.completedHours.toFixed(0)} of {stats.scheduledHours.toFixed(0)} hours
                  </p>
                </div>
              </div>
            </div>

            {/* Modern Chart */}
            <div style={{
              background: 'white',
              borderRadius: '24px',
              padding: '40px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              border: '1px solid #E8E3DC'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '32px'
              }}>
                <div>
                  <h3 style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: '28px',
                    fontWeight: '600',
                    color: '#2B2B2B',
                    marginBottom: '4px'
                  }}>
                    Weekly Performance
                  </h3>
                  <p style={{ fontSize: '14px', color: '#6B6B6B' }}>
                    Hours scheduled vs completed
                  </p>
                </div>

                {/* Improved Legend */}
                <div style={{ display: 'flex', gap: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '3px',
                      background: 'linear-gradient(135deg, #C9A872 0%, #B8956A 100%)'
                    }} />
                    <span style={{ fontSize: '13px', color: '#6B6B6B', fontWeight: '600' }}>
                      Scheduled
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '3px',
                      background: '#E8DCC8'
                    }} />
                    <span style={{ fontSize: '13px', color: '#6B6B6B', fontWeight: '600' }}>
                      Completed
                    </span>
                  </div>
                </div>
              </div>

              {/* Enhanced Bar Chart */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: '20px',
                height: '320px',
                borderBottom: '2px solid #E8E3DC',
                paddingBottom: '0',
                position: 'relative'
              }}>

                {weeklyData.map((data, index) => {
                  const isToday = new Date().getDay() === index;
                  return (
                    <div key={index} style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '12px',
                      height: '100%',
                      justifyContent: 'flex-end'
                    }}>
                      {/* Hover tooltip */}
                      <div style={{
                        position: 'absolute',
                        top: '-40px',
                        opacity: 0,
                        transition: 'opacity 0.2s',
                        background: '#2B2B2B',
                        color: 'white',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '600',
                        pointerEvents: 'none',
                        whiteSpace: 'nowrap'
                      }}>
                        {data.scheduled}h scheduled, {data.completed}h done
                      </div>

                      <div style={{
                        width: '100%',
                        display: 'flex',
                        gap: '6px',
                        alignItems: 'flex-end',
                        justifyContent: 'center'
                      }}>
                        {/* Scheduled bar */}
                        <div style={{
                          width: '45%',
                          height: `${(data.scheduled / maxHours) * 280}px`,
                          background: 'linear-gradient(180deg, #C9A872 0%, #B8956A 100%)',
                          borderRadius: '10px 10px 0 0',
                          minHeight: data.scheduled > 0 ? '8px' : '0',
                          transition: 'all 0.4s ease',
                          cursor: 'pointer',
                          boxShadow: data.scheduled > 0 ? '0 -4px 8px rgba(184, 149, 106, 0.2)' : 'none'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scaleY(1.02)';
                          e.currentTarget.style.filter = 'brightness(1.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scaleY(1)';
                          e.currentTarget.style.filter = 'brightness(1)';
                        }}
                        />
                        {/* Completed bar */}
                        <div style={{
                          width: '45%',
                          height: `${(data.completed / maxHours) * 280}px`,
                          background: 'linear-gradient(180deg, #E8DCC8 0%, #D4C8B0 100%)',
                          borderRadius: '10px 10px 0 0',
                          minHeight: data.completed > 0 ? '8px' : '0',
                          transition: 'all 0.4s ease',
                          cursor: 'pointer',
                          boxShadow: data.completed > 0 ? '0 -4px 8px rgba(212, 200, 176, 0.2)' : 'none'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scaleY(1.02)';
                          e.currentTarget.style.filter = 'brightness(0.95)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scaleY(1)';
                          e.currentTarget.style.filter = 'brightness(1)';
                        }}
                        />
                      </div>
                      <div style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        background: isToday ? 'linear-gradient(135deg, #C9A872 0%, #B8956A 100%)' : 'transparent'
                      }}>
                        <p style={{
                          fontSize: '13px',
                          fontWeight: '700',
                          color: isToday ? 'white' : '#6B6B6B',
                          textAlign: 'center'
                        }}>
                          {data.day}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
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