import { supabase } from './supabase';
import type { CreateNotificationData } from '@/types/notification';

// Create a notification
export async function createNotification(data: CreateNotificationData): Promise<void> {
  try {
    const { error } = await supabase.from('notifications').insert({
      user_id: data.user_id,
      type: data.type,
      title: data.title,
      message: data.message,
      related_appointment_id: data.related_appointment_id || null,
      is_read: false,
    });

    if (error) throw error;
  } catch (err) {
    console.error('Error creating notification:', err);
  }
}

// Send booking confirmation notification
export async function sendBookingConfirmation(
  userId: string,
  appointmentId: string,
  serviceName: string,
  date: string,
  time: string
): Promise<void> {
  await createNotification({
    user_id: userId,
    type: 'booking_confirmed',
    title: 'Booking Confirmed! 🎉',
    message: `Your ${serviceName} appointment is confirmed for ${new Date(date).toLocaleDateString('en-AU', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    })} at ${time}.`,
    related_appointment_id: appointmentId,
  });
}

// Send payment received notification
export async function sendPaymentReceived(
  userId: string,
  appointmentId: string,
  amount: number
): Promise<void> {
  await createNotification({
    user_id: userId,
    type: 'payment_received',
    title: 'Payment Received ✅',
    message: `We've received your $${amount} deposit payment. Your booking is confirmed!`,
    related_appointment_id: appointmentId,
  });
}

// Send 24-hour reminder
export async function send24HourReminder(
  userId: string,
  appointmentId: string,
  serviceName: string,
  date: string,
  time: string
): Promise<void> {
  await createNotification({
    user_id: userId,
    type: 'reminder_24h',
    title: 'Appointment Tomorrow! ⏰',
    message: `Reminder: Your ${serviceName} appointment is tomorrow at ${time}. See you soon!`,
    related_appointment_id: appointmentId,
  });
}

// Send 2-hour reminder
export async function send2HourReminder(
  userId: string,
  appointmentId: string,
  serviceName: string,
  time: string
): Promise<void> {
  await createNotification({
    user_id: userId,
    type: 'reminder_2h',
    title: 'Appointment in 2 Hours! 🔔',
    message: `Your ${serviceName} appointment is in 2 hours at ${time}. We can't wait to see you!`,
    related_appointment_id: appointmentId,
  });
}

// Send cancellation notification
export async function sendCancellationNotification(
  userId: string,
  appointmentId: string,
  serviceName: string,
  refundAmount?: number
): Promise<void> {
  const refundMessage = refundAmount 
    ? ` A refund of $${refundAmount} has been processed.`
    : ' No refund is applicable for this cancellation.';

  await createNotification({
    user_id: userId,
    type: 'booking_cancelled',
    title: 'Appointment Cancelled',
    message: `Your ${serviceName} appointment has been cancelled.${refundMessage}`,
    related_appointment_id: appointmentId,
  });
}

// Send VIP achievement notification
export async function sendVIPAchievement(
  userId: string,
  streak: number
): Promise<void> {
  await createNotification({
    user_id: userId,
    type: 'vip_achieved',
    title: '🌟 VIP Status Achieved!',
    message: `Congratulations! You've earned VIP status with ${streak} consecutive bookings. Enjoy exclusive discounts!`,
  });
}

// Mark notification as read
export async function markAsRead(notificationId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) throw error;
  } catch (err) {
    console.error('Error marking notification as read:', err);
  }
}

// Mark all notifications as read for a user
export async function markAllAsRead(userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
  } catch (err) {
    console.error('Error marking all as read:', err);
  }
}

// Delete notification
export async function deleteNotification(notificationId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) throw error;
  } catch (err) {
    console.error('Error deleting notification:', err);
  }
}

// Get unread count
export async function getUnreadCount(userId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
    return count || 0;
  } catch (err) {
    console.error('Error getting unread count:', err);
    return 0;
  }
}

// Send note reminder notification
export async function sendNoteReminderNotification(
  userId: string,
  noteText: string
): Promise<void> {
  await createNotification({
    user_id: userId,
    type: 'reminder',
    title: '📝 Note Reminder',
    message: noteText.length > 100 ? noteText.substring(0, 100) + '...' : noteText,
  });
}