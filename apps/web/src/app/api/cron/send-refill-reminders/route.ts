import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { createNotification } from '@/lib/notifications';

export async function GET(req: NextRequest) {
  try {
    // Calculate date range (10-11 days ago for 1.5 week reminder)
    const now = new Date();
    const tenDaysAgo = new Date(now);
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
    const elevenDaysAgo = new Date(now);
    elevenDaysAgo.setDate(elevenDaysAgo.getDate() - 11);

    // Get completed appointments from 10-11 days ago that need refills
    const { data: appointments, error } = await supabaseAdmin
      .from('appointments')
      .select(`
    id,
    user_id,
    appointment_date,
    users:user_id(id, full_name, email),
    services:service_id(name)
  `)
      .eq('status', 'completed')
      .gte('appointment_date', elevenDaysAgo.toISOString().split('T')[0])
      .lte('appointment_date', tenDaysAgo.toISOString().split('T')[0]);

    console.log('🔍 Date range:', {
      elevenDaysAgo: elevenDaysAgo.toISOString().split('T')[0],
      tenDaysAgo: tenDaysAgo.toISOString().split('T')[0],
    });

    if (error) throw error;

    let remindersSent = 0;

    for (const apt of appointments || []) {
      // Type guard for related data
      const user = apt.users as any;
      const service = apt.services as any;

      if (!user || !service) continue;

      // Check if service name includes refill-related keywords
      const serviceName = service.name?.toLowerCase() || '';
      const isRefillService =
        serviceName.includes('refill') ||
        serviceName.includes('lash') ||
        serviceName.includes('volume') ||
        serviceName.includes('hybrid') ||
        serviceName.includes('natural');

      if (!isRefillService) {
        continue; // Skip non-lash services
      }

      // Check if we already sent a refill reminder for this appointment
      const { data: existingReminder } = await supabaseAdmin
        .from('notifications')
        .select('id')
        .eq('user_id', apt.user_id)
        .eq('type', 'reminder_24h')
        .eq('related_appointment_id', apt.id)
        .single();

      if (existingReminder) {
        continue; // Already sent reminder
      }

      // Send refill reminder
      await createNotification({
        user_id: apt.user_id,
        type: 'reminder_24h',
        title: 'Time for a Refill! 💅✨',
        message: `It's been 10 days since your ${service.name || 'lash appointment'}. Your lashes are due for a refill to keep them looking perfect! Book now to maintain that gorgeous look.`,
        related_appointment_id: apt.id,
      });

      remindersSent++;
    }

    return NextResponse.json({
      success: true,
      message: `Checked ${appointments?.length || 0} appointments, sent ${remindersSent} refill reminders`,
      remindersSent,
    });

  } catch (error) {
    console.error('Refill reminder error:', error);
    return NextResponse.json(
      { error: 'Failed to send refill reminders' },
      { status: 500 }
    );
  }
}