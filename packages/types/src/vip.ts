export interface VIPProfile {
  id: string;
  userId: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  points: number;
  bookingsCount: number;
  lifetimeSpent: number;
  joinedAt: Date;
  updatedAt: Date;
}

export interface Achievement {
  id: string;
  userId: string;
  name: string;
  description: string;
  unlockedAt: Date;
}

export interface VIPReward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
}