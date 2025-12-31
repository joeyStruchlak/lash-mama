'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookingWizard } from './BookingWizard';
import { supabase } from '@/lib/supabase';

export default function BookPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        // Not logged in - redirect to login
        router.push('/login');
      } else {
        setUser(user);
        setLoading(false);
      }
    });
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gold-50 py-12 flex items-center justify-center">
        <p className="text-xl text-dark-secondary">Loading...</p>
      </div>
    );
  }

  return <BookingWizard />;
}