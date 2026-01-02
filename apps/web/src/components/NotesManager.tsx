'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Reminder {
  id: string;
  note_text: string;
  reminder_date: string;
  reminder_time: string;
  notification_offset: string;
  created_at: string;
}

export default function NotesManager({ userId }: { userId: string }) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [noteText, setNoteText] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const [notificationOffset, setNotificationOffset] = useState('1_hour');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadReminders();
  }, [userId]);

  const loadReminders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', userId)
        .order('reminder_date', { ascending: true });

      if (error) throw error;
      setReminders(data || []);
    } catch (error) {
      console.error('Error loading reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveReminder = async () => {
    if (!noteText.trim() || !reminderDate || !reminderTime) {
      alert('Please fill in all fields');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from('reminders').insert({
        user_id: userId,
        note_text: noteText.trim(),
        reminder_date: reminderDate,
        reminder_time: reminderTime,
        notification_offset: notificationOffset,
      });

      if (error) throw error;

      setNoteText('');
      setReminderDate('');
      setReminderTime('');
      setNotificationOffset('1_hour');

      await loadReminders();
      alert('Reminder saved successfully');
    } catch (error) {
      console.error('Error saving reminder:', error);
      alert('Failed to save reminder');
    } finally {
      setSaving(false);
    }
  };

  const deleteReminder = async (id: string) => {
    if (!confirm('Delete this reminder?')) return;

    try {
      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadReminders();
    } catch (error) {
      console.error('Error deleting reminder:', error);
      alert('Failed to delete reminder');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="space-y-6">
      {/* Create New Reminder */}
      <div className="bg-white rounded-lg shadow-sm border-2 border-gold-100 p-6">
        <h3 className="text-2xl font-serif font-bold text-dark mb-6">
          Create New Reminder
        </h3>
        
        <div className="space-y-4">
          {/* Note Text */}
          <div>
            <label className="block text-sm font-medium text-dark-secondary mb-2">
              Note
            </label>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="E.g., Refill appointment with Lash Mama"
              className="w-full px-4 py-3 border-2 border-gold-200 rounded-lg focus:ring-2 focus:ring-gold-600 focus:border-transparent resize-none font-sans"
              rows={3}
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-secondary mb-2">
                Date
              </label>
              <input
                type="date"
                value={reminderDate}
                onChange={(e) => setReminderDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border-2 border-gold-200 rounded-lg focus:ring-2 focus:ring-gold-600 focus:border-transparent font-sans"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-secondary mb-2">
                Time
              </label>
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gold-200 rounded-lg focus:ring-2 focus:ring-gold-600 focus:border-transparent font-sans"
              />
            </div>
          </div>

          {/* Notification Offset */}
          <div>
            <label className="block text-sm font-medium text-dark-secondary mb-2">
              Remind Me
            </label>
            <select
              value={notificationOffset}
              onChange={(e) => setNotificationOffset(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gold-200 rounded-lg focus:ring-2 focus:ring-gold-600 focus:border-transparent font-sans"
            >
              <option value="15_min">15 minutes before</option>
              <option value="30_min">30 minutes before</option>
              <option value="1_hour">1 hour before</option>
              <option value="2_hours">2 hours before</option>
              <option value="1_day">1 day before</option>
              <option value="2_days">2 days before</option>
              <option value="1_week">1 week before</option>
            </select>
          </div>

          {/* Save Button */}
          <button
            onClick={saveReminder}
            disabled={saving}
            className="w-full bg-gradient-to-r from-gold-600 to-gold-500 text-white py-3 rounded-lg font-serif font-bold hover:from-gold-700 hover:to-gold-600 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Reminder'}
          </button>
        </div>
      </div>

      {/* Existing Reminders */}
      <div className="bg-white rounded-lg shadow-sm border-2 border-gold-100 p-6">
        <h3 className="text-2xl font-serif font-bold text-dark mb-6">
          Your Reminders
        </h3>

        {loading ? (
          <p className="text-dark-secondary text-center py-8">Loading...</p>
        ) : reminders.length === 0 ? (
          <p className="text-dark-secondary text-center py-8">
            No reminders yet. Create one above!
          </p>
        ) : (
          <div className="space-y-4">
            {reminders.map((reminder) => (
              <div
                key={reminder.id}
                className="border-2 border-gold-100 rounded-lg p-4 hover:border-gold-300 hover:shadow-sm transition-all"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <p className="font-serif font-bold text-dark text-lg mb-3">
                      {reminder.note_text}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm text-dark-secondary">
                      <span>{formatDate(reminder.reminder_date)}</span>
                      <span>{formatTime(reminder.reminder_time)}</span>
                      <span className="text-gold-600">
                        {reminder.notification_offset.replace('_', ' ')} before
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteReminder(reminder.id)}
                    className="text-dark-secondary hover:text-red-600 font-medium text-sm transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}