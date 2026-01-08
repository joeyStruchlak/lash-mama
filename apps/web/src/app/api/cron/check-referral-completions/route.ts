import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { createNotification } from '@/lib/notifications';

export async function GET(req: NextRequest) {
    try {
        // Get all users who were referred but haven't completed their referral booking yet
        const { data: referredUsers, error } = await supabaseAdmin
            .from('users')
            .select('id, referred_by, full_name')
            .not('referred_by', 'is', null)
            .eq('referral_booking_completed', false);

        console.log('🔍 Found referred users:', referredUsers);
        console.log('🔍 Query error:', error);

        if (error) throw error;

        let completionsProcessed = 0;
        let vipUpgrades = 0;

        for (const user of referredUsers || []) {
            // Check if this user has any completed appointments
            const { data: completedAppointments } = await supabaseAdmin
                .from('appointments')
                .select('id')
                .eq('user_id', user.id)
                .eq('status', 'completed')
                .limit(1);

            console.log(`🔍 Checking user ${user.full_name}:`, completedAppointments);
            
            if (completedAppointments && completedAppointments.length > 0) {
                // Mark referral as completed
                await supabaseAdmin
                    .from('users')
                    .update({ referral_booking_completed: true })
                    .eq('id', user.id);

                completionsProcessed++;

                // Get referrer info
                const { data: referrer } = await supabaseAdmin
                    .from('users')
                    .select('id, vip_streak, role, full_name')
                    .eq('id', user.referred_by)
                    .single();

                if (referrer) {
                    // Send notification to referrer
                    await createNotification({
                        user_id: referrer.id,
                        type: 'vip_achieved',
                        title: '🎉 Referral Completed!',
                        message: `${user.full_name} completed their first booking! Thank you for referring them to Lash Mama.`,
                    });

                    // If referrer is at 5 bookings and not VIP yet, upgrade them!
                    if (referrer.vip_streak === 5 && referrer.role !== 'vip') {
                        // Upgrade to VIP
                        await supabaseAdmin
                            .from('users')
                            .update({
                                role: 'vip',
                                vip_streak: 10, // Set to 10 (fast-track)
                            })
                            .eq('id', referrer.id);

                        // Create VIP profile
                        await supabaseAdmin
                            .from('vip_profiles')
                            .insert({
                                user_id: referrer.id,
                                tier: 'gold',
                                points_balance: 0,
                                discount_percentage: 10,
                            });

                        // Send VIP upgrade notification
                        await createNotification({
                            user_id: referrer.id,
                            type: 'vip_achieved',
                            title: '💎 VIP STATUS UNLOCKED!',
                            message: 'Congratulations! Your referral earned you instant VIP status. Welcome to the VIP club with exclusive benefits and discounts!',
                        });

                        vipUpgrades++;
                        console.log(`Upgraded ${referrer.full_name} to VIP via referral fast-track!`);
                    }
                }

                console.log(`Processed referral completion for: ${user.full_name}`);
            }
        }

        return NextResponse.json({
            success: true,
            message: `Processed ${completionsProcessed} referral completions, ${vipUpgrades} VIP upgrades`,
            completionsProcessed,
            vipUpgrades,
        });

    } catch (error) {
        console.error('Referral completion check error:', error);
        return NextResponse.json(
            { error: 'Failed to check referral completions' },
            { status: 500 }
        );
    }
}