export interface BusinessSettings {
  id: string;
  salon_name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  instagram: string | null;
  facebook: string | null;
  business_hours: {
    monday: { open: string; close: string; closed: boolean };
    tuesday: { open: string; close: string; closed: boolean };
    wednesday: { open: string; close: string; closed: boolean };
    thursday: { open: string; close: string; closed: boolean };
    friday: { open: string; close: string; closed: boolean };
    saturday: { open: string; close: string; closed: boolean };
    sunday: { open: string; close: string; closed: boolean };
  };
  created_at: string;
  updated_at: string;
}

export interface NotificationSettings {
  id: string;
  email_enabled: boolean;
  sms_enabled: boolean;
  reminder_24h: boolean;
  reminder_2h: boolean;
  booking_confirmations: boolean;
  vip_promotions: boolean;
  marketing_emails: boolean;
  created_at: string;
  updated_at: string;
}

export interface BookingSettings {
  id: string;
  deposit_amount: number;
  deposit_required: boolean;
  reschedule_hours_minimum: number;
  refill_days_minimum: number;
  cancellation_policy: string;
  late_cancellation_fee: number;
  no_show_fee: number;
  created_at: string;
  updated_at: string;
}

export type SettingsTab = 'business' | 'services' | 'notifications' | 'staff' | 'booking' | 'appearance';