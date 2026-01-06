'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { signUp } from '@/lib/auth';
import { validatePassword, getPasswordStrength } from '@/lib/password-validation';

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate all fields filled
    if (!email || !password || !fullName || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password strength
    const validation = validatePassword(password);
    if (!validation.isValid) {
      setError(validation.errors[0]); // Show first error
      setPasswordErrors(validation.errors);
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
    <div className="min-h-screen bg-gold-50 py-12 flex items-center justify-center px-4">
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
              className="w-full p-3 border-2 border-gold-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A871]"
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
              className="w-full p-3 border-2 border-gold-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A871]"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block font-serif font-bold text-dark mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (e.target.value) {
                    const validation = validatePassword(e.target.value);
                    setPasswordErrors(validation.errors);
                  } else {
                    setPasswordErrors([]);
                  }
                }}
                required
                className="w-full p-3 pr-12 border-2 border-gold-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A871]"
                placeholder="Create a strong password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-2xl"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>

            {/* Password strength meter */}
            {password && (
              <div className="mt-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${(getPasswordStrength(password).score / 8) * 100}%`,
                        backgroundColor: getPasswordStrength(password).color,
                      }}
                    />
                  </div>
                  <span
                    className="text-xs font-bold"
                    style={{ color: getPasswordStrength(password).color }}
                  >
                    {getPasswordStrength(password).strength.toUpperCase()}
                  </span>
                </div>

                {/* Password requirements */}
                <div className="space-y-1 text-xs">
                  {passwordErrors.length > 0 ? (
                    passwordErrors.map((err, i) => (
                      <p key={i} className="text-red-600 flex items-start gap-1">
                        <span>❌</span>
                        <span>{err}</span>
                      </p>
                    ))
                  ) : (
                    <p className="text-green-600 flex items-center gap-1">
                      <span>✅</span>
                      <span>Password meets all requirements</span>
                    </p>
                  )}
                </div>
              </div>
            )}
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
              className="w-full p-3 border-2 border-gold-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A871]"
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