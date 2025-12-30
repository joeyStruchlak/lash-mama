'use client';

import { useState } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';

export default function VIPPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'rewards' | 'notes'>('overview');

  // Mock user data
  const user = {
    name: 'Sarah Johnson',
    tier: 'platinum',
    points: 2450,
    pointsToNextTier: 550,
    bookingsCount: 24,
    memberSince: 'January 2023',
    totalSpent: 4850,
  };

  const tiers = [
    { name: 'Bronze', minPoints: 0, color: 'text-yellow-700', bgColor: 'bg-yellow-50' },
    { name: 'Silver', minPoints: 500, color: 'text-gray-400', bgColor: 'bg-gray-50' },
    { name: 'Gold', minPoints: 1000, color: 'text-yellow-500', bgColor: 'bg-yellow-50' },
    { name: 'Platinum', minPoints: 2000, color: 'text-blue-400', bgColor: 'bg-blue-50' },
    { name: 'Diamond', minPoints: 3000, color: 'text-pink-500', bgColor: 'bg-pink-50' },
  ];

  const achievements = [
    { name: 'First Booking', date: 'Jan 15, 2023' },
    { name: '10 Bookings', date: 'Apr 22, 2023' },
    { name: 'VIP Member', date: 'Jun 10, 2023' },
    { name: 'Loyal Client', date: 'Aug 30, 2023' },
    { name: 'Platinum Tier', date: 'Nov 5, 2023' },
  ];

  const bookingHistory = [
    { date: 'Dec 20, 2024', service: 'Mega Volume Full Set', artist: 'Purni', price: '$250' },
    { date: 'Dec 10, 2024', service: 'Volume Refills', artist: 'Nikki & Beau', price: '$70' },
    { date: 'Nov 28, 2024', service: 'Natural/Hybrid Full Set', artist: 'Natali', price: '$150' },
    { date: 'Nov 15, 2024', service: 'Mega Volume Full Set', artist: 'Purni', price: '$250' },
  ];

  const rewards = [
    { name: '$50 Service Credit', points: 500, available: true },
    { name: 'Free Refill Service', points: 1000, available: true },
    { name: 'Premium Makeup Session', points: 1500, available: false },
    { name: 'Exclusive VIP Event Invite', points: 2000, available: false },
  ];

  return (
    <div className="min-h-screen bg-gold-50 py-12">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-serif font-bold text-dark mb-4">
            VIP Loyalty Program
          </h1>
          <p className="text-xl text-dark-secondary">
            Welcome, {user.name}! You're on the {user.tier} tier
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="text-center p-6">
            <p className="text-dark-secondary mb-2">Current Tier</p>
            <h3 className="text-3xl font-serif font-bold text-gold-600 capitalize">
              {user.tier}
            </h3>
          </Card>
          <Card className="text-center p-6">
            <p className="text-dark-secondary mb-2">VIP Points</p>
            <h3 className="text-3xl font-serif font-bold text-dark">
              {user.points}
            </h3>
          </Card>
          <Card className="text-center p-6">
            <p className="text-dark-secondary mb-2">Total Bookings</p>
            <h3 className="text-3xl font-serif font-bold text-dark">
              {user.bookingsCount}
            </h3>
          </Card>
          <Card className="text-center p-6">
            <p className="text-dark-secondary mb-2">Total Spent</p>
            <h3 className="text-3xl font-serif font-bold text-gold-600">
              ${user.totalSpent}
            </h3>
          </Card>
        </div>

        {/* Tier Progress */}
        <Card className="mb-12 p-8">
          <h2 className="text-2xl font-serif font-bold text-dark mb-4">
            Progress to Next Tier
          </h2>
          <div className="w-full bg-gold-100 rounded-full h-4 mb-4">
            <div
              className="bg-gold-600 h-4 rounded-full transition-all"
              style={{ width: `${(user.points / (user.points + user.pointsToNextTier)) * 100}%` }}
            />
          </div>
          <p className="text-dark-secondary">
            {user.pointsToNextTier} points until Diamond tier
          </p>
        </Card>

        {/* Tabs */}
        <div className="mb-8 flex gap-4 border-b border-gold-200">
          {['overview', 'history', 'rewards', 'notes'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-4 font-serif font-bold transition-colors capitalize ${
                activeTab === tab
                  ? 'text-gold-600 border-b-2 border-gold-600'
                  : 'text-dark-secondary hover:text-dark'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Achievements */}
            <Card className="p-6">
              <h3 className="text-2xl font-serif font-bold text-dark mb-6">
                Achievements
              </h3>
              <div className="space-y-3">
                {achievements.map((achievement) => (
                  <div key={achievement.name} className="flex items-center gap-3 pb-3 border-b border-gold-100">
                    <div className="text-2xl">⭐</div>
                    <div>
                      <p className="font-serif font-bold text-dark">
                        {achievement.name}
                      </p>
                      <p className="text-sm text-dark-secondary">{achievement.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Tier Info */}
            <Card className="p-6">
              <h3 className="text-2xl font-serif font-bold text-dark mb-6">
                VIP Tiers
              </h3>
              <div className="space-y-3">
                {tiers.map((tier) => (
                  <div
                    key={tier.name}
                    className={`p-3 rounded-lg ${tier.bgColor}`}
                  >
                    <p className={`font-serif font-bold ${tier.color}`}>
                      {tier.name} - {tier.minPoints}+ points
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'history' && (
          <Card className="p-6">
            <h3 className="text-2xl font-serif font-bold text-dark mb-6">
              Booking History
            </h3>
            <div className="space-y-4">
              {bookingHistory.map((booking) => (
                <div
                  key={booking.date}
                  className="flex justify-between items-center p-4 border-b border-gold-100"
                >
                  <div>
                    <p className="font-serif font-bold text-dark">
                      {booking.service}
                    </p>
                    <p className="text-sm text-dark-secondary">
                      {booking.date} • {booking.artist}
                    </p>
                  </div>
                  <p className="text-xl font-bold text-gold-600">
                    {booking.price}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === 'rewards' && (
          <Card className="p-6">
            <h3 className="text-2xl font-serif font-bold text-dark mb-6">
              Available Rewards
            </h3>
            <div className="space-y-4">
              {rewards.map((reward) => (
                <div
                  key={reward.name}
                  className="flex justify-between items-center p-4 border-2 border-gold-100 rounded-lg"
                >
                  <div>
                    <p className="font-serif font-bold text-dark">
                      {reward.name}
                    </p>
                    <p className="text-sm text-dark-secondary">
                      {reward.points} points
                    </p>
                  </div>
                  <Button
                    variant={reward.available ? 'primary' : 'outline'}
                    disabled={!reward.available}
                  >
                    {reward.available ? 'Redeem' : 'Locked'}
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === 'notes' && (
          <Card className="p-6">
            <h3 className="text-2xl font-serif font-bold text-dark mb-6">
              My Notes
            </h3>
            <div className="space-y-4">
              <textarea
                placeholder="Add notes about your beauty goals, preferences, or reminders..."
                className="w-full p-4 border-2 border-gold-200 rounded-lg min-h-32 font-sans"
              />
              <Button variant="primary">Save Notes</Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}