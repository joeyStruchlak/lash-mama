import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    // Get all VIP users
    const { data: vipUsers, error: vipError } = await supabase
      .from('users')
      .select('id, email, full_name, last_booking_date')
      .eq('role', 'vip');

    if (vipError) throw vipError;

    const now = new Date();
    const threeMonthsAgo = new Date(now.setMonth(now.getMonth() - 3));

    let downgraded = 0;

    for (const user of vipUsers || []) {
      if (!user.last_booking_date) {
        continue; // Skip if no booking history
      }

      const lastBooking = new Date(user.last_booking_date);

      // If last booking was more than 3 months ago, downgrade
      if (lastBooking < threeMonthsAgo) {
        // Downgrade to regular user
        await supabase
          .from('users')
          .update({ 
            role: 'user',
            vip_streak: 0,
          })
          .eq('id', user.id);

        // Delete VIP profile
        await supabase
          .from('vip_profiles')
          .delete()
          .eq('user_id', user.id);

        // Send notification
        await supabase
          .from('notifications')
          .insert({
            user_id: user.id,
            type: 'general',
            title: 'VIP Status Update',
            message: 'Your VIP status has expired due to inactivity. Book again to rebuild your streak and regain VIP benefits!',
            is_read: false,
          });

        downgraded++;
        console.log(`Downgraded VIP user: ${user.email}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Checked ${vipUsers?.length || 0} VIP users, downgraded ${downgraded}`,
      downgraded,
    });

  } catch (error) {
    console.error('VIP check error:', error);
    return NextResponse.json(
      { error: 'Failed to check VIP status' },
      { status: 500 }
    );
  }
}