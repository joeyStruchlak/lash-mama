'use client';

import { useRouter } from 'next/navigation';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useEffect, useState } from 'react';

export default function BookingSuccessPage() {
  const router = useRouter();
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Hide confetti after 3 seconds
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gold-50 py-12 flex items-center justify-center relative overflow-hidden">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-fall"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-10px`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            >
              {['🎉', '✨', '💎', '⭐'][Math.floor(Math.random() * 4)]}
            </div>
          ))}
        </div>
      )}

      <Card className="max-w-lg w-full p-8 text-center">
        <div className="mb-6">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-serif font-bold text-dark mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-xl text-dark-secondary">
            Your appointment has been successfully scheduled
          </p>
        </div>

        <div className="bg-gold-50 rounded-lg p-6 mb-6">
          <h2 className="font-serif font-bold text-dark mb-4">
            What's Next?
          </h2>
          <ul className="text-left space-y-2 text-dark-secondary">
            <li>✅ Check your email for confirmation</li>
            <li>✅ You'll receive a reminder 24 hours before</li>
            <li>✅ Bring your ID to the appointment</li>
            <li>✅ Arrive 5 minutes early</li>
          </ul>
        </div>

        <div className="space-y-3">
          <Button
            variant="primary"
            className="w-full"
            onClick={() => router.push('/vip')}
          >
            View My Bookings
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push('/')}
          >
            Back to Home
          </Button>
        </div>
      </Card>

      <style jsx>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        .animate-fall {
          animation: fall linear forwards;
        }
      `}</style>
    </div>
  );
}