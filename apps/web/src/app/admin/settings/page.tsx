'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Settings as SettingsIcon, Building2, Bell, Calendar, Users, Palette } from 'lucide-react';
import type { BusinessSettings, NotificationSettings, BookingSettings, SettingsTab } from '@/types/settings';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('business');
  const [businessSettings, setBusinessSettings] = useState<BusinessSettings | null>(null);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings | null>(null);
  const [bookingSettings, setBookingSettings] = useState<BookingSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings(): Promise<void> {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('settings')
        .select('*');

      if (error) throw error;

      data?.forEach((setting) => {
        if (setting.setting_key === 'business') {
          setBusinessSettings(setting.setting_value as BusinessSettings);
        } else if (setting.setting_key === 'notifications') {
          setNotificationSettings(setting.setting_value as NotificationSettings);
        } else if (setting.setting_key === 'booking') {
          setBookingSettings(setting.setting_value as BookingSettings);
        }
      });
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  }

  async function saveSettings(key: string, value: any): Promise<void> {
    try {
      setSaving(true);

      const { error } = await supabase
        .from('settings')
        .update({ setting_value: value, updated_at: new Date().toISOString() })
        .eq('setting_key', key);

      if (error) throw error;

      alert('Settings saved successfully!');
    } catch (err) {
      console.error('Error saving settings:', err);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  }

  const tabs = [
    { id: 'business' as SettingsTab, label: 'Business Info', icon: Building2 },
    { id: 'services' as SettingsTab, label: 'Services', icon: SettingsIcon },
    { id: 'notifications' as SettingsTab, label: 'Notifications', icon: Bell },
    { id: 'staff' as SettingsTab, label: 'Staff Settings', icon: Users },
    { id: 'booking' as SettingsTab, label: 'Booking Rules', icon: Calendar },
    { id: 'appearance' as SettingsTab, label: 'Appearance', icon: Palette },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FAFAF7]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#C9A871] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-[#2A2A2A]">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-4xl font-bold text-[#2A2A2A] mb-2"
            style={{ fontFamily: 'Cormorant Garamond, serif' }}
          >
            Settings
          </h1>
          <p className="text-[#3D3D3D]">Manage your salon configuration</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="flex overflow-x-auto border-b border-gray-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-[#C9A871] border-b-2 border-[#C9A871]'
                      : 'text-[#3D3D3D] hover:text-[#2A2A2A]'
                  }`}
                >
                  <Icon size={20} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          {activeTab === 'business' && businessSettings && (
            <BusinessInfoTab 
              settings={businessSettings} 
              onSave={(data) => saveSettings('business', data)}
              saving={saving}
            />
          )}

          {activeTab === 'services' && (
            <div className="text-center py-12">
              <SettingsIcon size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-[#3D3D3D] text-lg">Services management coming soon</p>
              <p className="text-sm text-gray-500 mt-2">This will allow you to add/edit/delete services</p>
            </div>
          )}

          {activeTab === 'notifications' && notificationSettings && (
            <NotificationsTab
              settings={notificationSettings}
              onSave={(data) => saveSettings('notifications', data)}
              saving={saving}
            />
          )}

          {activeTab === 'staff' && (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-[#3D3D3D] text-lg">Staff settings coming soon</p>
              <p className="text-sm text-gray-500 mt-2">Default tier settings and permissions</p>
            </div>
          )}

          {activeTab === 'booking' && bookingSettings && (
            <BookingRulesTab
              settings={bookingSettings}
              onSave={(data) => saveSettings('booking', data)}
              saving={saving}
            />
          )}

          {activeTab === 'appearance' && (
            <div className="text-center py-12">
              <Palette size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-[#3D3D3D] text-lg">Appearance settings coming soon</p>
              <p className="text-sm text-gray-500 mt-2">Logo, colors, and theme customization</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Business Info Tab Component
function BusinessInfoTab({ settings, onSave, saving }: { settings: BusinessSettings; onSave: (data: any) => void; saving: boolean }) {
  const [formData, setFormData] = useState(settings);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#2A2A2A] mb-6">Business Information</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-[#2A2A2A] mb-2">Salon Name</label>
          <input
            type="text"
            value={formData.salon_name}
            onChange={(e) => setFormData({ ...formData, salon_name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A871]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2A2A2A] mb-2">Phone</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A871]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2A2A2A] mb-2">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A871]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2A2A2A] mb-2">Website</label>
          <input
            type="url"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A871]"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-[#2A2A2A] mb-2">Address</label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A871]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2A2A2A] mb-2">Instagram</label>
          <input
            type="text"
            value={formData.instagram || ''}
            onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
            placeholder="@username"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A871]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2A2A2A] mb-2">Facebook</label>
          <input
            type="text"
            value={formData.facebook || ''}
            onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
            placeholder="Page name"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A871]"
          />
        </div>
      </div>

      <div className="pt-6 border-t border-gray-200">
        <button
          onClick={() => onSave(formData)}
          disabled={saving}
          className="px-6 py-3 bg-gradient-to-r from-[#C9A871] to-[#D4AF37] text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

// Notifications Tab Component
function NotificationsTab({ settings, onSave, saving }: { settings: NotificationSettings; onSave: (data: any) => void; saving: boolean }) {
  const [formData, setFormData] = useState(settings);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#2A2A2A] mb-6">Notification Preferences</h2>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-[#FAFAF7] rounded-lg">
          <div>
            <p className="font-medium text-[#2A2A2A]">Email Notifications</p>
            <p className="text-sm text-[#3D3D3D]">Receive notifications via email</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.email_enabled}
              onChange={(e) => setFormData({ ...formData, email_enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#C9A871]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C9A871]"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-[#FAFAF7] rounded-lg">
          <div>
            <p className="font-medium text-[#2A2A2A]">SMS Notifications</p>
            <p className="text-sm text-[#3D3D3D]">Receive text message notifications</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.sms_enabled}
              onChange={(e) => setFormData({ ...formData, sms_enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#C9A871]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C9A871]"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-[#FAFAF7] rounded-lg">
          <div>
            <p className="font-medium text-[#2A2A2A]">24-Hour Reminders</p>
            <p className="text-sm text-[#3D3D3D]">Send reminders 24 hours before appointments</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.reminder_24h}
              onChange={(e) => setFormData({ ...formData, reminder_24h: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#C9A871]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C9A871]"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-[#FAFAF7] rounded-lg">
          <div>
            <p className="font-medium text-[#2A2A2A]">2-Hour Reminders</p>
            <p className="text-sm text-[#3D3D3D]">Send reminders 2 hours before appointments</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.reminder_2h}
              onChange={(e) => setFormData({ ...formData, reminder_2h: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#C9A871]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C9A871]"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-[#FAFAF7] rounded-lg">
          <div>
            <p className="font-medium text-[#2A2A2A]">Booking Confirmations</p>
            <p className="text-sm text-[#3D3D3D]">Send confirmation emails for new bookings</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.booking_confirmations}
              onChange={(e) => setFormData({ ...formData, booking_confirmations: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#C9A871]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C9A871]"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-[#FAFAF7] rounded-lg">
          <div>
            <p className="font-medium text-[#2A2A2A]">VIP Promotions</p>
            <p className="text-sm text-[#3D3D3D]">Notify VIP clients about special offers</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.vip_promotions}
              onChange={(e) => setFormData({ ...formData, vip_promotions: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#C9A871]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C9A871]"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-[#FAFAF7] rounded-lg">
          <div>
            <p className="font-medium text-[#2A2A2A]">Marketing Emails</p>
            <p className="text-sm text-[#3D3D3D]">Send promotional emails to all clients</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.marketing_emails}
              onChange={(e) => setFormData({ ...formData, marketing_emails: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#C9A871]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C9A871]"></div>
          </label>
        </div>
      </div>

      <div className="pt-6 border-t border-gray-200">
        <button
          onClick={() => onSave(formData)}
          disabled={saving}
          className="px-6 py-3 bg-gradient-to-r from-[#C9A871] to-[#D4AF37] text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

// Booking Rules Tab Component
function BookingRulesTab({ settings, onSave, saving }: { settings: BookingSettings; onSave: (data: any) => void; saving: boolean }) {
  const [formData, setFormData] = useState(settings);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#2A2A2A] mb-6">Booking Rules</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-[#2A2A2A] mb-2">Deposit Amount ($)</label>
          <input
            type="number"
            value={formData.deposit_amount}
            onChange={(e) => setFormData({ ...formData, deposit_amount: parseFloat(e.target.value) })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A871]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2A2A2A] mb-2">Reschedule Minimum (hours)</label>
          <input
            type="number"
            value={formData.reschedule_hours_minimum}
            onChange={(e) => setFormData({ ...formData, reschedule_hours_minimum: parseInt(e.target.value) })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A871]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2A2A2A] mb-2">Refill Minimum (days)</label>
          <input
            type="number"
            value={formData.refill_days_minimum}
            onChange={(e) => setFormData({ ...formData, refill_days_minimum: parseInt(e.target.value) })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A871]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2A2A2A] mb-2">Late Cancellation Fee ($)</label>
          <input
            type="number"
            value={formData.late_cancellation_fee}
            onChange={(e) => setFormData({ ...formData, late_cancellation_fee: parseFloat(e.target.value) })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A871]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2A2A2A] mb-2">No-Show Fee ($)</label>
          <input
            type="number"
            value={formData.no_show_fee}
            onChange={(e) => setFormData({ ...formData, no_show_fee: parseFloat(e.target.value) })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A871]"
          />
        </div>

        <div className="flex items-center">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.deposit_required}
              onChange={(e) => setFormData({ ...formData, deposit_required: e.target.checked })}
              className="w-5 h-5 text-[#C9A871] border-gray-300 rounded focus:ring-[#C9A871]"
            />
            <span className="ml-3 text-sm font-medium text-[#2A2A2A]">Deposit Required</span>
          </label>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-[#2A2A2A] mb-2">Cancellation Policy</label>
          <textarea
            value={formData.cancellation_policy}
            onChange={(e) => setFormData({ ...formData, cancellation_policy: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A871]"
          />
        </div>
      </div>

      <div className="pt-6 border-t border-gray-200">
        <button
          onClick={() => onSave(formData)}
          disabled={saving}
          className="px-6 py-3 bg-gradient-to-r from-[#C9A871] to-[#D4AF37] text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}