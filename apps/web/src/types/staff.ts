export interface Staff {
  id: string;
  name: string;
  email: string | null;
  tier: string;
  price_multiplier: number;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface StaffWithStats extends Staff {
  total_bookings: number;
  total_revenue: number;
  upcoming_bookings: number;
}

export const TIER_CONFIG: Record<string, {
  label: string;
  color: string;
  badgeClass: string;
}> = {
  master: {
    label: 'Master Artist',
    color: 'from-purple-500 to-purple-600',
    badgeClass: 'bg-purple-100 text-purple-800',
  },
  senior: {
    label: 'Senior Artist',
    color: 'from-blue-500 to-blue-600',
    badgeClass: 'bg-blue-100 text-blue-800',
  },
  standard: {
    label: 'Standard Artist',
    color: 'from-green-500 to-green-600',
    badgeClass: 'bg-green-100 text-green-800',
  },
  junior: {
    label: 'Junior Artist',
    color: 'from-amber-500 to-amber-600',
    badgeClass: 'bg-amber-100 text-amber-800',
  },
  // Fallback for any unknown tiers
  default: {
    label: 'Artist',
    color: 'from-gray-500 to-gray-600',
    badgeClass: 'bg-gray-100 text-gray-800',
  },
};

export function getTierConfig(tier: string) {
  return TIER_CONFIG[tier.toLowerCase()] || TIER_CONFIG.default;
}