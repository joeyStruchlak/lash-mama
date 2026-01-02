'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import NotesManager from '@/components/NotesManager';
import AvatarUpload from '@/components/AvatarUpload';

interface VIPProfile {
    id: string;
    user_id: string;
    tier: string;
    points: number;
    bookings_count: number;
    total_spent: number;
    member_since: string;
}

interface Appointment {
    id: string;
    appointment_date: string;
    appointment_time: string;
    total_price: number;
    status: string;
    discount_applied: number;
    discount_type: string | null;
    services: { name: string }[];
    staff: { name: string }[];
}

export default function VIPPage() {
    const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'rewards' | 'notes' | 'profile'>('overview');
    const [vipProfile, setVipProfile] = useState<VIPProfile | null>(null);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const router = useRouter();


    useEffect(() => {
        async function fetchVIPData(): Promise<void> {
            try {
                // Get current user
                const { data: { user }, error: userError } = await supabase.auth.getUser();

                if (userError) {
                    console.error('Error fetching user:', userError);
                    setLoading(false);
                    return;
                }

                if (!user) {
                    setLoading(false);
                    return;
                }

                // Fetch user's avatar
                const { data: userData, error: avatarError } = await supabase
                    .from('users')
                    .select('avatar_url')
                    .eq('id', user.id)
                    .single();

                if (avatarError) {
                    console.error('Error fetching avatar:', avatarError);
                } else if (userData) {
                    setAvatarUrl(userData.avatar_url);
                }

                // For now, create a demo VIP profile
                const demoProfile: VIPProfile = {
                    id: '1',
                    user_id: user.id,
                    tier: 'platinum',
                    points: 2450,
                    bookings_count: 24,
                    total_spent: 4850,
                    member_since: new Date('2023-01-15').toISOString(),
                };

                setVipProfile(demoProfile);

                // Fetch real appointments
                const { data: appointmentsData, error: appointmentsError } = await supabase
                    .from('appointments')
                    .select(`
                    id,
                    appointment_date,
                    appointment_time,
                    total_price,
                    status,
                    discount_applied,
                    discount_type,
                    services (name),
                    staff (name)
                `)
                    .eq('user_id', user.id)
                    .order('appointment_date', { ascending: false })
                    .limit(10);

                if (appointmentsError) {
                    console.error('Error fetching appointments:', appointmentsError);
                } else if (appointmentsData) {
                    setAppointments(appointmentsData as Appointment[]);
                }

            } catch (error) {
                console.error('Unexpected error in fetchVIPData:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchVIPData();
    }, []);

    const handleCancelAppointment = async (appointmentId: string): Promise<void> => {
        try {
            const { error } = await supabase
                .from('appointments')
                .update({ status: 'cancelled' })
                .eq('id', appointmentId);

            if (error) {
                console.error('Supabase error:', error);
                throw new Error('Failed to cancel appointment in database');
            }

            // Update local state optimistically
            setAppointments(prev =>
                prev.map(appointment =>
                    appointment.id === appointmentId
                        ? { ...appointment, status: 'cancelled' }
                        : appointment
                )
            );

            // TODO: Replace with toast notification in styling phase
            alert('Appointment cancelled successfully');

        } catch (error) {
            console.error('Error cancelling appointment:', error);
            const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
            alert(`Failed to cancel: ${errorMessage}`);
        }
    };
    const tiers = [
        { name: 'Bronze', minPoints: 0, color: 'text-yellow-700', bgColor: 'bg-yellow-50' },
        { name: 'Silver', minPoints: 500, color: 'text-gray-400', bgColor: 'bg-gray-50' },
        { name: 'Gold', minPoints: 1000, color: 'text-yellow-500', bgColor: 'bg-yellow-50' },
        { name: 'Platinum', minPoints: 2000, color: 'text-blue-400', bgColor: 'bg-blue-50' },
        { name: 'Diamond', minPoints: 3000, color: 'text-pink-500', bgColor: 'bg-pink-50' },
    ];

    const achievements = [
        { name: 'First Booking', date: 'Jan 15, 2023' },
        { name: '10 Bookings', date: 'Apr 22, 2023' },
        { name: 'VIP Member', date: 'Jun 10, 2023' },
        { name: 'Loyal Client', date: 'Aug 30, 2023' },
        { name: 'Platinum Tier', date: 'Nov 5, 2023' },
    ];

    const rewards = [
        { name: '$50 Service Credit', points: 500, available: true },
        { name: 'Free Refill Service', points: 1000, available: true },
        { name: 'Premium Makeup Session', points: 1500, available: false },
        { name: 'Exclusive VIP Event Invite', points: 2000, available: false },
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-gold-50 py-12 flex items-center justify-center">
                <p className="text-xl text-dark-secondary">Loading VIP dashboard...</p>
            </div>
        );
    }

    if (!vipProfile) {
        return (
            <div className="min-h-screen bg-gold-50 py-12 flex items-center justify-center">
                <Card className="p-8 text-center max-w-md">
                    <h2 className="text-2xl font-serif font-bold text-dark mb-4">
                        Join VIP Program
                    </h2>
                    <p className="text-dark-secondary mb-6">
                        Book your first appointment to become a VIP member and start earning rewards!
                    </p>
                    <Button variant="primary">Book Now</Button>
                </Card>
            </div>
        );
    }

    const pointsToNextTier = 3000 - vipProfile.points; // Diamond tier

    return (
        <div className="min-h-screen bg-gold-50 py-12">
            <div className="max-w-6xl mx-auto px-6">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-5xl font-serif font-bold text-dark mb-4">
                        VIP Loyalty Program
                    </h1>
                    <p className="text-xl text-dark-secondary">
                        Welcome! You're on the {vipProfile.tier} tier
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    <Card className="text-center p-6">
                        <p className="text-dark-secondary mb-2">Current Tier</p>
                        <h3 className="text-3xl font-serif font-bold text-gold-600 capitalize">
                            {vipProfile.tier}
                        </h3>
                    </Card>
                    <Card className="text-center p-6">
                        <p className="text-dark-secondary mb-2">VIP Points</p>
                        <h3 className="text-3xl font-serif font-bold text-dark">
                            {vipProfile.points}
                        </h3>
                    </Card>
                    <Card className="text-center p-6">
                        <p className="text-dark-secondary mb-2">Total Bookings</p>
                        <h3 className="text-3xl font-serif font-bold text-dark">
                            {vipProfile.bookings_count}
                        </h3>
                    </Card>
                    <Card className="text-center p-6">
                        <p className="text-dark-secondary mb-2">Total Spent</p>
                        <h3 className="text-3xl font-serif font-bold text-gold-600">
                            ${vipProfile.total_spent}
                        </h3>
                    </Card>
                </div>

                {/* Tier Progress */}
                <Card className="mb-12 p-8">
                    <h2 className="text-2xl font-serif font-bold text-dark mb-4">
                        Progress to Next Tier
                    </h2>
                    <div className="w-full bg-gold-100 rounded-full h-4 mb-4">
                        <div
                            className="bg-gold-600 h-4 rounded-full transition-all"
                            style={{
                                width: `${(vipProfile.points / (vipProfile.points + pointsToNextTier)) * 100}%`,
                            }}
                        />
                    </div>
                    <p className="text-dark-secondary">
                        {pointsToNextTier > 0
                            ? `${pointsToNextTier} points until Diamond tier`
                            : 'You are at the highest tier!'}
                    </p>
                </Card>

                {/* Tabs */}
                <div className="mb-8 flex gap-4 border-b border-gold-200">
                    {['overview', 'history', 'rewards', 'notes', 'profile'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`px-6 py-4 font-serif font-bold transition-colors capitalize ${activeTab === tab
                                ? 'text-gold-600 border-b-2 border-gold-600'
                                : 'text-dark-secondary hover:text-dark'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Achievements */}
                        <Card className="p-6">
                            <h3 className="text-2xl font-serif font-bold text-dark mb-6">
                                Achievements
                            </h3>
                            <div className="space-y-3">
                                {achievements.map((achievement) => (
                                    <div
                                        key={achievement.name}
                                        className="flex items-center gap-3 pb-3 border-b border-gold-100"
                                    >
                                        <div className="text-2xl">⭐</div>
                                        <div>
                                            <p className="font-serif font-bold text-dark">
                                                {achievement.name}
                                            </p>
                                            <p className="text-sm text-dark-secondary">
                                                {achievement.date}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* Tier Info */}
                        <Card className="p-6">
                            <h3 className="text-2xl font-serif font-bold text-dark mb-6">
                                VIP Tiers
                            </h3>
                            <div className="space-y-3">
                                {tiers.map((tier) => (
                                    <div key={tier.name} className={`p-3 rounded-lg ${tier.bgColor}`}>
                                        <p className={`font-serif font-bold ${tier.color}`}>
                                            {tier.name} - {tier.minPoints}+ points
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                )}

                {activeTab === 'history' && (
                    <Card className="p-6">
                        <h3 className="text-2xl font-serif font-bold text-dark mb-6">
                            Booking History
                        </h3>
                        {loading ? (
                            <p className="text-center text-dark-secondary py-8">Loading...</p>
                        ) : appointments.length === 0 ? (
                            <p className="text-dark-secondary text-center py-8">
                                No bookings yet. Book your first appointment to see it here!
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {appointments.map((booking) => (
                                    <div
                                        key={booking.id}
                                        className="p-4 border-2 border-gold-100 rounded-lg hover:border-gold-300 transition-colors"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="font-serif font-bold text-dark text-lg">
                                                    {booking.services[0]?.name || 'Unknown Service'}
                                                </p>
                                                <p className="text-sm text-dark-secondary">
                                                    with {booking.staff[0]?.name || 'Unknown Staff'}
                                                </p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${booking.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                booking.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                                                    booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                        'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {booking.status}
                                            </span>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <div className="text-sm text-dark-secondary">
                                                📅 {new Date(booking.appointment_date).toLocaleDateString('en-US', {
                                                    weekday: 'short',
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                                {' • '}
                                                🕐 {booking.appointment_time}
                                            </div>
                                            <p className="text-xl font-bold text-gold-600">
                                                ${booking.total_price}
                                            </p>
                                        </div>

                                        {booking.discount_applied > 0 && (
                                            <div className="mt-2 text-sm text-green-600 font-bold">
                                                💎 VIP Discount Applied: -${booking.discount_applied}
                                            </div>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="mt-4 pt-4 border-t border-gold-100 space-y-3">
                                            {/* Reschedule Button (only for pending/confirmed appointments) */}
                                            {(booking.status === 'pending' || booking.status === 'confirmed') && (
                                                <Button
                                                    variant="primary"
                                                    className="w-full"
                                                    onClick={() => {
                                                        try {
                                                            const appointmentDate = new Date(booking.appointment_date);
                                                            const now = new Date();

                                                            // Calculate hours until appointment
                                                            const millisecondsUntilAppt = appointmentDate.getTime() - now.getTime();
                                                            const hoursUntilAppt = millisecondsUntilAppt / (1000 * 60 * 60);

                                                            // 48-hour policy check
                                                            if (hoursUntilAppt < 48) {
                                                                alert('Appointments must be rescheduled at least 48 hours in advance. Please contact the salon directly to reschedule.');
                                                                return;
                                                            }

                                                            // Confirm cancellation
                                                            const confirmed = window.confirm(
                                                                'This will cancel your current appointment. You can then book a new time. Continue?'
                                                            );

                                                            if (confirmed) {
                                                                handleCancelAppointment(booking.id);
                                                            }
                                                        } catch (error) {
                                                            console.error('Error in reschedule handler:', error);
                                                            alert('Unable to process reschedule request. Please try again.');
                                                        }
                                                    }}
                                                >
                                                    Reschedule Appointment
                                                </Button>
                                            )}

                                            {/* Rebook Button (for all appointments) */}
                                            <Button
                                                variant="outline"
                                                className="w-full"
                                                onClick={() => {
                                                    try {
                                                        router.push('/book');
                                                    } catch (error) {
                                                        console.error('Navigation error:', error);
                                                        // Fallback to hard navigation if router fails
                                                        window.location.href = '/book';
                                                    }
                                                }}
                                            >
                                                Book Again
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                )}

                {activeTab === 'rewards' && (
                    <Card className="p-6">
                        <h3 className="text-2xl font-serif font-bold text-dark mb-6">
                            Available Rewards
                        </h3>
                        <div className="space-y-4">
                            {rewards.map((reward) => (
                                <div
                                    key={reward.name}
                                    className="flex justify-between items-center p-4 border-2 border-gold-100 rounded-lg"
                                >
                                    <div>
                                        <p className="font-serif font-bold text-dark">{reward.name}</p>
                                        <p className="text-sm text-dark-secondary">
                                            {reward.points} points
                                        </p>
                                    </div>
                                    <Button
                                        variant={reward.available ? 'primary' : 'outline'}
                                        disabled={!reward.available}
                                    >
                                        {reward.available ? 'Redeem' : 'Locked'}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}

                {activeTab === 'notes' && vipProfile && (
                    <NotesManager userId={vipProfile.user_id} />
                )}

                {activeTab === 'profile' && vipProfile && (
                    <div className="bg-white rounded-lg shadow-sm border-2 border-gold-100 p-8">
                        <h3 className="text-2xl font-serif font-bold text-dark mb-6 text-center">
                            Profile Settings
                        </h3>
                        <AvatarUpload
                            userId={vipProfile.user_id}
                            currentAvatarUrl={avatarUrl}
                            onUploadComplete={(url) => {
                                setAvatarUrl(url);
                                // Force a small delay then trigger window event for header
                                setTimeout(() => {
                                    window.dispatchEvent(new Event('avatar-updated'));
                                }, 100);
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}