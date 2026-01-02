'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { CalendarHeader } from '@/components/calendar/CalendarHeader';
import { MonthView } from '@/components/calendar/MonthView';
import { WeekView } from '@/components/calendar/WeekView';
import { DayView } from '@/components/calendar/DayView';
import { ListView } from '@/components/calendar/ListView';
import type { User } from '@supabase/supabase-js';
import type { CalendarAppointment } from '@/types/calendar';

type CalendarView = 'month' | 'week' | 'day' | 'list';

interface Appointment {
    id: string;
    appointment_time: string;
    appointment_date: string;
    status: string;
    services: { name: string }[];
    staff: { name: string }[];
    users: { full_name: string | null; email: string }[];
}

export default function AdminCalendarPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<CalendarView>('week');
    const [appointments, setAppointments] = useState<CalendarAppointment[]>([]);
    const [selectedAppointment, setSelectedAppointment] = useState<CalendarAppointment | null>(null);

    useEffect(() => {
        async function checkAdminAccess(): Promise<void> {
            try {
                const { data: { user }, error: userError } = await supabase.auth.getUser();

                if (userError || !user) {
                    router.push('/login');
                    return;
                }

                setUser(user);

                const { data: profile, error: profileError } = await supabase
                    .from('users')
                    .select('role')
                    .eq('id', user.id)
                    .single();

                if (profileError || profile?.role !== 'admin') {
                    router.push('/');
                    return;
                }

                setIsAdmin(true);
                await loadAppointments();
            } catch (error) {
                console.error('Error checking admin access:', error);
                router.push('/');
            } finally {
                setLoading(false);
            }
        }

        checkAdminAccess();
    }, [router]);

    useEffect(() => {
        if (isAdmin) {
            loadAppointments();
        }
    }, [currentDate, view, isAdmin]);

    const loadAppointments = async (): Promise<void> => {
        try {
            // Get date range based on view
            let startDate: string;
            let endDate: string;

            if (view === 'month') {
                const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
                startDate = firstDay.toISOString().split('T')[0];
                endDate = lastDay.toISOString().split('T')[0];
            } else if (view === 'week') {
                const startOfWeek = new Date(currentDate);
                startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(endOfWeek.getDate() + 6);
                startDate = startOfWeek.toISOString().split('T')[0];
                endDate = endOfWeek.toISOString().split('T')[0];
            } else if (view === 'day') {
                startDate = currentDate.toISOString().split('T')[0];
                endDate = startDate;
            } else {
                // List view - next 30 days
                startDate = new Date().toISOString().split('T')[0];
                const futureDate = new Date();
                futureDate.setDate(futureDate.getDate() + 30);
                endDate = futureDate.toISOString().split('T')[0];
            }

            const { data, error } = await supabase
                .from('appointments')
                .select(`
          id,
          appointment_time,
          appointment_date,
          status,
          services (name),
          staff (name),
          users (full_name, email)
        `)
                .gte('appointment_date', startDate)
                .lte('appointment_date', endDate)
                .order('appointment_date', { ascending: true })
                .order('appointment_time', { ascending: true });

            if (error) {
                console.error('Error loading appointments:', error);
            } else if (data) {
                setAppointments(data as CalendarAppointment[]);
            }
        } catch (error) {
            console.error('Error loading appointments:', error);
        }
    };

    const handlePrevious = (): void => {
        const newDate = new Date(currentDate);
        if (view === 'month') {
            newDate.setMonth(newDate.getMonth() - 1);
        } else if (view === 'week') {
            newDate.setDate(newDate.getDate() - 7);
        } else if (view === 'day') {
            newDate.setDate(newDate.getDate() - 1);
        }
        setCurrentDate(newDate);
    };

    const handleNext = (): void => {
        const newDate = new Date(currentDate);
        if (view === 'month') {
            newDate.setMonth(newDate.getMonth() + 1);
        } else if (view === 'week') {
            newDate.setDate(newDate.getDate() + 7);
        } else if (view === 'day') {
            newDate.setDate(newDate.getDate() + 1);
        }
        setCurrentDate(newDate);
    };

    const handleToday = (): void => {
        setCurrentDate(new Date());
    };

    const handleNewAppointment = (): void => {
        router.push('/book');
    };

    const handleAppointmentClick = (appointment: CalendarAppointment): void => {
        setSelectedAppointment(appointment);
        // TODO: Open appointment details modal
        console.log('Appointment clicked:', appointment);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gold-50 py-12 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gold-600 border-r-transparent mb-4"></div>
                    <p className="text-xl text-dark-secondary">Loading calendar...</p>
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

                    {/* Page Title */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-serif font-bold text-dark mb-2">
                            Calendar
                        </h1>
                        <p className="text-dark-secondary">
                            View and manage all appointments
                        </p>
                    </div>

                    {/* Calendar Header */}
                    <CalendarHeader
                        currentDate={currentDate}
                        view={view}
                        onViewChange={setView}
                        onPrevious={handlePrevious}
                        onNext={handleNext}
                        onToday={handleToday}
                        onNewAppointment={handleNewAppointment}
                    />

                    {/* Calendar Views */}
                    {view === 'month' && (
                        <MonthView
                            currentDate={currentDate}
                            appointments={appointments}
                            onAppointmentClick={handleAppointmentClick}
                        />
                    )}

                    {view === 'week' && (
                        <WeekView
                            currentDate={currentDate}
                            appointments={appointments}
                            onAppointmentClick={handleAppointmentClick}
                        />
                    )}

                    {view === 'day' && (
                        <DayView
                            currentDate={currentDate}
                            appointments={appointments}
                            onAppointmentClick={handleAppointmentClick}
                        />
                    )}

                    {view === 'list' && (
                        <ListView
                            appointments={appointments}
                            onAppointmentClick={handleAppointmentClick}
                            title="Upcoming Appointments"
                        />
                    )}
                </div>
            </main>
        </div>
    );
}