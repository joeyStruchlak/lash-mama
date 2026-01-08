'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Copy, Share2, Gift, CheckCircle, Users, Sparkles } from 'lucide-react';

export default function ReferralPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [referralCode, setReferralCode] = useState('');
  const [referralLink, setReferralLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [referralCount, setReferralCount] = useState(0);
  const [completedReferrals, setCompletedReferrals] = useState(0);

  useEffect(() => {
    fetchUserAndReferrals();
  }, []);

  async function fetchUserAndReferrals() {
    try {
      setLoading(true);

      // Get current user
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        router.push('/login');
        return;
      }

      // Get user profile with referral code
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (!profile) return;

      setUser(profile);
      setReferralCode(profile.referral_code || '');
      
      // Build referral link
      const baseUrl = window.location.origin;
      setReferralLink(`${baseUrl}/signup?ref=${profile.referral_code}`);

      // Count referrals
      const { data: referrals } = await supabase
        .from('users')
        .select('id, referral_booking_completed')
        .eq('referred_by', authUser.id);

      setReferralCount(referrals?.length || 0);
      setCompletedReferrals(
        referrals?.filter(r => r.referral_booking_completed).length || 0
      );

    } catch (err) {
      console.error('Error fetching referrals:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Failed to copy link');
    }
  }

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Lash Mama',
          text: 'Get beautiful lashes with Lash Mama! Use my referral link:',
          url: referralLink,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      handleCopy();
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FAFAF7]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#C9A871] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-[#2A2A2A]">Loading...</p>
        </div>
      </div>
    );
  }

  const needsReferralForVIP = user?.vip_streak === 5 && user?.role !== 'vip';

  return (
    <div className="min-h-screen bg-[#FAFAF7] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#C9A871] to-[#D4AF37] flex items-center justify-center">
            <Gift size={40} className="text-white" />
          </div>
          <h1
            className="text-4xl font-bold text-[#2A2A2A] mb-2"
            style={{ fontFamily: 'Cormorant Garamond, serif' }}
          >
            Refer & Earn Rewards
          </h1>
          <p className="text-lg text-[#3D3D3D]">
            Share Lash Mama with friends and unlock exclusive benefits
          </p>
        </div>

        {/* VIP Fast-Track Alert */}
        {needsReferralForVIP && (
          <div className="bg-gradient-to-r from-[#C9A871] to-[#D4AF37] rounded-xl p-6 text-white mb-6">
            <div className="flex items-start gap-4">
              <Sparkles size={32} className="flex-shrink-0" />
              <div>
                <h3 className="text-2xl font-bold mb-2">🎉 Fast-Track to VIP!</h3>
                <p className="mb-2">
                  You're at 5 bookings! Get instant VIP status when your referral completes their first booking.
                </p>
                <p className="text-sm opacity-90">
                  Share your link below and skip the wait! ⬇️
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Referral Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <Users size={32} className="mx-auto text-[#C9A871] mb-2" />
            <p className="text-3xl font-bold text-[#2A2A2A]">{referralCount}</p>
            <p className="text-sm text-[#3D3D3D]">Total Referrals</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <CheckCircle size={32} className="mx-auto text-green-600 mb-2" />
            <p className="text-3xl font-bold text-[#2A2A2A]">{completedReferrals}</p>
            <p className="text-sm text-[#3D3D3D]">Completed Bookings</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <Gift size={32} className="mx-auto text-[#C9A871] mb-2" />
            <p className="text-3xl font-bold text-[#2A2A2A]">
              {needsReferralForVIP ? '1 away!' : 'Active'}
            </p>
            <p className="text-sm text-[#3D3D3D]">Status</p>
          </div>
        </div>

        {/* Referral Link Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-2xl font-bold text-[#2A2A2A] mb-4">Your Referral Link</h2>
          
          <div className="flex gap-3 mb-4">
            <input
              type="text"
              value={referralLink}
              readOnly
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-[#2A2A2A] font-mono text-sm"
            />
            <button
              onClick={handleCopy}
              className="px-6 py-3 bg-[#C9A871] text-white rounded-lg hover:bg-[#B89761] transition font-medium flex items-center gap-2"
            >
              {copied ? (
                <>
                  <CheckCircle size={20} />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={20} />
                  Copy
                </>
              )}
            </button>
          </div>

          <button
            onClick={handleShare}
            className="w-full px-6 py-3 bg-gradient-to-r from-[#C9A871] to-[#D4AF37] text-white rounded-xl hover:shadow-lg transition font-medium flex items-center justify-center gap-2"
          >
            <Share2 size={20} />
            Share Link
          </button>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-2xl font-bold text-[#2A2A2A] mb-4">How It Works</h2>
          
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-[#C9A871] text-white flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[#2A2A2A] mb-1">Share Your Link</h3>
                <p className="text-sm text-[#3D3D3D]">
                  Send your unique referral link to friends via text, email, or social media
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-[#C9A871] text-white flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[#2A2A2A] mb-1">They Sign Up</h3>
                <p className="text-sm text-[#3D3D3D]">
                  Your friend creates an account using your referral link
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-[#C9A871] text-white flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[#2A2A2A] mb-1">They Book & Complete</h3>
                <p className="text-sm text-[#3D3D3D]">
                  When they complete their first appointment, you both get rewards!
                </p>
              </div>
            </div>

            {needsReferralForVIP && (
              <div className="mt-6 p-4 bg-gradient-to-r from-[#C9A871]/10 to-[#D4AF37]/10 rounded-lg border-2 border-[#C9A871]">
                <h3 className="font-bold text-[#C9A871] mb-1">✨ Your Special Bonus</h3>
                <p className="text-sm text-[#2A2A2A]">
                  Since you're at 5 bookings, your first successful referral instantly upgrades you to VIP! 
                  Skip to 10 and unlock all premium benefits immediately. 🎉
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-[#C9A871] hover:text-[#B89761] font-medium transition"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}