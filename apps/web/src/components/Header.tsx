'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { signOut } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>('user');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check current user
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setUser(user);

      if (user) {
        // Get user role and avatar
        const { data: profile } = await supabase
          .from('users')
          .select('role, avatar_url')
          .eq('id', user.id)
          .single();

        if (profile) {
          setUserRole(profile.role);
          setAvatarUrl(profile.avatar_url);
        }
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);

      if (session?.user) {
        const { data: profile } = await supabase
          .from('users')
          .select('role, avatar_url')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          setUserRole(profile.role);
          setAvatarUrl(profile.avatar_url);
        }
      } else {
        setUserRole('user');
        setAvatarUrl(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/';
  };

  const navItems = [
    { label: 'Book', href: '/book' },
    { label: 'Services', href: '/services' },
    { label: 'VIP', href: '/vip' },
    { label: 'Gallery', href: '/gallery' },
    { label: 'Shop', href: '/shop' },
    { label: 'Courses', href: '/courses' },
  ];

  const isVIP = userRole === 'vip';

  return (
    <header className="bg-white border-b border-gold-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="text-2xl font-serif font-bold text-dark">
            Lash Mama
          </Link>

          {/* Desktop Navigation */}
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

            {/* Auth Buttons */}
            {user ? (
              <div className="flex items-center gap-4">
                {/* Avatar with VIP Badge */}
                <div className="relative">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gold-100 border-2 border-gold-300">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
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

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-dark"
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

        {/* Mobile Navigation */}
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

            {/* Mobile Auth Buttons */}
            {user ? (
              <div className="pt-4 border-t border-gold-200 space-y-3">
                <div className="flex items-center gap-3">
                  {/* Mobile Avatar */}
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gold-100 border-2 border-gold-300">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
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