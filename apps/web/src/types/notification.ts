export interface Notification {
  id: string;
  user_id: string;
  type: 'booking_confirmed' | 'payment_received' | 'reminder_24h' | 'reminder_2h' | 'booking_cancelled' | 'vip_achieved' | 'general';
  title: string;
  message: string;
  related_appointment_id?: string | null;
  is_read: boolean;
  created_at: string;
}

export interface NotificationWithDetails extends Notification {
  appointment?: {
    appointment_date: string;
    appointment_time: string;
    services: { name: string };
    staff: { name: string };
  };
}

export interface CreateNotificationData {
  user_id: string;
  type: Notification['type'];
  title: string;
  message: string;
  related_appointment_id?: string;
}