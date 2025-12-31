'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from './Card';

interface UserProfile {
  vip_streak: number;
  role: string;
}

export function VIPProgressBanner() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Get current user
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user);
        
        // Get user profile
        supabase
          .from('users')
          .select('vip_streak, role')
          .eq('id', user.id)
          .single()
          .then(({ data }) => {
            if (data) setProfile(data);
          });
      }
    });
  }, []);

  // Don't show banner if already VIP or admin
  if (!profile || profile.role === 'vip' || profile.role === 'admin') {
    return null;
  }

  const bookingsNeeded = 10 - profile.vip_streak;
  const progressPercentage = (profile.vip_streak / 10) * 100;

  return (
    <Card className="p-6 bg-gradient-to-r from-gold-50 to-gold-100 border-2 border-gold-300">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-serif font-bold text-dark mb-1">
            Become a VIP! 💎
          </h3>
          <p className="text-dark-secondary">
            {bookingsNeeded === 10 
              ? 'Book your first appointment to start your VIP journey!'
              : `Only ${bookingsNeeded} more ${bookingsNeeded === 1 ? 'booking' : 'bookings'} to VIP status!`
            }
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-gold-600">
            {profile.vip_streak}/10
          </p>
          <p className="text-sm text-dark-secondary">bookings</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gold-200 rounded-full h-3">
        <div
          className="bg-gold-600 h-3 rounded-full transition-all duration-500"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* VIP Benefits Preview */}
      <div className="mt-4 text-sm text-dark-secondary">
        <p className="font-bold text-dark mb-2">VIP Benefits:</p>
        <ul className="space-y-1">
          <li>💰 $10 off every refill</li>
          <li>🎂 $20 off birthday refills</li>
          <li>✨ $30 off full sets</li>
          <li>🎁 $100 year-end gift pack</li>
        </ul>
      </div>
    </Card>
  );
}