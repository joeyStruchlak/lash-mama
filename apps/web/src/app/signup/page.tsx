'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { signUp } from '@/lib/auth';

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password, fullName);
      
      // Show success message
      alert('Account created! Please check your email to verify your account.');
      router.push('/login');
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gold-50 py-12 flex items-center justify-center">
      <Card className="max-w-md w-full p-8">
        <h1 className="text-3xl font-serif font-bold text-dark mb-6 text-center">
          Create Account
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-serif font-bold text-dark mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full p-3 border-2 border-gold-200 rounded-lg"
              placeholder="Sarah Johnson"
            />
          </div>

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

          <div>
            <label className="block font-serif font-bold text-dark mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            {loading ? 'Creating account...' : 'Sign Up'}
          </Button>
        </form>

        <p className="text-center text-dark-secondary mt-6">
          Already have an account?{' '}
          <a href="/login" className="text-gold-600 font-bold hover:underline">
            Login
          </a>
        </p>
      </Card>
    </div>
  );
}