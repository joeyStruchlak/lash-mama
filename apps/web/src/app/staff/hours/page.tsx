'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
    Calendar,
    Clock,
    Users,
    Star,
    TrendingUp,
    Edit,
    Plus,
    CheckCircle,
    XCircle,
    Gift,
    Sparkles,
    Trophy,
    Target
} from 'lucide-react';
import styles from './StaffAnalytics.module.css';
import type {
    StaffProfile,
    TimeOffRequest,
    Milestone,
    WeeklySchedule,
    WeeklyData,
    GrowthData,
    ThisWeekStats
} from '@/types/analytics';

export default function StaffHoursPage() {
    const [profile, setProfile] = useState<StaffProfile | null>(null);
    const [timeOffRequests, setTimeOffRequests] = useState<TimeOffRequest[]>([]);
    const [milestones, setMilestones] = useState<Milestone[]>([]);
    const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule>({
        Monday: { start: '9:00 AM', end: '6:00 PM' },
        Tuesday: { start: '9:00 AM', end: '6:00 PM' },
        Wednesday: { start: '10:00 AM', end: '4:00 PM' },
        Thursday: { start: '9:00 AM', end: '6:00 PM' },
        Friday: { start: '9:00 AM', end: '6:00 PM' }
    });
    const [thisWeekStats, setThisWeekStats] = useState<ThisWeekStats>({
        clientsServed: 0,
        hoursWorked: 0,
        avgClientsPerDay: 0
    });
    const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
    const [growthData, setGrowthData] = useState<GrowthData[]>([]);
    const [weeklyGrowth, setWeeklyGrowth] = useState(0);
    const [growthView, setGrowthView] = useState<'week' | 'month' | 'year'>('week');
    const [loading, setLoading] = useState(true);
    const [showTimeOffModal, setShowTimeOffModal] = useState(false);
    const [showAllRequestsModal, setShowAllRequestsModal] = useState(false);
    const [deleteConfirmModal, setDeleteConfirmModal] = useState<string | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [timeOffForm, setTimeOffForm] = useState({
        startDate: '',
        endDate: '',
        reason: ''
    });

    useEffect(() => {
        fetchAllData();
    }, []);

    async function fetchAllData() {
        try {
            setLoading(true);

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch staff profile
            const { data: staffData } = await supabase
                .from('staff')
                .select('*, created_at')
                .eq('user_id', user.id)
                .single();

            if (staffData) {
                const { data: userData } = await supabase
                    .from('users')
                    .select('avatar_url')
                    .eq('id', user.id)
                    .single();

                setProfile({
                    ...staffData,
                    avatar_url: userData?.avatar_url
                });

                // Fetch weekly schedule from database
                if (staffData.weekly_schedule) {
                    setWeeklySchedule(staffData.weekly_schedule);
                }


                // Fetch time off requests
                const { data: timeOffData } = await supabase
                    .from('time_off_requests')
                    .select('*')
                    .eq('staff_id', staffData.id)
                    .order('start_date', { ascending: false });

                if (timeOffData) setTimeOffRequests(timeOffData);

                // Fetch milestones
                const { data: milestonesData } = await supabase
                    .from('staff_milestones')
                    .select('*')
                    .eq('staff_id', staffData.id)
                    .order('date_achieved', { ascending: false });

                if (milestonesData) setMilestones(milestonesData);

                // Fetch this week's appointments for stats
                await fetchWeeklyStats(staffData.id);


            }

        } catch (err) {
            console.error('Error fetching analytics:', err);
        } finally {
            setLoading(false);
        }
    }

    async function fetchWeeklyStats(staffId: string) {
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        const { data: appointments } = await supabase
            .from('appointments')
            .select(`
        *,
        service:service_id(duration)
      `)
            .eq('staff_id', staffId)
            .gte('appointment_date', startOfWeek.toISOString().split('T')[0])
            .lte('appointment_date', endOfWeek.toISOString().split('T')[0]);

        if (appointments) {
            let totalClients = 0;
            let totalHours = 0;

            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const weeklyData = days.map((day, index) => {
                const date = new Date(startOfWeek);
                date.setDate(startOfWeek.getDate() + index);
                const dateStr = date.toISOString().split('T')[0];

                const dayApts = appointments.filter(apt => apt.appointment_date === dateStr);
                const clients = dayApts.length;
                const hours = dayApts.reduce((sum, apt) => {
                    const duration = parseDuration(apt.service?.duration);
                    return sum + duration;
                }, 0);

                totalClients += clients;
                totalHours += hours;

                return { day, clients, hours };
            });

            setThisWeekStats({
                clientsServed: totalClients,
                hoursWorked: totalHours,
                avgClientsPerDay: totalClients / 7
            });

            setWeeklyData(weeklyData);

            // Generate real growth data
            generateGrowthData(growthView, staffId);

            // Calculate growth percentage
            const growth = await calculateGrowthPercentage(staffId);
            setWeeklyGrowth(growth);
        }
    }

    function parseDuration(duration: string | null | undefined): number {
        if (!duration || typeof duration !== 'string') return 2;
        const match = duration.match(/(\d+\.?\d*)/);
        return match ? parseFloat(match[1]) : 2;
    }

    function calculateWeeklyHours(): number {
        return Object.values(weeklySchedule).reduce((total, day) => {
            const start = parseTime(day.start);
            const end = parseTime(day.end);
            return total + (end - start);
        }, 0);
    }

    function parseTime(timeStr: string): number {
        const [time, period] = timeStr.split(' ');
        const [hours, minutes] = time.split(':').map(Number);
        let hour = hours;
        if (period === 'PM' && hour !== 12) hour += 12;
        if (period === 'AM' && hour === 12) hour = 0;
        return hour + minutes / 60;
    }

    async function generateGrowthData(view: 'week' | 'month' | 'year', staffId: string) {
        try {
            const now = new Date();
            let startDate: Date;
            let labels: string[] = [];

            if (view === 'week') {
                // Last 7 days
                startDate = new Date(now);
                startDate.setDate(now.getDate() - 6);
                labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            } else if (view === 'month') {
                // Last 4 weeks
                startDate = new Date(now);
                startDate.setDate(now.getDate() - 27);
                labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
            } else {
                // Last 6 months
                startDate = new Date(now);
                startDate.setMonth(now.getMonth() - 5);
                labels = [];
                for (let i = 5; i >= 0; i--) {
                    const d = new Date(now);
                    d.setMonth(now.getMonth() - i);
                    labels.push(d.toLocaleDateString('en-US', { month: 'short' }));
                }
            }

            const { data: appointments } = await supabase
                .from('appointments')
                .select('appointment_date')
                .eq('staff_id', staffId)
                .gte('appointment_date', startDate.toISOString().split('T')[0])
                .lte('appointment_date', now.toISOString().split('T')[0]);

            if (!appointments || appointments.length === 0) {
                setGrowthData(labels.map(label => ({ label, value: 0 })));
                return;
            }

            // Group appointments by period
            const grouped = new Map<string, number>();

            if (view === 'week') {
                // Group by day of week
                const dayMap = new Map<number, string>([
                    [0, 'Sun'], [1, 'Mon'], [2, 'Tue'], [3, 'Wed'],
                    [4, 'Thu'], [5, 'Fri'], [6, 'Sat']
                ]);

                appointments.forEach(apt => {
                    const date = new Date(apt.appointment_date);
                    const dayName = dayMap.get(date.getDay()) || '';
                    grouped.set(dayName, (grouped.get(dayName) || 0) + 1);
                });

            } else if (view === 'month') {
                // Group by week (0-3)
                appointments.forEach(apt => {
                    const date = new Date(apt.appointment_date);
                    const daysSinceStart = Math.floor((date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
                    const weekNum = Math.floor(daysSinceStart / 7);
                    const label = `Week ${weekNum + 1}`;
                    if (weekNum >= 0 && weekNum < 4) {
                        grouped.set(label, (grouped.get(label) || 0) + 1);
                    }
                });

            } else {
                // Group by month
                appointments.forEach(apt => {
                    const date = new Date(apt.appointment_date);
                    const monthLabel = date.toLocaleDateString('en-US', { month: 'short' });
                    grouped.set(monthLabel, (grouped.get(monthLabel) || 0) + 1);
                });
            }

            // Build final data array with all labels (including zeros)
            const data: GrowthData[] = labels.map(label => ({
                label,
                value: grouped.get(label) || 0
            }));

            setGrowthData(data);
        } catch (err) {
            console.error('Error generating growth data:', err);
            setGrowthData([]);
        }
    }

    function openDeleteConfirmation(requestId: string) {
        setDeleteConfirmModal(requestId);
    }

    async function confirmDelete() {
        try {
            if (!deleteConfirmModal) return;

            const { error } = await supabase
                .from('time_off_requests')
                .delete()
                .eq('id', deleteConfirmModal);

            if (error) throw error;

            setDeleteConfirmModal(null);
            fetchAllData(); // Refresh data
        } catch (err) {
            console.error('Error deleting request:', err);
            alert('Failed to delete request');
        }
    }



    function formatDate(dateStr: string): string {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    function formatDateRange(start: string, end: string): string {
        if (start === end) return formatDate(start);
        return `${formatDate(start)} - ${formatDate(end)}`;
    }

    function getInitials(name: string): string {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }

    function getMilestoneIcon(icon: string) {
        switch (icon) {
            case 'users': return <Users size={20} />;
            case 'star': return <Star size={20} fill="currentColor" />;
            case 'trophy': return <Trophy size={20} />;
            case 'target': return <Target size={20} />;
            case 'gift': return <Gift size={20} />;
            case 'sparkles': return <Sparkles size={20} />;
            default: return <Trophy size={20} />;
        }
    }

    function calculateMonthsEmployed(startDate: string): string {
        if (!startDate) return '0m';

        const start = new Date(startDate);
        const now = new Date();

        const months = (now.getFullYear() - start.getFullYear()) * 12 +
            (now.getMonth() - start.getMonth());

        if (months < 12) return `${months}m`;

        const years = Math.floor(months / 12);
        const remainingMonths = months % 12;

        if (remainingMonths === 0) return `${years}y`;
        return `${years}y ${remainingMonths}m`;
    }

    async function handleTimeOffRequest() {
        try {
            if (!profile) return;

            if (!timeOffForm.startDate || !timeOffForm.endDate || !timeOffForm.reason.trim()) {
                alert('Please fill in all fields');
                return;
            }

            const { error } = await supabase
                .from('time_off_requests')
                .insert({
                    staff_id: profile.id,
                    start_date: timeOffForm.startDate,
                    end_date: timeOffForm.endDate,
                    reason: timeOffForm.reason,
                    status: 'pending'
                });

            if (error) throw error;

            // Close request modal and show success
            setShowTimeOffModal(false);
            setTimeOffForm({ startDate: '', endDate: '', reason: '' });
            setShowSuccessModal(true);

            // Auto-close success modal after 3 seconds
            setTimeout(() => {
                setShowSuccessModal(false);
            }, 10000);

            fetchAllData();
        } catch (err) {
            console.error('Error submitting time off request:', err);
            alert('Failed to submit request');
        }
    }

    async function calculateGrowthPercentage(staffId: string): Promise<number> {
        try {
            const now = new Date();
            const thisWeekStart = new Date(now);
            thisWeekStart.setDate(now.getDate() - now.getDay());

            const lastWeekStart = new Date(thisWeekStart);
            lastWeekStart.setDate(thisWeekStart.getDate() - 7);

            const { data: thisWeek } = await supabase
                .from('appointments')
                .select('id')
                .eq('staff_id', staffId)
                .gte('appointment_date', thisWeekStart.toISOString().split('T')[0])
                .lte('appointment_date', now.toISOString().split('T')[0]);

            const { data: lastWeek } = await supabase
                .from('appointments')
                .select('id')
                .eq('staff_id', staffId)
                .gte('appointment_date', lastWeekStart.toISOString().split('T')[0])
                .lt('appointment_date', thisWeekStart.toISOString().split('T')[0]);

            const thisCount = thisWeek?.length || 0;
            const lastCount = lastWeek?.length || 0;

            if (lastCount === 0) return 0;

            return ((thisCount - lastCount) / lastCount) * 100;
        } catch (err) {
            console.error('Error calculating growth:', err);
            return 0;
        }
    }

    const maxClients = Math.max(...weeklyData.map(d => d.clients), 8);
    const maxGrowth = Math.max(...growthData.map(d => d.value), 100);

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner} />
            </div>
        );
    }

    if (!profile) return null;

    return (
        <div className={styles.container}>
            {/* Profile Header */}
            <div className={styles.profileCard}>
                <div className={styles.profileLeft}>
                    {profile.avatar_url ? (
                        <img src={profile.avatar_url} alt={profile.name} className={styles.avatar} />
                    ) : (
                        <div className={styles.avatarPlaceholder}>
                            {getInitials(profile.name)}
                        </div>
                    )}
                    <div className={styles.profileInfo}>
                        <div className={styles.profileHeader}>
                            <h1 className={styles.profileName}>{profile.name}</h1>
                            <span className={styles.profileBadge}>senior</span>
                        </div>
                        <p className={styles.profileTitle}>{profile.title}</p>
                        <div className={styles.profileMeta}>
                            <div className={styles.metaItem}>
                                <Calendar size={14} />
                                <span>{profile.total_clients || 156}</span>
                            </div>
                            <div className={styles.metaItem}>
                                <Star size={14} fill="currentColor" />
                                <span>{profile.rating}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.profileStats}>
                    <div className={styles.statItem}>
                        <div className={styles.statIcon}>
                            <TrendingUp size={20} />
                        </div>
                        <div>
                            <p className={styles.statValue}>{calculateMonthsEmployed(profile.created_at || profile.birthday)}</p>
                            <p className={styles.statLabel}>At Lash Mama</p>
                        </div>
                    </div>
                    <div className={styles.statItem}>
                        <div className={styles.statIcon}>
                            <Users size={20} />
                        </div>
                        <div>
                            <p className={styles.statValue}>{profile.total_clients?.toLocaleString()}</p>
                            <p className={styles.statLabel}>Total Clients</p>
                        </div>
                    </div>
                    <div className={styles.statItem}>
                        <div className={styles.statIcon}>
                            <Gift size={20} />
                        </div>
                        <div>
                            <p className={styles.statValue}>{formatDate(profile.birthday)}</p>
                            <p className={styles.statLabel}>Birthday</p>
                        </div>
                    </div>
                </div>
            </div>
            {/* END PROFILE CARD */}

            {/* Specialties */}
            {profile.specialties && profile.specialties.length > 0 && (
                <div className={styles.specialties}>
                    {profile.specialties.map((specialty, index) => (
                        <span key={index} className={styles.specialtyBadge}>
                            {specialty}
                        </span>
                    ))}
                </div>
            )}

            {/* Main Grid */}
            <div className={styles.mainGrid}>
                {/* Weekly Schedule */}
                <div className={styles.scheduleCard}>
                    <div className={styles.cardHeader}>
                        <div className={styles.cardHeaderLeft}>
                            <Clock size={20} className={styles.cardIcon} />
                            <h3 className={styles.cardTitle}>Weekly Schedule</h3>
                        </div>
                    </div>
                    <div className={styles.scheduleGrid}>
                        {Object.entries(weeklySchedule).map(([day, hours]) => (
                            <div key={day} className={styles.scheduleDay}>
                                <p className={styles.scheduleDayName}>{day}</p>
                                <p className={styles.scheduleHours}>{hours.start} - {hours.end}</p>
                            </div>
                        ))}
                    </div>
                    <div className={styles.scheduleFooter}>
                        <p className={styles.scheduleFooterText}>Weekly Hours</p>
                        <p className={styles.scheduleFooterValue}>{calculateWeeklyHours()}h scheduled</p>
                    </div>
                </div>

                {/* Time Off Requests */}
                <div className={styles.timeOffCard}>
                    <div className={styles.timeOffHeader}>
                        <div>
                            <h2 className={styles.sectionTitle}>Time Off Requests</h2>
                            <p className={styles.sectionSubtitle}>
                                Submit time off requests for Lash Mama approval
                            </p>
                        </div>
                        <button
                            className={styles.requestButton}
                            onClick={() => setShowTimeOffModal(true)}
                        >
                            <Calendar size={18} />
                            Request Time Off
                        </button>
                    </div>
                    <div className={styles.timeOffList}>
                        {timeOffRequests.length === 0 ? (
                            <p className={styles.emptyState}>No time off requests yet</p>
                        ) : (
                            timeOffRequests.map((request) => (
                                <div key={request.id} className={styles.timeOffItem}>
                                    <div className={styles.timeOffIcon}>
                                        {request.status === 'approved' ? (
                                            <CheckCircle size={20} color="#10B981" />
                                        ) : request.status === 'rejected' ? (
                                            <XCircle size={20} color="#EF4444" />
                                        ) : (
                                            <Clock size={20} color="#F59E0B" />
                                        )}
                                    </div>
                                    <div className={styles.timeOffInfo}>
                                        <p className={styles.timeOffDate}>
                                            {formatDateRange(request.start_date, request.end_date)}
                                        </p>
                                        <p className={styles.timeOffReason}>{request.reason}</p>
                                    </div>
                                    <span className={`${styles.timeOffStatus} ${styles[`status${request.status.charAt(0).toUpperCase() + request.status.slice(1)}`]}`}>
                                        {request.status}
                                    </span>
                                    <button
                                        className={styles.deleteButton}
                                        onClick={() => openDeleteConfirmation(request.id)}
                                        title="Delete request"
                                    >
                                        <XCircle size={16} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                    <button
                        className={styles.viewAllButton}
                        onClick={() => setShowAllRequestsModal(true)}
                    >
                        View All Requests →
                    </button>
                </div>
            </div>

            {/* Stats & Charts Row */}
            <div className={styles.statsRow}>
                {/* This Week Stats */}
                <div className={styles.thisWeekCard}>
                    <h3 className={styles.sectionTitle}>This Week</h3>
                    <div className={styles.thisWeekStats}>
                        <div className={styles.thisWeekStat}>
                            <div className={styles.thisWeekIcon}>
                                <Users size={24} />
                            </div>
                            <div>
                                <p className={styles.thisWeekValue}>{thisWeekStats.clientsServed}</p>
                                <p className={styles.thisWeekLabel}>Clients Served</p>
                            </div>
                            <div className={styles.thisWeekChange}>
                                {weeklyGrowth >= 0 ? '+' : ''}{weeklyGrowth.toFixed(1)}% vs last week
                            </div>
                        </div>
                        <div className={styles.thisWeekStat}>
                            <div className={styles.thisWeekIcon}>
                                <Clock size={24} />
                            </div>
                            <div>
                                <p className={styles.thisWeekValue}>{thisWeekStats.hoursWorked.toFixed(0)}h</p>
                                <p className={styles.thisWeekLabel}>Hours Worked</p>
                            </div>
                        </div>
                        <div className={styles.thisWeekStat}>
                            <div className={styles.thisWeekIcon}>
                                <Target size={24} />
                            </div>
                            <div>
                                <p className={styles.thisWeekValue}>{thisWeekStats.avgClientsPerDay.toFixed(1)}</p>
                                <p className={styles.thisWeekLabel}>Avg Clients/Day</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Weekly Performance Chart */}
                <div className={styles.performanceCard}>
                    <div className={styles.cardHeader}>
                        <h3 className={styles.sectionTitle}>Weekly Performance</h3>
                        <div className={styles.chartLegend}>
                            <div className={styles.legendItem}>
                                <div className={styles.legendDot} style={{ background: '#D4AF37' }} />
                                <span>Clients</span>
                            </div>
                            <div className={styles.legendItem}>
                                <div className={styles.legendDot} style={{ background: '#E5E5E5' }} />
                                <span>Hours</span>
                            </div>
                        </div>
                    </div>
                    <div className={styles.barChart}>
                        {weeklyData.map((data, index) => {
                            const isToday = new Date().getDay() === index;
                            return (
                                <div key={index} className={styles.barColumn}>
                                    <div className={styles.barGroup}>
                                        <div
                                            className={styles.barClients}
                                            style={{ height: `${(data.clients / maxClients) * 200}px` }}
                                            title={`${data.clients} clients`}
                                        />
                                        <div
                                            className={styles.barHours}
                                            style={{ height: `${(data.hours / (maxClients * 2)) * 200}px` }}
                                            title={`${data.hours.toFixed(1)}h`}
                                        />
                                    </div>
                                    <p className={`${styles.barLabel} ${isToday ? styles.barLabelToday : ''}`}>
                                        {data.day}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Growth & Milestones Row */}
            <div className={styles.bottomRow}>
                {/* Client Growth Trend */}
                <div className={styles.growthCard}>
                    <div className={styles.cardHeader}>
                        <h3 className={styles.sectionTitle}>Client Growth Trend</h3>
                        <div className={styles.viewToggle}>
                            <button
                                className={`${styles.viewButton} ${growthView === 'week' ? styles.viewButtonActive : ''}`}
                                onClick={() => {
                                    setGrowthView('week');
                                    if (profile) generateGrowthData('week', profile.id);
                                }}
                            >
                                Week
                            </button>
                            <button
                                className={`${styles.viewButton} ${growthView === 'month' ? styles.viewButtonActive : ''}`}
                                onClick={() => {
                                    setGrowthView('month');
                                    if (profile) generateGrowthData('month', profile.id);
                                }}
                            >
                                Month
                            </button>
                            <button
                                className={`${styles.viewButton} ${growthView === 'year' ? styles.viewButtonActive : ''}`}
                                onClick={() => {
                                    setGrowthView('year');
                                    if (profile) generateGrowthData('year', profile.id);
                                }}
                            >
                                Year
                            </button>
                        </div>
                    </div>
                    <div className={styles.lineChart}>
                        <svg viewBox="0 0 600 200" className={styles.lineChartSvg}>
                            {[0, 25, 50, 75, 100].map((val) => (
                                <line
                                    key={val}
                                    x1="0"
                                    y1={200 - (val * 2)}
                                    x2="600"
                                    y2={200 - (val * 2)}
                                    stroke="#F0F0F0"
                                    strokeWidth="1"
                                />
                            ))}
                            <path
                                d={growthData.map((d, i) => {
                                    const x = (i / (growthData.length - 1)) * 600;
                                    const y = 200 - ((d.value / maxGrowth) * 180);
                                    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                                }).join(' ')}
                                fill="none"
                                stroke="url(#lineGradient)"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d={`
                  ${growthData.map((d, i) => {
                                    const x = (i / (growthData.length - 1)) * 600;
                                    const y = 200 - ((d.value / maxGrowth) * 180);
                                    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                                }).join(' ')}
                  L 600 200 L 0 200 Z
                `}
                                fill="url(#areaGradient)"
                            />
                            {growthData.map((d, i) => {
                                const x = (i / (growthData.length - 1)) * 600;
                                const y = 200 - ((d.value / maxGrowth) * 180);
                                return (
                                    <circle
                                        key={i}
                                        cx={x}
                                        cy={y}
                                        r="5"
                                        fill="#D4AF37"
                                        stroke="white"
                                        strokeWidth="2"
                                    />
                                );
                            })}
                            <defs>
                                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#D4AF37" />
                                    <stop offset="100%" stopColor="#B8941F" />
                                </linearGradient>
                                <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="rgba(212, 175, 55, 0.2)" />
                                    <stop offset="100%" stopColor="rgba(212, 175, 55, 0)" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div className={styles.lineChartLabels}>
                            {growthData.map((d, i) => (
                                <span key={i} className={styles.lineChartLabel}>{d.label}</span>
                            ))}
                        </div>
                    </div>
                    <p className={styles.growthSubtext}>Last 6 months performance vs target</p>
                </div>

                {/* Milestones */}
                <div className={styles.milestonesCard}>
                    <div className={styles.cardHeader}>
                        <div className={styles.cardHeaderLeft}>
                            <Trophy size={20} className={styles.cardIcon} />
                            <h3 className={styles.sectionTitle}>Milestones</h3>
                        </div>
                    </div>
                    <div className={styles.milestonesList}>
                        {milestones.map((milestone) => (
                            <div key={milestone.id} className={styles.milestoneItem}>
                                <div className={styles.milestoneIcon}>
                                    {getMilestoneIcon(milestone.icon)}
                                </div>
                                <div className={styles.milestoneInfo}>
                                    <p className={styles.milestoneTitle}>{milestone.title}</p>
                                    <p className={styles.milestoneDate}>
                                        {new Date(milestone.date_achieved).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                    </p>
                                </div>
                                <button className={styles.milestoneButton}>
                                    <CheckCircle size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className={styles.nextMilestone}>
                        <p className={styles.nextMilestoneLabel}>Next milestone</p>
                        <div className={styles.nextMilestoneProgress}>
                            <div className={styles.progressBar}>
                                <div className={styles.progressFill} style={{ width: '51%' }} />
                            </div>
                            <p className={styles.nextMilestoneText}>153 clients away</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* View All Requests Modal */}
            {showAllRequestsModal && (
                <div className={styles.modalOverlay} onClick={() => setShowAllRequestsModal(false)}>
                    <div className={styles.modalContentLarge} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>All Time Off Requests</h3>
                            <button
                                className={styles.modalClose}
                                onClick={() => setShowAllRequestsModal(false)}
                            >
                                ×
                            </button>
                        </div>

                        <div className={styles.modalBody}>
                            {timeOffRequests.length === 0 ? (
                                <div className={styles.emptyStateModal}>
                                    <Calendar size={48} color="hsl(0 0% 67%)" />
                                    <p>No time off requests yet</p>
                                </div>
                            ) : (
                                <div className={styles.allRequestsList}>
                                    {timeOffRequests.map((request) => (
                                        <div key={request.id} className={styles.requestCard}>
                                            <div className={styles.requestCardHeader}>
                                                <div className={styles.requestCardLeft}>
                                                    <div className={styles.requestCardIcon}>
                                                        {request.status === 'approved' ? (
                                                            <CheckCircle size={24} color="#10B981" />
                                                        ) : request.status === 'rejected' ? (
                                                            <XCircle size={24} color="#EF4444" />
                                                        ) : (
                                                            <Clock size={24} color="#F59E0B" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className={styles.requestCardDate}>
                                                            {formatDateRange(request.start_date, request.end_date)}
                                                        </p>
                                                        <p className={styles.requestCardReason}>{request.reason}</p>
                                                    </div>
                                                </div>
                                                <div className={styles.requestCardRight}>
                                                    <span className={`${styles.timeOffStatus} ${styles[`status${request.status.charAt(0).toUpperCase() + request.status.slice(1)}`]}`}>
                                                        {request.status}
                                                    </span>
                                                    <button
                                                        className={styles.deleteButtonLarge}
                                                        onClick={() => {
                                                            openDeleteConfirmation(request.id);
                                                            if (timeOffRequests.length === 1) {
                                                                setShowAllRequestsModal(false);
                                                            }
                                                        }}
                                                        title="Delete request"
                                                    >
                                                        <XCircle size={18} />
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Time Off Request Modal */}
            {showTimeOffModal && (
                <div className={styles.modalOverlay} onClick={() => setShowTimeOffModal(false)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>Request Time Off</h3>
                            <button
                                className={styles.modalClose}
                                onClick={() => setShowTimeOffModal(false)}
                            >
                                ×
                            </button>
                        </div>

                        <div className={styles.modalBody}>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Start Date</label>
                                <div className={styles.dateInputWrapper}>
                                    <Calendar size={20} className={styles.dateIcon} />
                                    <input
                                        type="date"
                                        className={styles.dateInput}
                                        value={timeOffForm.startDate}
                                        onChange={(e) => setTimeOffForm({ ...timeOffForm, startDate: e.target.value })}
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>End Date</label>
                                <div className={styles.dateInputWrapper}>
                                    <Calendar size={20} className={styles.dateIcon} />
                                    <input
                                        type="date"
                                        className={styles.dateInput}
                                        value={timeOffForm.endDate}
                                        onChange={(e) => setTimeOffForm({ ...timeOffForm, endDate: e.target.value })}
                                        min={timeOffForm.startDate || new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Reason *</label>
                                <textarea
                                    className={styles.formTextarea}
                                    placeholder="Please explain the reason for your time off request..."
                                    value={timeOffForm.reason}
                                    onChange={(e) => setTimeOffForm({ ...timeOffForm, reason: e.target.value })}
                                    rows={4}
                                    required
                                />
                            </div>

                            <button
                                className={styles.submitButton}
                                onClick={handleTimeOffRequest}
                            >
                                Submit Request
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Beautiful Delete Confirmation Modal */}
            {deleteConfirmModal && (
                <div className={styles.modalOverlay} onClick={() => setDeleteConfirmModal(null)}>
                    <div className={styles.deleteModalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.deleteModalIcon}>
                            <div className={styles.deleteIconCircle}>
                                <XCircle size={48} strokeWidth={2} />
                            </div>
                        </div>

                        <h3 className={styles.deleteModalTitle}>Delete Time Off Request?</h3>
                        <p className={styles.deleteModalText}>
                            Are you sure you want to delete this time off request? This action cannot be undone.
                        </p>

                        <div className={styles.deleteModalActions}>
                            <button
                                className={styles.cancelDeleteButton}
                                onClick={() => setDeleteConfirmModal(null)}
                            >
                                Cancel
                            </button>
                            <button
                                className={styles.confirmDeleteButton}
                                onClick={confirmDelete}
                            >

                                Delete Request
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Beautiful Success Modal */}
            {showSuccessModal && (
                <div className={styles.modalOverlay} onClick={() => setShowSuccessModal(false)}>
                    <div className={styles.successModalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.successModalIcon}>
                            <div className={styles.successIconCircle}>
                                <CheckCircle size={56} strokeWidth={2.5} />
                            </div>
                            <div className={styles.successConfetti}>
                                <div className={styles.confettiPiece}></div>
                                <div className={styles.confettiPiece}></div>
                                <div className={styles.confettiPiece}></div>
                                <div className={styles.confettiPiece}></div>
                                <div className={styles.confettiPiece}></div>
                                <div className={styles.confettiPiece}></div>
                            </div>
                        </div>

                        <h3 className={styles.successModalTitle}>Request Submitted!</h3>
                        <p className={styles.successModalText}>
                            Your time off request has been sent to <strong>Lash Mama</strong> for approval. You'll be notified once it's reviewed.
                        </p>

                        <button
                            className={styles.successOkButton}
                            onClick={() => setShowSuccessModal(false)}
                        >
                            Got it!
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}