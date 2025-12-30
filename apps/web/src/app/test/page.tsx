'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStaff() {
      try {
        const { data, error } = await supabase
          .from('staff')
          .select('*');

        if (error) throw error;

        setStaff(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchStaff();
  }, []);

  return (
    <div className="min-h-screen bg-gold-50 p-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-serif font-bold text-dark mb-8">
          🧪 Database Connection Test
        </h1>

        {loading && <p className="text-dark-secondary">Loading...</p>}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong>Error:</strong> {error}
          </div>
        )}

        {!loading && !error && staff.length > 0 && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <strong>✅ SUCCESS!</strong> Database connected!
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-serif font-bold text-dark mb-4">
            Staff Members from Database:
          </h2>
          {staff.map((member) => (
            <div key={member.id} className="border-b border-gold-100 py-3">
              <h3 className="font-bold text-dark">{member.name}</h3>
              <p className="text-sm text-dark-secondary">
                Tier: {member.tier} • Multiplier: {member.price_multiplier}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}