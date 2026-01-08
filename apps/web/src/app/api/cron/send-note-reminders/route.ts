import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { createNotification } from '@/lib/notifications';

export async function GET(req: NextRequest) {
  try {
    const now = new Date();

    // Get notes with reminders due now (past due or within next 5 minutes)
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60000);

    const { data: dueNotes, error } = await supabaseAdmin
      .from('staff_notes')
      .select(`
        id,
        note_text,
        reminder_datetime,
        staff_id,
        staff:staff_id(user_id, name)
      `)
      .not('reminder_datetime', 'is', null)
      .eq('reminder_sent', false)
      .lte('reminder_datetime', fiveMinutesFromNow.toISOString());

    if (error) throw error;

    let remindersSent = 0;

    for (const note of dueNotes || []) {
      const staff = note.staff as any;

      if (!staff?.user_id) continue;

      // Send notification to staff member
      await createNotification({
        user_id: staff.user_id,
        type: 'reminder_24h',
        title: '📝 Note Reminder',
        message: `${note.note_text.substring(0, 150)}${note.note_text.length > 150 ? '...' : ''}`,
      });

      // Mark reminder as sent
      await supabaseAdmin
        .from('staff_notes')
        .update({ reminder_sent: true })
        .eq('id', note.id);

      remindersSent++;
      console.log(`Sent note reminder to staff: ${staff.name}`);
    }

    return NextResponse.json({
      success: true,
      message: `Checked notes, sent ${remindersSent} reminders`,
      remindersSent,
    });

  } catch (error) {
    console.error('Note reminder error:', error);
    return NextResponse.json(
      { error: 'Failed to send note reminders' },
      { status: 500 }
    );
  }
}