'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { signIn } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { user } = await signIn(email, password);

      if (!user) {
        throw new Error('Login failed');
      }

      // Check user role and redirect accordingly
      const { data: userProfile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      // Smart redirect based on role
      if (userProfile?.role === 'admin') {
        router.push('/admin');
      } else if (userProfile?.role === 'staff') {
        router.push('/staff');
      } else if (userProfile?.role === 'vip') {
        router.push('/vip');
      } else {
        router.push('/dashboard'); // Regular clients
      }

    } catch (err: any) {
      setError(err.message || 'Failed to login');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gold-50 py-12 flex items-center justify-center">
      <Card className="max-w-md w-full p-8">
        <h1 className="text-3xl font-serif font-bold text-dark mb-6 text-center">
          Welcome Back
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-serif font-bold text-dark mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 border-2 border-gold-200 rounded-lg"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block font-serif font-bold text-dark mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 border-2 border-gold-200 rounded-lg"
              placeholder="••••••••"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        <p className="text-center text-dark-secondary mt-6">
          Don't have an account?{' '}
          <a href="/signup" className="text-gold-600 font-bold hover:underline">
            Sign up
          </a>
        </p>
      </Card>
    </div>
  );
}