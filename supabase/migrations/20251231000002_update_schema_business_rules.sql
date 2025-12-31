-- Migration: Update schema with VIP business rules, notifications, and reminders
-- Date: 2025-12-31

-- ADD NEW FIELDS TO USERS TABLE
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('guest', 'user', 'vip', 'admin'));
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS vip_streak INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_booking_date DATE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS birthday DATE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"push": true, "email": true, "sms": false}'::jsonb;

-- UPDATE VIP_PROFILES TABLE
ALTER TABLE public.vip_profiles DROP COLUMN IF EXISTS points;
ALTER TABLE public.vip_profiles DROP COLUMN IF EXISTS tier;
ALTER TABLE public.vip_profiles ADD COLUMN IF NOT EXISTS vip_since TIMESTAMPTZ;
ALTER TABLE public.vip_profiles ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0;
ALTER TABLE public.vip_profiles ADD COLUMN IF NOT EXISTS year_end_gift_sent BOOLEAN DEFAULT FALSE;
ALTER TABLE public.vip_profiles ADD COLUMN IF NOT EXISTS last_warning_sent TIMESTAMPTZ;

-- UPDATE APPOINTMENTS TABLE
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS can_reschedule BOOLEAN DEFAULT TRUE;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS rescheduled_at TIMESTAMPTZ;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS original_date DATE;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS discount_applied DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS discount_type TEXT;

-- CREATE NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  sent_at TIMESTAMPTZ,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);

-- CREATE REMINDERS TABLE
CREATE TABLE IF NOT EXISTS public.reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  note_text TEXT NOT NULL,
  reminder_date DATE NOT NULL,
  reminder_time TIME,
  notification_offset TEXT DEFAULT '1 hour before',
  is_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own reminders" ON public.reminders
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON public.reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_date ON public.reminders(reminder_date);

-- DROP ACHIEVEMENTS TABLE (not needed)
DROP TABLE IF EXISTS public.achievements CASCADE;