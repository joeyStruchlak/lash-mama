'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { signOut } from '@/lib/auth';
import type { User } from '@supabase/supabase-js';

interface UserProfile {
  role: 'user' | 'vip' | 'admin';
  avatar_url: string | null;
}

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    async function loadUser(): Promise<void> {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError) {
          console.error('Error fetching user:', userError);
          return;
        }

        setUser(user);

        if (user) {
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('role, avatar_url')
            .eq('id', user.id)
            .single();

          if (profileError) {
            console.error('Error fetching profile:', profileError);
          } else if (profile) {
            setUserProfile(profile);
          }
        }
      } catch (error) {
        console.error('Unexpected error in loadUser:', error);
      }
    }

    loadUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);

      if (session?.user) {
        try {
          const { data: profile, error } = await supabase
            .from('users')
            .select('role, avatar_url')
            .eq('id', session.user.id)
            .single();

          if (error) {
            console.error('Error fetching profile:', error);
          } else if (profile) {
            setUserProfile(profile);
          }
        } catch (error) {
          console.error('Error in auth state change:', error);
        }
      } else {
        setUserProfile(null);
      }
    });

    // Listen for avatar updates
    const handleAvatarUpdate = (): void => {
      loadUser();
    };

    window.addEventListener('avatar-updated', handleAvatarUpdate);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('avatar-updated', handleAvatarUpdate);
    };
  }, []);

  const handleLogout = async (): Promise<void> => {
    try {
      await signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Error logging out:', error);
      alert('Failed to log out. Please try again.');
    }
  };

  const navItems = [
    { label: 'Book', href: '/book' },
    { label: 'Services', href: '/services' },
    { label: 'VIP', href: '/vip' },
    { label: 'Gallery', href: '/gallery' },
    { label: 'Shop', href: '/shop' },
    { label: 'Courses', href: '/courses' },
  ];

  const isVIP = userProfile?.role === 'vip';

  return (
    <header className="bg-white border-b border-gold-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-serif font-bold text-dark">
            Lash Mama
          </Link>

          <nav className="hidden md:flex gap-8 items-center">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-dark hover:text-gold-600 transition-colors font-medium"
              >
                {item.label}
              </Link>
            ))}

            {user ? (
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gold-100 border-2 border-gold-300">
                    {userProfile?.avatar_url ? (
                      <img
                        src={userProfile.avatar_url}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gold-600 font-bold">
                        {user.email?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  {isVIP && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-gold-600 to-gold-500 rounded-full flex items-center justify-center text-xs border-2 border-white">
                      💎
                    </div>
                  )}
                </div>

                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-gold-600 text-white rounded-lg hover:bg-gold-500 transition-colors font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex gap-4">
                <Link
                  href="/login"
                  className="px-4 py-2 border-2 border-gold-600 text-gold-600 rounded-lg hover:bg-gold-50 transition-colors font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 bg-gold-600 text-white rounded-lg hover:bg-gold-500 transition-colors font-medium"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </nav>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-dark"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 space-y-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block text-dark hover:text-gold-600 transition-colors font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}

            {user ? (
              <div className="pt-4 border-t border-gold-200 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gold-100 border-2 border-gold-300">
                      {userProfile?.avatar_url ? (
                        <img
                          src={userProfile.avatar_url}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gold-600 font-bold">
                          {user.email?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    {isVIP && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-gold-600 to-gold-500 rounded-full flex items-center justify-center text-xs border-2 border-white">
                        💎
                      </div>
                    )}
                  </div>
                  <p className="text-dark-secondary text-sm">{user.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 bg-gold-600 text-white rounded-lg hover:bg-gold-500 transition-colors font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="pt-4 border-t border-gold-200 space-y-3">
                <Link
                  href="/login"
                  className="block text-center px-4 py-2 border-2 border-gold-600 text-gold-600 rounded-lg hover:bg-gold-50 transition-colors font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="block text-center px-4 py-2 bg-gold-600 text-white rounded-lg hover:bg-gold-500 transition-colors font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}