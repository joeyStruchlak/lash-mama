'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { UserRole } from '@/types/user';

interface DashboardRouterProps {
  children?: React.ReactNode;
}

export function DashboardRouter({ children }: DashboardRouterProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    async function checkRoleAndRedirect(): Promise<void> {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          router.push('/login');
          return;
        }

        setUser(user);

        // Get user role
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching user role:', profileError);
          router.push('/');
          return;
        }

        const role = profile.role as UserRole;
        setUserRole(role);

        // Route based on role
        const currentPath = window.location.pathname;

        // If already on correct dashboard, don't redirect
        if (
          (role === 'admin' && currentPath === '/admin') ||
          (role === 'manager' && currentPath === '/manager') ||
          (role === 'staff' && currentPath === '/staff')
        ) {
          setLoading(false);
          return;
        }

        // Redirect to appropriate dashboard
        switch (role) {
          case 'admin':
            router.push('/admin');
            break;
          case 'manager':
            router.push('/manager');
            break;
          case 'staff':
            router.push('/staff');
            break;
          default:
            // user or vip can access regular pages
            setLoading(false);
            break;
        }

      } catch (error) {
        console.error('Error in DashboardRouter:', error);
        router.push('/');
      }
    }

    checkRoleAndRedirect();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gold-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gold-600 border-r-transparent mb-4"></div>
          <p className="text-xl text-dark-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Helper hook to get current user role
export function useUserRole() {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserRole(): Promise<void> {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setLoading(false);
          return;
        }

        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profile) {
          setUserRole(profile.role as UserRole);
        }
      } catch (error) {
        console.error('Error loading user role:', error);
      } finally {
        setLoading(false);
      }
    }

    loadUserRole();
  }, []);

  return { userRole, loading };
}