'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ChevronLeft, ChevronRight, Filter, Plus, Calendar as CalIcon, Grid3x3, MessageCircle, Gift, FileText, Crown, Star, Users, Cake } from 'lucide-react';
import { useRouter } from 'next/navigation';
import styles from './StaffCalendar.module.css';

interface Appointment {
    id: string;
    appointment_date: string;
    appointment_time: string;
    status: string;
    total_price: number;
    notes?: string;
    user_id: string;
    user: {
        full_name: string;
        avatar_url?: string;
        is_vip?: boolean;
        vip_streak?: number;
        referral_count?: number;
        birthday?: string;
        created_at?: string;
    };
    service: {
        name: string;
        duration: string;
    };
}

type ViewMode = 'day' | 'week';

export default function StaffCalendarPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<ViewMode>('week');
    const [loading, setLoading] = useState(true);
    const [totalAppointments, setTotalAppointments] = useState(0);
    const [expectedRevenue, setExpectedRevenue] = useState(0);
    const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
    const [showModal, setShowModal] = useState(false);
    const [note, setNote] = useState('');
    const router = useRouter();

    useEffect(() => {
        fetchCalendarData();
    }, [currentDate, viewMode]);

    async function fetchCalendarData() {
        try {
            setLoading(true);

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: staffProfile } = await supabase
                .from('staff')
                .select('id')
                .eq('user_id', user.id)
                .single();

            if (!staffProfile) return;

            let startDate: Date, endDate: Date;

            if (viewMode === 'week') {
                startDate = new Date(currentDate);
                startDate.setDate(currentDate.getDate() - currentDate.getDay());
                endDate = new Date(startDate);
                endDate.setDate(startDate.getDate() + 6);
            } else {
                startDate = new Date(currentDate);
                endDate = new Date(currentDate);
            }

            const { data: appointmentsData } = await supabase
                .from('appointments')
                .select(`
          *,
          user:user_id(
            full_name,
            avatar_url,
            is_vip,
            vip_streak,
            referral_count,
            birthday,
            created_at
          ),
          service:service_id(name, duration)
        `)
                .eq('staff_id', staffProfile.id)
                .gte('appointment_date', startDate.toISOString().split('T')[0])
                .lte('appointment_date', endDate.toISOString().split('T')[0])
                .order('appointment_date', { ascending: true })
                .order('appointment_time', { ascending: true });

            const apts = (appointmentsData as any) || [];
            setAppointments(apts);

            const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

            const { data: monthAppointments } = await supabase
                .from('appointments')
                .select('id, total_price')
                .eq('staff_id', staffProfile.id)
                .gte('appointment_date', monthStart.toISOString().split('T')[0])
                .lte('appointment_date', monthEnd.toISOString().split('T')[0]);

            setTotalAppointments(monthAppointments?.length || 0);
            setExpectedRevenue(monthAppointments?.reduce((sum, apt) => sum + (apt.total_price || 0), 0) || 0);

        } catch (err) {
            console.error('Error fetching calendar:', err);
        } finally {
            setLoading(false);
        }
    }

    async function handleSaveNote(appointmentId: string) {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { data: staffProfile } = await supabase
                .from('staff')
                .select('id')
                .eq('user_id', user.id)
                .single();

            if (!staffProfile) throw new Error('Staff profile not found');

            // Upsert note (insert or update)
            const { error } = await supabase
                .from('appointment_notes')
                .upsert({
                    appointment_id: appointmentId,
                    staff_id: staffProfile.id,
                    note: note,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'appointment_id,staff_id'
                });

            if (error) throw error;

            alert('Note saved successfully!');
            setShowModal(false);
            fetchCalendarData();
        } catch (err) {
            console.error('Error saving note:', err);
            alert('Failed to save note');
        }
    }

    async function openAppointmentModal(apt: any) {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: staffProfile } = await supabase
                .from('staff')
                .select('id')
                .eq('user_id', user.id)
                .single();

            if (!staffProfile) return;

            setSelectedAppointment(apt);

            // Load this staff member's note
            const { data: noteData } = await supabase
                .from('appointment_notes')
                .select('note')
                .eq('appointment_id', apt.id)
                .eq('staff_id', staffProfile.id)
                .single();

            setNote(noteData?.note || '');
            setShowModal(true);
        } catch (err) {
            console.error('Error loading note:', err);
            setNote('');
            setShowModal(true);
        }
    }

    function formatTime(timeStr: string): string {
        const [hours, minutes] = timeStr.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    }

    function getInitials(name: string): string {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }

    function handleMessageClient(clientId: string, clientName: string) {
        router.push(`/staff/messages?clientId=${clientId}&clientName=${clientName}`);
    }

    function formatBirthday(birthday: string | null): string {
        if (!birthday) return 'Not set';
        const date = new Date(birthday);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    function navigate(direction: 'prev' | 'next') {
        const newDate = new Date(currentDate);
        if (viewMode === 'week') {
            newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        } else {
            newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        }
        setCurrentDate(newDate);
    }

    function getDaysInMonth() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days = [];
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(day);
        }
        return days;
    }

    function getWeekDays() {
        const start = new Date(currentDate);
        start.setDate(currentDate.getDate() - currentDate.getDay());
        return Array.from({ length: 7 }, (_, i) => {
            const date = new Date(start);
            date.setDate(start.getDate() + i);
            return date;
        });
    }

    function getAppointmentsForDate(date: Date) {
        const dateStr = date.toISOString().split('T')[0];
        return appointments.filter(apt => apt.appointment_date === dateStr);
    }

    function isToday(date: Date): boolean {
        const today = new Date();
        return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        );
    }

    function getHeaderText(): string {
        if (viewMode === 'week') {
            const start = new Date(currentDate);
            start.setDate(currentDate.getDate() - currentDate.getDay());
            return `Week of ${start.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}`;
        } else {
            return currentDate.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' });
        }
    }

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner} />
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Left Side: Calendar + Stats */}
            <div className={styles.leftPanel}>
                <div className={styles.calendarHeader}>
                    <div>
                        <h2 className={styles.calendarTitle}>Calendar</h2>
                        <p className={styles.calendarSubtitle}>View and manage all appointments</p>
                    </div>
                    <div className={styles.headerActions}>
                        <button className={styles.filterButton}>
                            <Filter size={16} />
                            Filter
                        </button>
                        <button className={styles.newAppointmentButton}>
                            <Plus size={16} />
                            New Appointment
                        </button>
                    </div>
                </div>

                {/* Mini Month Calendar */}
                <div className={styles.miniCalendar}>
                    <div className={styles.miniHeader}>
                        <h3 className={styles.miniMonthTitle}>
                            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </h3>
                        <div className={styles.miniNavButtons}>
                            <button onClick={() => navigate('prev')} className={styles.miniNavButton}>
                                <ChevronLeft size={16} />
                            </button>
                            <button onClick={() => navigate('next')} className={styles.miniNavButton}>
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>

                    <div className={styles.miniDayHeaders}>
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className={styles.miniDayHeader}>{day}</div>
                        ))}
                    </div>

                    <div className={styles.miniGrid}>
                        {getDaysInMonth().map((day, index) => {
                            if (day === null) return <div key={`empty-${index}`} className={styles.miniEmptyCell} />;

                            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                            const dayAppointments = getAppointmentsForDate(date);
                            const today = isToday(date);

                            return (
                                <div
                                    key={day}
                                    className={`${styles.miniDayCell} ${today ? styles.miniDayCellToday : ''}`}
                                    onClick={() => setCurrentDate(date)}
                                >
                                    {day}
                                    {dayAppointments.length > 0 && <div className={styles.miniDot} />}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Stats */}
                <div className={styles.statsRow}>
                    <div className={styles.statCard}>
                        <p className={styles.statValue}>{totalAppointments}</p>
                        <p className={styles.statLabel}>Appointments</p>
                    </div>
                    <div className={styles.statCard}>
                        <p className={styles.statValueGold}>${expectedRevenue.toFixed(0)}</p>
                        <p className={styles.statLabel}>Expected</p>
                    </div>
                </div>
            </div>

            {/* Right Side: Week/Day View */}
            <div className={styles.rightPanel}>
                <div className={styles.viewHeader}>
                    <h3 className={styles.viewTitle}>{getHeaderText()}</h3>
                    <div className={styles.viewToggle}>
                        <button
                            onClick={() => setViewMode('day')}
                            className={`${styles.viewToggleButton} ${viewMode === 'day' ? styles.viewToggleButtonActive : ''}`}
                        >
                            <CalIcon size={14} />
                            Day
                        </button>
                        <button
                            onClick={() => setViewMode('week')}
                            className={`${styles.viewToggleButton} ${viewMode === 'week' ? styles.viewToggleButtonActive : ''}`}
                        >
                            <Grid3x3 size={14} />
                            Week
                        </button>
                    </div>
                </div>

                {/* Week View */}
                {viewMode === 'week' && (
                    <div className={styles.weekView}>
                        <div className={styles.weekDayHeaders}>
                            {getWeekDays().map((date, i) => {
                                const today = isToday(date);
                                return (
                                    <div key={i} className={`${styles.weekDayHeader} ${today ? styles.weekDayHeaderToday : ''}`}>
                                        <p className={styles.weekDayName}>
                                            {date.toLocaleDateString('en-US', { weekday: 'short' })}
                                        </p>
                                        <p className={styles.weekDayNumber}>{date.getDate()}</p>
                                    </div>
                                );
                            })}
                        </div>

                        <div className={styles.weekGrid}>
                            {getWeekDays().map((date, i) => {
                                const dayAppointments = getAppointmentsForDate(date);
                                const today = isToday(date);

                                return (
                                    <div key={i} className={`${styles.weekDayColumn} ${today ? styles.weekDayColumnToday : ''}`}>
                                        {dayAppointments.length === 0 ? (
                                            <p className={styles.emptyDayText}>No appointments</p>
                                        ) : (
                                            <div className={styles.weekAppointmentsList}>
                                                {dayAppointments.map((apt: any) => (
                                                    <div
                                                        key={apt.id}
                                                        className={styles.weekAppointmentCard}
                                                        onClick={() => openAppointmentModal(apt)}
                                                    >
                                                        <p className={styles.weekAppointmentTime}>{formatTime(apt.appointment_time)}</p>
                                                        <p className={styles.weekAppointmentClient}>{apt.user?.full_name}</p>
                                                        <p className={styles.weekAppointmentLocation}>
                                                            {apt.user?.full_name?.split(' ')[1] || 'Studio'}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Day View - Exact Same as Today's Schedule */}
                {viewMode === 'day' && (
                    <div className={styles.dayView}>
                        {getAppointmentsForDate(currentDate).length === 0 ? (
                            <p className={styles.emptyDayText}>No appointments scheduled</p>
                        ) : (
                            <div className={styles.appointmentsList}>
                                {getAppointmentsForDate(currentDate).map((apt: any) => {
                                    const isVip = apt.user?.is_vip || false;
                                    const streak = apt.user?.vip_streak || 0;
                                    const referrals = apt.user?.referral_count || 0;
                                    const birthday = apt.user?.birthday;
                                    const memberSince = apt.user?.created_at
                                        ? new Date(apt.user.created_at).getFullYear()
                                        : new Date().getFullYear();

                                    return (
                                        <div key={apt.id} className={styles.appointmentCard} onClick={() => openAppointmentModal(apt)}>

                                            <span className={`${styles.statusBadge} ${apt.status === 'confirmed' ? styles.statusConfirmed : styles.statusPending}`}>
                                                {apt.status}
                                            </span>

                                            <div className={styles.clientHeader}>
                                                <div style={{ position: 'relative' }}>
                                                    {apt.user?.avatar_url ? (
                                                        <img src={apt.user.avatar_url} alt={apt.user.full_name} className={styles.clientAvatar} />
                                                    ) : (
                                                        <div className={styles.clientAvatarPlaceholder}>
                                                            {getInitials(apt.user?.full_name || 'U')}
                                                        </div>
                                                    )}
                                                    {isVip && (
                                                        <div className={styles.vipBadge}>
                                                            <Crown size={12} />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className={styles.clientInfo}>
                                                    <div className={styles.clientDetails}>
                                                        <span className={styles.clientName}>{apt.user?.full_name}</span>
                                                        {isVip && (
                                                            <span className={styles.vipMetaBadge}>
                                                                <Crown size={10} fill="currentColor" />
                                                                VIP
                                                            </span>
                                                        )}
                                                        {streak > 0 && (
                                                            <span className={styles.streakBadge}>
                                                                <Star size={10} fill="currentColor" />
                                                                {streak} streak
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className={styles.clientMeta}>
                                                        <span className={styles.metaItem}>Member since {memberSince}</span>
                                                        {referrals > 0 && (
                                                            <span className={styles.metaItem}>
                                                                <Users size={12} />
                                                                {referrals} referrals
                                                            </span>
                                                        )}
                                                        {birthday && (
                                                            <span className={styles.metaItem}>
                                                                <Cake size={12} />
                                                                {formatBirthday(birthday)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className={styles.serviceDisplay}>
                                                <Star size={16} className={styles.serviceIcon} />
                                                <span className={styles.serviceName}>{apt.service?.name}</span>
                                                <span className={styles.serviceDuration}>{formatTime(apt.appointment_time)}</span>
                                            </div>

                                            <div className={styles.actionButtons}>
                                                <button
                                                    className={`${styles.actionButton} ${styles.messageButton}`}
                                                    data-tooltip="Message"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleMessageClient(apt.user_id, apt.user?.full_name);
                                                    }}
                                                >
                                                    <MessageCircle size={18} />
                                                </button>
                                                <button className={`${styles.actionButton} ${styles.aftercareButton}`} data-tooltip="Aftercare">
                                                    <Gift size={18} />
                                                </button>
                                                <button className={`${styles.actionButton} ${styles.formButton}`} data-tooltip="Allergy Form">
                                                    <FileText size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Appointment Detail Modal */}
            {showModal && selectedAppointment && (
                <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>Appointment Details</h3>
                            <button className={styles.modalClose} onClick={() => setShowModal(false)}>×</button>
                        </div>

                        <div className={styles.modalBody}>
                            <div className={styles.clientSection}>
                                <div className={styles.clientHeaderModal}>
                                    <div style={{ position: 'relative' }}>
                                        {selectedAppointment.user?.avatar_url ? (
                                            <img src={selectedAppointment.user.avatar_url} alt={selectedAppointment.user.full_name} className={styles.clientAvatarLarge} />
                                        ) : (
                                            <div className={styles.clientAvatarPlaceholderLarge}>
                                                {getInitials(selectedAppointment.user?.full_name || 'U')}
                                            </div>
                                        )}
                                        {selectedAppointment.user?.is_vip && (
                                            <div className={styles.vipBadgeLarge}>
                                                <Crown size={16} />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className={styles.modalClientName}>{selectedAppointment.user?.full_name}</h4>
                                        <p className={styles.modalServiceName}>{selectedAppointment.service?.name}</p>
                                        <p className={styles.modalTime}>{formatTime(selectedAppointment.appointment_time)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.notesSection}>
                                <label className={styles.notesLabel}>Staff Notes</label>
                                <textarea
                                    className={styles.notesTextarea}
                                    placeholder="Add private notes about this appointment..."
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    rows={4}
                                />
                            </div>

                            <div className={styles.modalActions}>
                                <button
                                    className={styles.modalActionButton}
                                    onClick={() => {
                                        handleMessageClient(selectedAppointment.user_id, selectedAppointment.user?.full_name);
                                        setShowModal(false);
                                    }}
                                >
                                    <MessageCircle size={18} />
                                    Message
                                </button>
                                <button className={styles.modalActionButton}>
                                    <Gift size={18} />
                                    Aftercare
                                </button>
                                <button className={styles.modalActionButton}>
                                    <FileText size={18} />
                                    Allergy Form
                                </button>
                            </div>

                            <button
                                className={styles.saveNoteButton}
                                onClick={() => handleSaveNote(selectedAppointment.id)}
                            >
                                Save Note
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}