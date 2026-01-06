'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Repeat, Calendar, User, X, Plus, Trash2 } from 'lucide-react';
import type { RecurringBooking, RecurringBookingFormData } from '@/types/recurring-booking';

export default function AdminRecurringBookingsPage() {
  const [recurringBookings, setRecurringBookings] = useState<RecurringBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [creating, setCreating] = useState(false);

  const [formData, setFormData] = useState<RecurringBookingFormData>({
    user_id: '',
    service_id: '',
    staff_id: '',
    start_date: '',
    frequency: 'bi-weekly',
    duration: '12months',
    appointment_time: '',
  });

  useEffect(() => {
    fetchRecurringBookings();
    fetchDropdownData();
  }, []);

  async function fetchRecurringBookings(): Promise<void> {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('recurring_bookings')
        .select(`
          *,
          users:user_id(full_name, email),
          services:service_id(name),
          staff:staff_id(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setRecurringBookings(data || []);
    } catch (err) {
      console.error('Error fetching recurring bookings:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchDropdownData(): Promise<void> {
    try {
      const [clientsRes, servicesRes, staffRes] = await Promise.all([
        supabase.from('users').select('id, full_name, email').order('full_name'),
        supabase.from('services').select('id, name, base_price').eq('is_active', true).order('name'),
        supabase.from('staff').select('id, name').eq('is_active', true).order('name'),
      ]);

      setClients(clientsRes.data || []);
      setServices(servicesRes.data || []);
      setStaff(staffRes.data || []);
    } catch (err) {
      console.error('Error fetching dropdown data:', err);
    }
  }

  async function handleCreateRecurring(e: React.FormEvent): Promise<void> {
    e.preventDefault();

    if (!formData.user_id || !formData.service_id || !formData.staff_id || !formData.start_date || !formData.appointment_time) {
      alert('Please fill in all fields');
      return;
    }

    try {
      setCreating(true);

      // Calculate end date based on duration
      let endDate: string | null = null;
      if (formData.duration !== 'indefinite') {
        const start = new Date(formData.start_date);
        const months = formData.duration === '6months' ? 6 : 12;
        const end = new Date(start);
        end.setMonth(end.getMonth() + months);
        endDate = end.toISOString().split('T')[0];
      }

      // Get current admin user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create recurring booking
      const { data: recurringData, error: recurringError } = await supabase
        .from('recurring_bookings')
        .insert({
          user_id: formData.user_id,
          service_id: formData.service_id,
          staff_id: formData.staff_id,
          start_date: formData.start_date,
          end_date: endDate,
          frequency: formData.frequency,
          appointment_time: formData.appointment_time,
          created_by: user.id,
          is_active: true,
        })
        .select()
        .single();

      if (recurringError) throw recurringError;

      // Generate appointments
      await generateAppointments(recurringData.id);

      alert('Recurring booking created successfully!');
      setShowForm(false);
      setFormData({
        user_id: '',
        service_id: '',
        staff_id: '',
        start_date: '',
        frequency: 'bi-weekly',
        duration: '12months',
        appointment_time: '',
      });
      fetchRecurringBookings();
    } catch (err) {
      console.error('Error creating recurring booking:', err);
      alert('Failed to create recurring booking');
    } finally {
      setCreating(false);
    }
  }

  async function generateAppointments(recurringBookingId: string): Promise<void> {
    try {
      // Get recurring booking details
      const { data: recurring, error: recurringError } = await supabase
        .from('recurring_bookings')
        .select('*')
        .eq('id', recurringBookingId)
        .single();

      if (recurringError || !recurring) throw new Error('Recurring booking not found');

      // Get service price for total_price
      const { data: service } = await supabase
        .from('services')
        .select('base_price')
        .eq('id', recurring.service_id)
        .single();

      const appointments = [];
      let currentDate = new Date(recurring.start_date);
      const endDate = recurring.end_date ? new Date(recurring.end_date) : null;
      let count = 0;
      const maxAppointments = 104; // Max 2 years worth (safety limit)

      while ((!endDate || currentDate <= endDate) && count < maxAppointments) {
        appointments.push({
          user_id: recurring.user_id,
          service_id: recurring.service_id,
          staff_id: recurring.staff_id,
          appointment_date: currentDate.toISOString().split('T')[0],
          appointment_time: recurring.appointment_time,
          total_price: service?.base_price || 0,
          status: 'confirmed', // No deposit needed, auto-confirmed
          recurring_booking_id: recurringBookingId,
          can_reschedule: true,
        });

        // Increment date based on frequency
        switch (recurring.frequency) {
          case 'weekly':
            currentDate.setDate(currentDate.getDate() + 7);
            break;
          case 'bi-weekly':
            currentDate.setDate(currentDate.getDate() + 14);
            break;
          case 'monthly':
            currentDate.setMonth(currentDate.getMonth() + 1);
            break;
        }

        count++;
      }

      // Insert all appointments
      const { error: insertError } = await supabase
        .from('appointments')
        .insert(appointments);

      if (insertError) throw insertError;

      // Update total count
      await supabase
        .from('recurring_bookings')
        .update({ total_appointments_generated: appointments.length })
        .eq('id', recurringBookingId);

    } catch (err) {
      console.error('Error generating appointments:', err);
      throw err;
    }
  }

  async function handleToggleActive(id: string, currentStatus: boolean): Promise<void> {
    try {
      const { error } = await supabase
        .from('recurring_bookings')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      fetchRecurringBookings();
    } catch (err) {
      console.error('Error toggling status:', err);
      alert('Failed to update status');
    }
  }

  async function handleDelete(id: string): Promise<void> {
    if (!confirm('Delete this recurring booking? This will NOT delete existing appointments.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('recurring_bookings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      fetchRecurringBookings();
    } catch (err) {
      console.error('Error deleting recurring booking:', err);
      alert('Failed to delete');
    }
  }

  function formatFrequency(frequency: string): string {
    const map: { [key: string]: string } = {
      weekly: 'Weekly',
      'bi-weekly': 'Bi-Weekly',
      monthly: 'Monthly',
    };
    return map[frequency] || frequency;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FAFAF7]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#C9A871] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-[#2A2A2A]">Loading recurring bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1
              className="text-4xl font-bold text-[#2A2A2A] mb-2"
              style={{ fontFamily: 'Cormorant Garamond, serif' }}
            >
              Recurring Bookings
            </h1>
            <p className="text-[#3D3D3D]">Create and manage recurring appointment series</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#C9A871] to-[#D4AF37] text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium"
          >
            {showForm ? <X size={20} /> : <Plus size={20} />}
            {showForm ? 'Cancel' : 'New Recurring Booking'}
          </button>
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-2xl font-bold text-[#2A2A2A] mb-6">Create Recurring Series</h2>
            <form onSubmit={handleCreateRecurring} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#2A2A2A] mb-2">
                    Client
                  </label>
                  <select
                    value={formData.user_id}
                    onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A871]"
                    required
                  >
                    <option value="">Select client...</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.full_name} ({client.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2A2A2A] mb-2">
                    Service
                  </label>
                  <select
                    value={formData.service_id}
                    onChange={(e) => setFormData({ ...formData, service_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A871]"
                    required
                  >
                    <option value="">Select service...</option>
                    {services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name} (${service.base_price})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2A2A2A] mb-2">
                    Staff Member
                  </label>
                  <select
                    value={formData.staff_id}
                    onChange={(e) => setFormData({ ...formData, staff_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A871]"
                    required
                  >
                    <option value="">Select staff...</option>
                    {staff.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2A2A2A] mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A871]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2A2A2A] mb-2">
                    Appointment Time
                  </label>
                  <input
                    type="time"
                    value={formData.appointment_time}
                    onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A871]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2A2A2A] mb-2">
                    Frequency
                  </label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A871]"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="bi-weekly">Bi-Weekly (Every 2 weeks)</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2A2A2A] mb-2">
                    Duration
                  </label>
                  <select
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A871]"
                  >
                    <option value="6months">6 Months</option>
                    <option value="12months">12 Months</option>
                    <option value="indefinite">Indefinite</option>
                  </select>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>Note:</strong> Recurring bookings do NOT require a deposit. All appointments will be auto-confirmed.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={creating}
                  className="px-6 py-3 bg-[#C9A871] text-white rounded-xl hover:bg-[#B89761] transition font-medium disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Recurring Series'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 bg-gray-100 text-[#2A2A2A] rounded-xl hover:bg-gray-200 transition font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Recurring Bookings List */}
        {recurringBookings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Repeat size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-[#3D3D3D] text-lg">No recurring bookings yet</p>
            <p className="text-sm text-gray-500 mt-2">Create a recurring series to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recurringBookings.map((booking: any) => (
              <div
                key={booking.id}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Repeat size={20} className="text-[#C9A871]" />
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        booking.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {booking.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-[#3D3D3D] mb-1">Client</p>
                        <p className="font-medium text-[#2A2A2A]">{booking.users?.full_name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#3D3D3D] mb-1">Service</p>
                        <p className="font-medium text-[#2A2A2A]">{booking.services?.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#3D3D3D] mb-1">Staff</p>
                        <p className="font-medium text-[#2A2A2A]">{booking.staff?.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#3D3D3D] mb-1">Time</p>
                        <p className="font-medium text-[#2A2A2A]">{booking.appointment_time}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-[#3D3D3D] mb-1">Frequency</p>
                        <p className="text-sm text-[#2A2A2A]">{formatFrequency(booking.frequency)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#3D3D3D] mb-1">Start Date</p>
                        <p className="text-sm text-[#2A2A2A]">
                          {new Date(booking.start_date).toLocaleDateString('en-AU')}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[#3D3D3D] mb-1">End Date</p>
                        <p className="text-sm text-[#2A2A2A]">
                          {booking.end_date
                            ? new Date(booking.end_date).toLocaleDateString('en-AU')
                            : 'Indefinite'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[#3D3D3D] mb-1">Appointments</p>
                        <p className="text-sm font-bold text-[#C9A871]">
                          {booking.total_appointments_generated} generated
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleActive(booking.id, booking.is_active)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        booking.is_active
                          ? 'bg-gray-100 text-[#2A2A2A] hover:bg-gray-200'
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                    >
                      {booking.is_active ? 'Pause' : 'Resume'}
                    </button>
                    <button
                      onClick={() => handleDelete(booking.id)}
                      className="px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition text-sm font-medium"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}