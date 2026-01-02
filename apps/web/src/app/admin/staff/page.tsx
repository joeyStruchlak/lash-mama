'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, UserPlus, Clock, Calendar, Star, Award, Crown, ChevronRight } from 'lucide-react';
import type { Staff } from '@/types/staff';
import { getTierConfig } from '@/types/staff';

export default function StaffManagementPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchStaff();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      setFilteredStaff(
        staff.filter(
          (s) =>
            s.name.toLowerCase().includes(query) ||
            s.email?.toLowerCase().includes(query)
        )
      );
    } else {
      setFilteredStaff(staff);
    }
  }, [staff, searchQuery]);

  async function fetchStaff(): Promise<void> {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('staff')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;

      setStaff(data || []);
      setFilteredStaff(data || []);
    } catch (err) {
      console.error('Error fetching staff:', err);
      setError('Failed to load staff');
    } finally {
      setLoading(false);
    }
  }

  function getTierIcon(tier: string) {
    switch (tier) {
      case 'master':
        return <Crown size={20} className="text-purple-600" />;
      case 'senior':
        return <Star size={20} className="text-blue-600" />;
      case 'standard':
        return <Award size={20} className="text-green-600" />;
      case 'junior':
        return <Award size={20} className="text-amber-600" />;
      default:
        return <Award size={20} className="text-gray-600" />;
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FAFAF7]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#C9A871] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-[#2A2A2A]">Loading staff...</p>
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
            onClick={fetchStaff}
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
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1
                className="text-4xl font-bold text-[#2A2A2A] mb-2"
                style={{ fontFamily: 'Cormorant Garamond, serif' }}
              >
                Staff Management
              </h1>
              <p className="text-[#3D3D3D]">Manage your team and their schedules</p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-[#C9A871] text-[#C9A871] rounded-xl hover:bg-[#FAFAF7] transition-all duration-200 font-medium">
                <Clock size={20} />
                Request Time Off
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#C9A871] to-[#D4AF37] text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium">
                <UserPlus size={20} />
                Add Staff
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search staff members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C9A871] transition"
            />
          </div>
        </div>

        {/* Staff Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredStaff.map((member) => {
            const tierConfig = getTierConfig(member.tier);
            return (
              <div
                key={member.id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group"
              >
                {/* Gradient Header */}
                <div className={`h-32 bg-gradient-to-r ${tierConfig.color} relative`}>
                  <div className="absolute -bottom-12 left-6">
                    <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-200">
                      {member.avatar_url ? (
                        <img
                          src={member.avatar_url}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-gray-600">
                          {member.name.charAt(0)}
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Tier Badge in Corner */}
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${tierConfig.badgeClass} flex items-center gap-1.5 shadow-sm`}>
                      {getTierIcon(member.tier)}
                      {tierConfig.label.replace(' Artist', '')}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="pt-16 px-6 pb-6">
                  {/* Name & Email */}
                  <div className="mb-4">
                    <h3 className="text-2xl font-bold text-[#2A2A2A] mb-1">{member.name}</h3>
                    <p className="text-sm text-[#3D3D3D]">{member.email || 'No email'}</p>
                  </div>

                  {/* Stats Row */}
                  <div className="flex items-center gap-6 mb-6">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-[#C9A871]" />
                      <span className="text-sm text-[#3D3D3D]">
                        <span className="font-bold text-[#2A2A2A]">24</span> bookings
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star size={16} className="text-[#C9A871]" fill="#C9A871" />
                      <span className="text-sm text-[#3D3D3D]">
                        <span className="font-bold text-[#2A2A2A]">4.9</span> rating
                      </span>
                    </div>
                  </div>

                  {/* Price Multiplier */}
                  <div className="bg-gradient-to-r from-[#FAFAF7] to-[#F5F2EF] rounded-xl p-4 mb-4">
                    <p className="text-xs text-[#3D3D3D] mb-1 font-medium">Price Multiplier</p>
                    <p className="text-3xl font-bold text-[#C9A871]">
                      {member.price_multiplier}x
                    </p>
                  </div>

                  {/* View Details Button */}
                  <button className="w-full flex items-center justify-between px-4 py-3 bg-[#F5F2EF] text-[#2A2A2A] rounded-xl hover:bg-[#C9A871] hover:text-white transition-all duration-200 group-hover:bg-[#C9A871] group-hover:text-white font-medium">
                    <span>View Schedule & Details</span>
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}