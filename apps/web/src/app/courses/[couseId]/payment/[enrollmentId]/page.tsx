'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getStripe } from '@/lib/stripe-client';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function CoursePaymentPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const enrollmentId = params.enrollmentId as string;

  const [enrollment, setEnrollment] = useState<any>(null);
  const [course, setCourse] = useState<any>(null);
  const [clientSecret, setClientSecret] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchEnrollmentAndCreatePayment();
  }, [enrollmentId]);

  async function fetchEnrollmentAndCreatePayment() {
    try {
      setLoading(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Please login to continue');
        return;
      }

      // Get enrollment details
      const { data: enrollmentData, error: enrollmentError } = await supabase
        .from('course_enrollments')
        .select(`
          *,
          course:course_id(title, price, instructor:instructor_id(name))
        `)
        .eq('id', enrollmentId)
        .single();

      if (enrollmentError) throw enrollmentError;

      setEnrollment(enrollmentData);
      setCourse(enrollmentData.course);

      // Check if already paid
      if (enrollmentData.payment_status === 'completed') {
        setError('This enrollment has already been paid for');
        return;
      }

      // Create payment intent
      const response = await fetch('/api/create-course-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: enrollmentData.payment_amount,
          enrollmentId: enrollmentData.id,
          userId: user.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment intent');
      }

      setClientSecret(data.clientSecret);

      // Update enrollment with payment intent ID
      await supabase
        .from('course_enrollments')
        .update({ stripe_payment_intent_id: data.paymentIntentId })
        .eq('id', enrollmentId);

    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message || 'Failed to load payment page');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FAFAF7]">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-[#C9A871] animate-spin mx-auto" />
          <p className="mt-4 text-[#2A2A2A]">Loading payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FAFAF7]">
        <div className="text-center max-w-md">
          <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[#2A2A2A] mb-2">Payment Error</h1>
          <p className="text-[#3D3D3D] mb-6">{error}</p>
          <a
            href="/courses"
            className="px-6 py-3 bg-[#C9A871] text-white rounded-xl hover:bg-[#B89761] transition inline-block"
          >
            Back to Courses
          </a>
        </div>
      </div>
    );
  }

  const stripePromise = getStripe();

  return (
    <div className="min-h-screen bg-[#FAFAF7] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Course Summary */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h1
            className="text-3xl font-bold text-[#2A2A2A] mb-6"
            style={{ fontFamily: 'Cormorant Garamond, serif' }}
          >
            Complete Your Enrollment
          </h1>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <span className="text-[#3D3D3D]">Course:</span>
              <span className="font-medium text-[#2A2A2A]">{course?.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#3D3D3D]">Instructor:</span>
              <span className="font-medium text-[#2A2A2A]">{course?.instructor?.name}</span>
            </div>
            <div className="flex justify-between pt-3 border-t border-gray-200">
              <span className="text-[#3D3D3D]">Total Amount:</span>
              <span className="text-2xl font-bold text-[#C9A871]">${enrollment?.payment_amount}</span>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>Payment Policy:</strong> Full payment is required to secure your spot in this course.
              Refunds available up to 7 days before the course start date.
            </p>
          </div>
        </div>

        {/* Payment Form */}
        {clientSecret && (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CoursePaymentForm enrollmentId={enrollmentId} courseId={courseId} />
          </Elements>
        )}
      </div>
    </div>
  );
}

// Separate component for payment form (uses Stripe hooks)
function CoursePaymentForm({ enrollmentId, courseId }: { enrollmentId: string; courseId: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string>('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError('');

    try {
      const { error: submitError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/courses/${courseId}/success?enrollment_id=${enrollmentId}`,
        },
      });

      if (submitError) {
        setError(submitError.message || 'Payment failed');
      }
    } catch (err: any) {
      setError(err.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-2xl font-bold text-[#2A2A2A] mb-6">
        Payment Details
      </h2>
      
      <form onSubmit={handleSubmit}>
        <PaymentElement />

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={!stripe || processing}
          className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-[#C9A871] to-[#D4AF37] text-white text-lg font-semibold rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {processing ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Processing...
            </>
          ) : (
            <>
              <CheckCircle size={20} />
              Complete Enrollment
            </>
          )}
        </button>
      </form>

      <p className="text-xs text-center text-[#3D3D3D] mt-4">
        Your payment is secure and encrypted
      </p>
    </div>
  );
}