'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookingWizard } from './BookingWizard';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export default function BookPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error('Auth error:', error);
          router.push('/login');
          return;
        }

        if (!user) {
          router.push('/login');
          return;
        }

        setUser(user);
      } catch (error) {
        console.error('Unexpected error:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gold-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gold-600 border-r-transparent mb-4"></div>
          <p className="text-xl text-dark-secondary">Loading booking...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <BookingWizard />;
}