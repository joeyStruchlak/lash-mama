'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Calendar, CheckCircle, XCircle, Clock, User } from 'lucide-react';
import type { TimeOffRequest } from '@/types/time-off';

export default function AdminTimeOffPage() {
  const [requests, setRequests] = useState<TimeOffRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'declined'>('pending');
  const [selectedRequest, setSelectedRequest] = useState<TimeOffRequest | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  async function fetchRequests(): Promise<void> {
    try {
      setLoading(true);

      let query = supabase
        .from('time_off_requests')
        .select(`
          *,
          staff:staff_id(name, email),
          reviewer:reviewed_by(full_name)
        `)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;

      const transformedData = (data || []).map((req: any) => ({
        ...req,
        staff_name: req.staff?.name,
        staff_email: req.staff?.email,
        reviewed_by_name: req.reviewer?.full_name,
      }));

      setRequests(transformedData);
    } catch (err) {
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleReview(requestId: string, status: 'approved' | 'declined'): Promise<void> {
    try {
      setReviewing(true);

      // Get current admin user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('time_off_requests')
        .update({
          status,
          reviewed_by: user.id,
          review_notes: reviewNotes.trim() || null,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (error) throw error;

      alert(`Request ${status} successfully!`);
      setSelectedRequest(null);
      setReviewNotes('');
      fetchRequests();
    } catch (err) {
      console.error('Error reviewing request:', err);
      alert('Failed to review request');
    } finally {
      setReviewing(false);
    }
  }

  function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  function getStatusClass(status: string): string {
    const baseClasses = 'px-3 py-1 rounded-full text-xs font-medium';
    switch (status) {
      case 'approved':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'declined':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-amber-100 text-amber-800`;
    }
  }

  function calculateDays(start: string, end: string): number {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FAFAF7]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#C9A871] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-[#2A2A2A]">Loading requests...</p>
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
            Time-Off Requests
          </h1>
          <p className="text-[#3D3D3D]">Review and approve staff time-off requests</p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex gap-2">
            {(['all', 'pending', 'approved', 'declined'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 capitalize ${
                  filter === status
                    ? 'bg-[#C9A871] text-white'
                    : 'bg-gray-100 text-[#3D3D3D] hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
          <div className="mt-4 text-sm text-[#3D3D3D]">
            Showing <span className="font-semibold">{requests.length}</span> request{requests.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Requests Grid */}
        {requests.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Clock size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-[#3D3D3D] text-lg">No {filter !== 'all' ? filter : ''} requests</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {requests.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#F5F2EF] flex items-center justify-center">
                      <User size={24} className="text-[#C9A871]" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#2A2A2A]">{request.staff_name}</p>
                      <p className="text-sm text-[#3D3D3D]">{request.staff_email}</p>
                    </div>
                  </div>
                  <span className={getStatusClass(request.status)}>
                    {request.status}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-[#C9A871]" />
                    <span className="text-[#2A2A2A] font-medium">
                      {formatDate(request.start_date)} - {formatDate(request.end_date)}
                    </span>
                    <span className="text-sm text-[#3D3D3D]">
                      ({calculateDays(request.start_date, request.end_date)} day{calculateDays(request.start_date, request.end_date) !== 1 ? 's' : ''})
                    </span>
                  </div>
                  <div className="bg-[#FAFAF7] rounded-lg p-3">
                    <p className="text-sm font-medium text-[#2A2A2A] mb-1">Reason:</p>
                    <p className="text-sm text-[#3D3D3D]">{request.reason}</p>
                  </div>
                </div>

                {request.status === 'pending' ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedRequest(request)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-all duration-200 font-medium"
                    >
                      <CheckCircle size={16} />
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        setSelectedRequest(request);
                        setReviewNotes('');
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-all duration-200 font-medium"
                    >
                      <XCircle size={16} />
                      Decline
                    </button>
                  </div>
                ) : (
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-sm text-[#3D3D3D]">
                      <span className="font-medium">Reviewed by:</span> {request.reviewed_by_name || 'Admin'}
                    </p>
                    {request.review_notes && (
                      <p className="text-sm text-[#3D3D3D] mt-1">
                        <span className="font-medium">Note:</span> {request.review_notes}
                      </p>
                    )}
                    {request.reviewed_at && (
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(request.reviewed_at)}
                      </p>
                    )}
                  </div>
                )}

                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    Submitted {formatDate(request.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Review Modal */}
        {selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-[#2A2A2A] mb-4">
                Review Request
              </h2>
              <div className="mb-4">
                <p className="text-sm text-[#3D3D3D] mb-2">
                  <span className="font-medium">Staff:</span> {selectedRequest.staff_name}
                </p>
                <p className="text-sm text-[#3D3D3D] mb-2">
                  <span className="font-medium">Dates:</span>{' '}
                  {formatDate(selectedRequest.start_date)} - {formatDate(selectedRequest.end_date)}
                </p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#2A2A2A] mb-2">
                  Review Notes (Optional)
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={3}
                  placeholder="Add any notes about this decision..."
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A871]"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleReview(selectedRequest.id, 'approved')}
                  disabled={reviewing}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 font-medium disabled:opacity-50"
                >
                  {reviewing ? 'Processing...' : 'Approve'}
                </button>
                <button
                  onClick={() => handleReview(selectedRequest.id, 'declined')}
                  disabled={reviewing}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 font-medium disabled:opacity-50"
                >
                  {reviewing ? 'Processing...' : 'Decline'}
                </button>
                <button
                  onClick={() => {
                    setSelectedRequest(null);
                    setReviewNotes('');
                  }}
                  className="px-4 py-3 bg-gray-100 text-[#2A2A2A] rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}