import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { createNotification } from '@/lib/notifications';

export async function GET(req: NextRequest) {
    try {
        const now = new Date();
        const currentDate = now.toISOString().split('T')[0];
        const currentTime = now.toTimeString().split(' ')[0].substring(0, 5); // HH:MM

        // Get notes with reminders due now (within the current hour)
        const { data: dueNotes, error } = await supabaseAdmin
            .from('staff_notes')
            .select(`
                id,
                note_text,
                reminder_time,
                client_id,
                staff_id,
                staff:staff_id(user_id, name),
                client:client_id(full_name)
            `)
            .eq('reminder_date', currentDate)
            .eq('reminder_sent', false)
            .not('reminder_time', 'is', null);

        if (error) throw error;

        let remindersSent = 0;

        for (const note of dueNotes || []) {
            // Check if reminder time has passed
            const reminderTime = note.reminder_time || '00:00';

            if (reminderTime <= currentTime) {
                const staff = note.staff as any;
                const client = note.client as any;

                if (!staff?.user_id) continue;

                // Send notification to staff member
                await createNotification({
                    user_id: staff.user_id,
                    type: 'reminder_24h',
                    title: '📝 Note Reminder',
                    message: `Reminder about ${client?.full_name}: "${note.note_text.substring(0, 100)}${note.note_text.length > 100 ? '...' : ''}"`,
                });

                // Mark reminder as sent
                await supabaseAdmin
                    .from('staff_notes')
                    .update({ reminder_sent: true })
                    .eq('id', note.id);

                remindersSent++;
                console.log(`Sent note reminder to staff: ${staff.name}`);
            }
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