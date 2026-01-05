'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import type { TimeOffRequest } from '@/types/time-off';

export default function StaffTimeOffPage() {
  const [requests, setRequests] = useState<TimeOffRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    start_date: '',
    end_date: '',
    reason: '',
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests(): Promise<void> {
    try {
      setLoading(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get staff member by email
      const { data: staffData, error: staffError } = await supabase
        .from('staff')
        .select('id, email')
        .eq('email', user.email)
        .single();

      if (staffError) throw staffError;

      // Get time off requests
      const { data, error } = await supabase
        .from('time_off_requests')
        .select(`
          *,
          staff:staff_id(name, email),
          reviewer:reviewed_by(full_name)
        `)
        .eq('staff_id', staffData.id)
        .order('created_at', { ascending: false });

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

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    
    if (!formData.start_date || !formData.end_date || !formData.reason.trim()) {
      alert('Please fill in all fields');
      return;
    }

    try {
      setSubmitting(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get staff member by email
      const { data: staffData, error: staffError } = await supabase
        .from('staff')
        .select('id')
        .eq('email', user.email)
        .single();

      if (staffError) throw staffError;

      const { error } = await supabase
        .from('time_off_requests')
        .insert({
          staff_id: staffData.id,
          start_date: formData.start_date,
          end_date: formData.end_date,
          reason: formData.reason,
          status: 'pending',
        });

      if (error) throw error;

      alert('Time-off request submitted successfully!');
      setShowForm(false);
      setFormData({ start_date: '', end_date: '', reason: '' });
      fetchRequests();
    } catch (err) {
      console.error('Error submitting request:', err);
      alert('Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'approved':
        return <CheckCircle size={20} className="text-green-600" />;
      case 'declined':
        return <XCircle size={20} className="text-red-600" />;
      default:
        return <Clock size={20} className="text-amber-600" />;
    }
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

  function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
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
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1
              className="text-4xl font-bold text-[#2A2A2A] mb-2"
              style={{ fontFamily: 'Cormorant Garamond, serif' }}
            >
              Time-Off Requests
            </h1>
            <p className="text-[#3D3D3D]">Request time off and view your request history</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#C9A871] to-[#D4AF37] text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium"
          >
            <Calendar size={20} />
            {showForm ? 'Cancel' : 'New Request'}
          </button>
        </div>

        {/* Request Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-2xl font-bold text-[#2A2A2A] mb-6">Request Time Off</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    min={formData.start_date}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A871]"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2A2A2A] mb-2">
                  Reason
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  rows={4}
                  placeholder="Please provide a reason for your time-off request..."
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A871]"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 bg-[#C9A871] text-white rounded-xl hover:bg-[#B89761] transition-all duration-200 font-medium disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 bg-gray-100 text-[#2A2A2A] rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Requests List */}
        <div className="space-y-4">
          {requests.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-[#3D3D3D] text-lg">No time-off requests yet</p>
              <p className="text-sm text-gray-500 mt-2">Click "New Request" to submit your first request</p>
            </div>
          ) : (
            requests.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      {getStatusIcon(request.status)}
                      <span className={getStatusClass(request.status)}>
                        {request.status}
                      </span>
                    </div>
                    <div className="mb-3">
                      <div className="flex items-center gap-2 text-[#2A2A2A] mb-2">
                        <Calendar size={16} className="text-[#C9A871]" />
                        <span className="font-semibold">
                          {formatDate(request.start_date)} - {formatDate(request.end_date)}
                        </span>
                      </div>
                      <p className="text-[#3D3D3D]">{request.reason}</p>
                    </div>
                    {request.status !== 'pending' && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
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
                            Reviewed on {formatDate(request.reviewed_at)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      Submitted {formatDate(request.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}