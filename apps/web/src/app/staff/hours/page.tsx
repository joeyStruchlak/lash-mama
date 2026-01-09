'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Calendar, Clock, CheckCircle, Target } from 'lucide-react';
import styles from './StaffAnalytics.module.css';

interface WeeklyData {
  day: string;
  scheduled: number;
  completed: number;
}

export default function StaffHoursPage() {
  const [staffName, setStaffName] = useState('');
  const [stats, setStats] = useState({
    scheduledHours: 0,
    completedHours: 0,
    avgHoursPerDay: 0,
    completionRate: 0
  });
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  async function fetchAnalytics() {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

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

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const progress = (stats.completionRate / 100) * circumference;

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
      </div>
    );
  }

  return (
    <div className={styles.analyticsContainer}>
      {/* Premium Stats Grid */}
      <div className={styles.statsGrid}>
        {/* Stat 1 - Scheduled Hours */}
        <div className={styles.statCardGold}>
          <div className={styles.statCardGoldGlow} />
          <Calendar size={32} className={styles.statIcon} />
          <p className={styles.statLabel}>
            Scheduled This Week
          </p>
          <p className={styles.statValue}>
            {stats.scheduledHours.toFixed(1)}<span className={styles.statUnit}>h</span>
          </p>
        </div>

        {/* Stat 2 - Completed Hours */}
        <div className={styles.statCardDark}>
          <div className={styles.statCardDarkGlow} />
          <CheckCircle size={32} className={styles.statIcon} />
          <p className={styles.statLabelDark}>
            Completed Hours
          </p>
          <p className={styles.statValue}>
            {stats.completedHours.toFixed(0)}<span className={styles.statUnit}>h</span>
          </p>
        </div>

        {/* Stat 3 - Avg Per Day */}
        <div className={styles.statCardWhite}>
          <Clock size={32} color="#B8956A" className={styles.statIcon} />
          <p className={styles.statLabelWhite}>
            Avg Hours/Day
          </p>
          <p className={`${styles.statValue} ${styles.statValueWhite}`}>
            {stats.avgHoursPerDay.toFixed(1)}<span className={styles.statUnitWhite}>h</span>
          </p>
        </div>

        {/* Stat 4 - Completion Rate */}
        <div className={styles.statCardCompletion}>
          <div className={styles.circularProgress}>
            <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
              <circle
                cx="60"
                cy="60"
                r={radius}
                stroke="#F8F5F0"
                strokeWidth="8"
                fill="none"
              />
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
            <div className={styles.circularProgressText}>
              <p className={styles.circularProgressValue}>
                {stats.completionRate.toFixed(0)}%
              </p>
            </div>
          </div>
          <div className={styles.completionDetails}>
            <Target size={28} color="#B8956A" className={styles.completionIcon} />
            <p className={styles.completionLabel}>
              Completion Rate
            </p>
            <p className={styles.completionSubtext}>
              {stats.completedHours.toFixed(0)} of {stats.scheduledHours.toFixed(0)} hours
            </p>
          </div>
        </div>
      </div>

      {/* Chart Card */}
      <div className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <div>
            <h3 className={styles.chartTitle}>
              Weekly Performance
            </h3>
            <p className={styles.chartSubtitle}>
              Hours scheduled vs completed
            </p>
          </div>

          <div className={styles.chartLegend}>
            <div className={styles.legendItem}>
              <div className={styles.legendColorScheduled} />
              <span className={styles.legendLabel}>Scheduled</span>
            </div>
            <div className={styles.legendItem}>
              <div className={styles.legendColorCompleted} />
              <span className={styles.legendLabel}>Completed</span>
            </div>
          </div>
        </div>

        {/* Bar Chart */}
        <div className={styles.barChart}>
          {weeklyData.map((data, index) => {
            const isToday = new Date().getDay() === index;
            const isWeekend = index === 0 || index === 6;
            
            return (
              <div key={index} className={styles.barColumn}>
                <div className={styles.barGroup}>
                  {/* Scheduled bar */}
                  <div 
                    className={`${styles.barScheduled} ${isWeekend ? styles.barWeekend : ''}`}
                    style={{
                      height: `${(data.scheduled / maxHours) * 280}px`,
                      minHeight: data.scheduled > 0 ? '8px' : '0'
                    }}
                  />
                  {/* Completed bar */}
                  <div 
                    className={`${styles.barCompleted} ${isWeekend ? styles.barWeekendCompleted : ''}`}
                    style={{
                      height: `${(data.completed / maxHours) * 280}px`,
                      minHeight: data.completed > 0 ? '8px' : '0'
                    }}
                  />
                </div>
                <div className={`${styles.dayLabel} ${
                  isToday ? styles.dayLabelToday : isWeekend ? styles.dayLabelWeekend : ''
                }`}>
                  <p className={`${styles.dayText} ${
                    isToday ? styles.dayTextToday : styles.dayTextNormal
                  }`}>
                    {data.day}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}