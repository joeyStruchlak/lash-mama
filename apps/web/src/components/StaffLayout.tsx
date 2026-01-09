'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Briefcase, Calendar, TrendingUp, MessageSquare, StickyNote, User } from 'lucide-react';
import Link from 'next/link';


interface StaffLayoutProps {
    children: React.ReactNode;
}

export default function StaffLayout({ children }: StaffLayoutProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [firstName, setFirstName] = useState('');
    const [stats, setStats] = useState({ today: 0, week: 0 });
    const [unreadMessages] = useState(2);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUserData();
    }, []);

    async function fetchUserData() {
        try {
            // Check cache first - prevents refetching on every navigation
            const cachedStats = sessionStorage.getItem('staff_header_stats');
            if (cachedStats) {
                const data = JSON.parse(cachedStats);
                setFirstName(data.firstName);
                setStats(data.stats);
                setLoading(false);
                return; // Exit early if we have cached data
            }

            // If no cache, fetch fresh data
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: userProfile } = await supabase
                .from('users')
                .select('full_name')
                .eq('id', user.id)
                .single();

            const name = userProfile?.full_name?.split(' ')[0] || '';
            setFirstName(name);

            const { data: staffProfile } = await supabase
                .from('staff')
                .select('id')
                .eq('user_id', user.id)
                .single();

            if (staffProfile) {
                const today = new Date().toISOString().split('T')[0];
                const startOfWeek = new Date();
                startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

                const { data: appointments } = await supabase
                    .from('appointments')
                    .select('id, appointment_date')
                    .eq('staff_id', staffProfile.id);

                if (appointments) {
                    const todayCount = appointments.filter(apt => apt.appointment_date === today).length;
                    const weekCount = appointments.filter(apt =>
                        apt.appointment_date >= startOfWeek.toISOString().split('T')[0]
                    ).length;

                    const newStats = { today: todayCount, week: weekCount };
                    setStats(newStats);

                    // Cache it for the session
                    sessionStorage.setItem('staff_header_stats', JSON.stringify({
                        firstName: name,
                        stats: newStats
                    }));
                }
            }
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    }

    const navItems = [
        { icon: Briefcase, label: 'Dashboard', path: '/staff' },
        { icon: Calendar, label: 'Calendar', path: '/staff/calendar' },
        { icon: TrendingUp, label: 'Analytics', path: '/staff/hours' },
        { icon: MessageSquare, label: 'Messages', path: '/staff/messages', badge: unreadMessages },
        { icon: StickyNote, label: 'Notes', path: '/staff/notes' },
        { icon: User, label: 'Profile', path: '/staff/profile' }
    ];

    return (
        <div style={{ minHeight: '100vh', background: '#FAF8F5' }}>
            {/* Persistent Header */}
            <div style={{
                padding: '48px 24px',
                marginBottom: '32px'
            }}>
                <div style={{
                    background: 'linear-gradient(135deg, #2B2B2B 0%, #3D3D3D 100%)',
                    maxWidth: '1400px',
                    width: 'calc(100% - 48px)',
                    margin: '0 auto',
                    borderRadius: '24px',
                    padding: '48px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(201, 168, 114, 0.1), 0 0 40px rgba(201, 168, 114, 0.08)',
                    border: '1px solid rgba(201, 168, 114, 0.15)'
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
                                Welcome back{firstName && `, ${firstName}`}
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
                                {stats.today}
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
                                {stats.week}
                            </p>
                            <p style={{ fontSize: '14px', color: '#B8B8B8' }}>
                                This Week
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Area with Sidebar */}
            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px 32px' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '280px 1fr',
                    gap: '24px'
                }}>
                    {/* Sidebar Navigation */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {navItems.map((item, i) => {
                            const isActive = pathname === item.path;
                            return (
                                <Link
                                    key={i}
                                    href={item.path}
                                    style={{
                                        padding: '16px 24px',
                                        background: isActive ? 'linear-gradient(135deg, #C9A872 0%, #B8956A 100%)' : 'white',
                                        color: isActive ? 'white' : '#2B2B2B',
                                        border: isActive ? 'none' : '1px solid #E8E3DC',
                                        borderRadius: '12px',
                                        fontSize: '15px',
                                        fontWeight: isActive ? '600' : '500',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        position: 'relative',
                                        transition: 'all 0.2s',
                                        boxShadow: isActive ? '0 4px 12px rgba(184, 149, 106, 0.25)' : 'none',
                                        textDecoration: 'none'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isActive) e.currentTarget.style.background = '#F8F5F0';
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isActive) e.currentTarget.style.background = 'white';
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
                                </Link>
                            );
                        })}
                    </div>

                    <div>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}