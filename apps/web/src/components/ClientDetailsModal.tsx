'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { X, Calendar, DollarSign, Clock } from 'lucide-react';
import type { Client, ClientBooking } from '@/types/client';

interface ClientDetailsModalProps {
  client: Client;
  onClose: () => void;
}

export default function ClientDetailsModal({ client, onClose }: ClientDetailsModalProps) {
  const [bookings, setBookings] = useState<ClientBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClientBookings();
  }, [client.id]);

  async function fetchClientBookings(): Promise<void> {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          appointment_date,
          appointment_time,
          total_price,
          status,
          services:service_id(name),
          staff:staff_id(name)
        `)
        .eq('user_id', client.id)
        .order('appointment_date', { ascending: false });

      if (error) throw error;

      const transformedBookings: ClientBooking[] = (data || []).map((booking: any) => ({
        id: booking.id,
        appointment_date: booking.appointment_date,
        appointment_time: booking.appointment_time,
        total_price: booking.total_price,
        status: booking.status,
        service_name: booking.services?.name || 'N/A',
        staff_name: booking.staff?.name || 'N/A',
      }));

      setBookings(transformedBookings);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-AU', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  function formatTime(timeStr: string): string {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  }

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
    }).format(amount);
  }

  function getStatusBadgeClass(status: string): string {
    const baseClasses = 'px-2 py-1 rounded text-xs font-medium';
    switch (status) {
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'confirmed':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'completed':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'cancelled':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  }

  const totalSpent = bookings
    .filter((b) => b.status === 'completed')
    .reduce((sum, b) => sum + b.total_price, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-[#F5F2EF] px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2
              className="text-2xl font-bold text-[#2A2A2A]"
              style={{ fontFamily: 'Cormorant Garamond, serif' }}
            >
              {client.full_name || 'Unnamed Client'}
            </h2>
            <p className="text-sm text-[#3D3D3D]">{client.email}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Client Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-[#FAFAF7] p-4 rounded-lg">
              <p className="text-xs text-[#3D3D3D] mb-1">Phone</p>
              <p className="font-semibold text-[#2A2A2A]">{client.phone || 'N/A'}</p>
            </div>
            <div className="bg-[#FAFAF7] p-4 rounded-lg">
              <p className="text-xs text-[#3D3D3D] mb-1">Role</p>
              <p className="font-semibold text-[#2A2A2A] capitalize">{client.role}</p>
            </div>
            <div className="bg-[#FAFAF7] p-4 rounded-lg">
              <p className="text-xs text-[#3D3D3D] mb-1">VIP Streak</p>
              <p className="font-semibold text-[#2A2A2A]">
                {client.vip_streak} {client.role === 'vip' && '💎'}
              </p>
            </div>
            <div className="bg-[#FAFAF7] p-4 rounded-lg">
              <p className="text-xs text-[#3D3D3D] mb-1">Birthday</p>
              <p className="font-semibold text-[#2A2A2A]">
                {client.birthday
                  ? new Date(client.birthday).toLocaleDateString('en-AU', {
                      day: 'numeric',
                      month: 'short',
                    })
                  : 'N/A'}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-[#C9A871] to-[#D4AF37] text-white p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign size={24} />
                <p className="text-sm opacity-90">Total Spent</p>
              </div>
              <p className="text-3xl font-bold">{formatCurrency(totalSpent)}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Calendar size={24} />
                <p className="text-sm opacity-90">Total Bookings</p>
              </div>
              <p className="text-3xl font-bold">{bookings.length}</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Clock size={24} />
                <p className="text-sm opacity-90">Completed</p>
              </div>
              <p className="text-3xl font-bold">
                {bookings.filter((b) => b.status === 'completed').length}
              </p>
            </div>
          </div>

          {/* Booking History */}
          <div>
            <h3 className="text-xl font-bold text-[#2A2A2A] mb-4">Booking History</h3>

            {loading ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 border-4 border-[#C9A871] border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="mt-4 text-[#3D3D3D]">Loading bookings...</p>
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-8 bg-[#FAFAF7] rounded-lg">
                <p className="text-[#3D3D3D]">No bookings yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="bg-[#FAFAF7] border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Calendar size={16} className="text-[#C9A871]" />
                        <span className="font-semibold text-[#2A2A2A]">
                          {formatDate(booking.appointment_date)}
                        </span>
                        <span className="text-[#3D3D3D]">
                          {formatTime(booking.appointment_time)}
                        </span>
                      </div>
                      <span className={getStatusBadgeClass(booking.status)}>
                        {booking.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <p className="text-[#2A2A2A]">{booking.service_name}</p>
                        <p className="text-[#3D3D3D]">with {booking.staff_name}</p>
                      </div>
                      <p className="font-bold text-[#C9A871]">
                        {formatCurrency(booking.total_price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}