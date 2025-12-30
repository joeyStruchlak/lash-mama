export type UserRole = 'client' | 'staff' | 'admin';
export type VIPTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface User {
  id: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: UserRole;
  vipTier: VIPTier;
  vipPoints: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile extends User {
  bookingsCount: number;
  memberSince: Date;
  totalSpent: number;
}