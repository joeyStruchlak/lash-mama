'use client';

'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, Eye } from 'lucide-react';
import ClientDetailsModal from '@/components/ClientDetailsModal';
import type { Client } from '@/types/client';

export default function ClientManagementPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      setFilteredClients(
        clients.filter(
          (c) =>
            c.full_name?.toLowerCase().includes(query) ||
            c.email.toLowerCase().includes(query) ||
            c.phone?.toLowerCase().includes(query)
        )
      );
    } else {
      setFilteredClients(clients);
    }
  }, [clients, searchQuery]);

  async function fetchClients(): Promise<void> {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setClients(data || []);
      setFilteredClients(data || []);
    } catch (err) {
      console.error('Error fetching clients:', err);
      setError('Failed to load clients');
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateStr: string | null): string {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  function getRoleBadgeClass(role: string): string {
    const baseClasses = 'px-3 py-1 rounded-full text-xs font-medium';
    switch (role) {
      case 'vip':
        return `${baseClasses} bg-purple-100 text-purple-800`;
      case 'admin':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'manager':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'staff':
        return `${baseClasses} bg-green-100 text-green-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FAFAF7]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#C9A871] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-[#2A2A2A]">Loading clients...</p>
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
            onClick={fetchClients}
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
          <h1
            className="text-4xl font-bold text-[#2A2A2A] mb-2"
            style={{ fontFamily: 'Cormorant Garamond, serif' }}
          >
            Client Management
          </h1>
          <p className="text-[#3D3D3D]">View and manage all client profiles</p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A871]"
            />
          </div>
          <div className="mt-4 text-sm text-[#3D3D3D]">
            Showing <span className="font-semibold">{filteredClients.length}</span> of{' '}
            <span className="font-semibold">{clients.length}</span> clients
          </div>
        </div>

        {/* Clients Table */}
        {filteredClients.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-[#3D3D3D] text-lg">No clients found</p>
            <p className="text-sm text-gray-500 mt-2">Try adjusting your search query</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F5F2EF] border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#2A2A2A]">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#2A2A2A]">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#2A2A2A]">
                      Phone
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#2A2A2A]">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#2A2A2A]">
                      VIP Streak
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#2A2A2A]">
                      Birthday
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#2A2A2A]">
                      Joined
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#2A2A2A]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredClients.map((client) => (
                    <tr key={client.id} className="hover:bg-[#FAFAF7] transition">
                      <td className="px-6 py-4">
                        <p className="font-medium text-[#2A2A2A]">
                          {client.full_name || 'N/A'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-[#3D3D3D]">{client.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-[#3D3D3D]">{client.phone || 'N/A'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={getRoleBadgeClass(client.role)}>{client.role}</span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-[#2A2A2A]">
                          {client.vip_streak}{' '}
                          {client.role === 'vip' && <span className="text-purple-600">💎</span>}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-[#3D3D3D]">{formatDate(client.birthday)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-[#3D3D3D]">{formatDate(client.created_at)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedClient(client);
                              setShowModal(true);
                            }}
                            className="p-2 text-[#C9A871] hover:bg-[#F5F2EF] rounded transition"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
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

      {/* Client Details Modal */}
      {showModal && selectedClient && (
        <ClientDetailsModal
          client={selectedClient}
          onClose={() => {
            setShowModal(false);
            setSelectedClient(null);
          }}
        />
      )}
    </div>
  );
}