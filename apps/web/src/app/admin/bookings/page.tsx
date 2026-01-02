'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// Raw Supabase Response Type
interface SupabaseBookingResponse {
  id: string;
  appointment_date: string;
  appointment_time: string;
  total_price: number;
  discount_applied: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  created_at: string;
  users: {
    full_name: string;
    email: string;
    phone: string | null;
  }[];
  services: {
    name: string;
    category: string;
  }[];
  staff: {
    name: string;
  }[];
}

// Clean Display Type
interface BookingWithDetails {
  id: string;
  appointment_date: string;
  appointment_time: string;
  total_price: number;
  discount_applied: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  created_at: string;
  users: {
    full_name: string;
    email: string;
    phone: string | null;
  } | null;
  services: {
    name: string;
    category: string;
  } | null;
  staff: {
    name: string;
  } | null;
}

type FilterStatus = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled';

export default function BookingManagementPage() {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all bookings
  useEffect(() => {
    fetchBookings();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = bookings;

    // Filter by status
    if (filterStatus !== 'all') {
      result = result.filter(b => b.status === filterStatus);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(b => 
        b.users?.full_name?.toLowerCase().includes(query) ||
        b.users?.email?.toLowerCase().includes(query) ||
        b.services?.name?.toLowerCase().includes(query)
      );
    }

    setFilteredBookings(result);
  }, [bookings, filterStatus, searchQuery]);

async function fetchBookings(): Promise<void> {
  try {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('appointments')
      .select(`
        id,
        appointment_date,
        appointment_time,
        total_price,
        discount_applied,
        status,
        created_at,
        user_id,
        service_id,
        staff_id,
        users:user_id(full_name, email, phone),
        services:service_id(name, category),
        staff:staff_id(name)
      `)
      .order('appointment_date', { ascending: false })
      .order('appointment_time', { ascending: false });

    if (fetchError) throw fetchError;

    console.log('Raw data from Supabase:', data); // Debug log

    // Transform array responses to single objects
    const transformedData: BookingWithDetails[] = (data || []).map((booking: any) => ({
      id: booking.id,
      appointment_date: booking.appointment_date,
      appointment_time: booking.appointment_time,
      total_price: booking.total_price,
      discount_applied: booking.discount_applied,
      status: booking.status,
      created_at: booking.created_at,
      users: Array.isArray(booking.users) ? booking.users[0] : booking.users,
      services: Array.isArray(booking.services) ? booking.services[0] : booking.services,
      staff: Array.isArray(booking.staff) ? booking.staff[0] : booking.staff,
    }));

    console.log('Transformed data:', transformedData); // Debug log

    setBookings(transformedData);
    setFilteredBookings(transformedData);
  } catch (err) {
    console.error('Error fetching bookings:', err);
    setError('Failed to load bookings');
  } finally {
    setLoading(false);
  }
}

  async function updateBookingStatus(bookingId: string, newStatus: 'confirmed' | 'cancelled'): Promise<void> {
    try {
      const { error: updateError } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', bookingId);

      if (updateError) throw updateError;

      // Update local state
      setBookings(prev => prev.map(b => 
        b.id === bookingId ? { ...b, status: newStatus } : b
      ));
    } catch (err) {
      console.error('Error updating booking:', err);
      alert('Failed to update booking status');
    }
  }

  function getStatusBadgeClass(status: string): string {
    const baseClasses = 'px-3 py-1 rounded-full text-xs font-medium';
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

  function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-AU', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
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
      currency: 'AUD'
    }).format(amount);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FAFAF7]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#C9A871] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-[#2A2A2A]">Loading bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FAFAF7]">
        <div className="text-center">
          <p className="text-red-600 text-lg">{error}</p>
          <button 
            onClick={fetchBookings}
            className="mt-4 px-6 py-2 bg-[#C9A871] text-white rounded-lg hover:bg-[#B89761] transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#2A2A2A] mb-2" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Booking Management
          </h1>
          <p className="text-[#3D3D3D]">Manage all appointments and reservations</p>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by client name, email, or service..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A871]"
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-2 flex-wrap">
              {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as FilterStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition capitalize ${
                    filterStatus === status
                      ? 'bg-[#C9A871] text-white'
                      : 'bg-gray-100 text-[#3D3D3D] hover:bg-gray-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-[#3D3D3D]">
            Showing <span className="font-semibold">{filteredBookings.length}</span> of{' '}
            <span className="font-semibold">{bookings.length}</span> bookings
          </div>
        </div>

        {/* Bookings Table */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-[#3D3D3D] text-lg">No bookings found</p>
            <p className="text-sm text-gray-500 mt-2">Try adjusting your filters or search query</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F5F2EF] border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#2A2A2A]">Client</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#2A2A2A]">Service</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#2A2A2A]">Staff</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#2A2A2A]">Date & Time</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#2A2A2A]">Price</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#2A2A2A]">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#2A2A2A]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-[#FAFAF7] transition">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-[#2A2A2A]">{booking.users?.full_name || 'N/A'}</p>
                          <p className="text-sm text-[#3D3D3D]">{booking.users?.email || 'N/A'}</p>
                          {booking.users?.phone && (
                            <p className="text-xs text-gray-500">{booking.users.phone}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-[#2A2A2A]">{booking.services?.name || 'N/A'}</p>
                          <p className="text-sm text-[#3D3D3D]">{booking.services?.category || 'N/A'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-[#2A2A2A]">{booking.staff?.name || 'N/A'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-[#2A2A2A]">{formatDate(booking.appointment_date)}</p>
                          <p className="text-sm text-[#3D3D3D]">{formatTime(booking.appointment_time)}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-[#2A2A2A]">{formatCurrency(booking.total_price)}</p>
                          {booking.discount_applied > 0 && (
                            <p className="text-xs text-green-600">-{formatCurrency(booking.discount_applied)} discount</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={getStatusBadgeClass(booking.status)}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {booking.status === 'pending' && (
                            <>
                              <button
                                onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                                className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200 transition"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                                className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200 transition"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                          {booking.status === 'confirmed' && (
                            <button
                              onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                              className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200 transition"
                            >
                              Cancel
                            </button>
                          )}
                          {(booking.status === 'completed' || booking.status === 'cancelled') && (
                            <span className="text-xs text-gray-400">No actions</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}