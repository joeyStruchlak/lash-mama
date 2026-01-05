'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getStripe } from '@/lib/stripe-client';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CreditCard, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function PaymentPage() {
    const params = useParams();
    const appointmentId = params.appointmentId as string;
    const [appointment, setAppointment] = useState<any>(null);
    const [clientSecret, setClientSecret] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        fetchAppointmentAndCreatePaymentIntent();
    }, [appointmentId]);

    async function fetchAppointmentAndCreatePaymentIntent() {
        try {
            setLoading(true);

            // Get current user
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setError('Please login to continue');
                return;
            }

            // Get appointment details
            const { data: appointmentData, error: appointmentError } = await supabase
                .from('appointments')
                .select(`
          *,
          services:service_id(name, base_price),
          staff:staff_id(name),
          users:user_id(full_name, email)
        `)
                .eq('id', appointmentId)
                .single();

            if (appointmentError) throw appointmentError;

            setAppointment(appointmentData);

            // Check if already paid
            const { data: existingPayment } = await supabase
                .from('payments')
                .select('*')
                .eq('appointment_id', appointmentId)
                .eq('status', 'completed')
                .single();

            if (existingPayment) {
                setError('This appointment has already been paid for');
                return;
            }

            // Create payment intent
            const response = await fetch('/api/create-payment-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: 40, // $40 deposit
                    appointmentId,
                    userId: user.id,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create payment intent');
            }

            setClientSecret(data.clientSecret);

            // Save payment record
            await supabase.from('payments').insert({
                appointment_id: appointmentId,
                user_id: user.id,
                amount: 40,
                payment_type: 'deposit',
                payment_method: 'stripe',
                stripe_payment_intent_id: data.paymentIntentId,
                status: 'pending',
                refund_eligible: true,
            });

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
                        href="/"
                        className="px-6 py-3 bg-[#C9A871] text-white rounded-xl hover:bg-[#B89761] transition"
                    >
                        Go Home
                    </a>
                </div>
            </div>
        );
    }

    const stripePromise = getStripe();

    return (
        <div className="min-h-screen bg-[#FAFAF7] py-12 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Appointment Summary */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <h1
                        className="text-3xl font-bold text-[#2A2A2A] mb-6"
                        style={{ fontFamily: 'Cormorant Garamond, serif' }}
                    >
                        Complete Your Booking
                    </h1>

                    <div className="space-y-3 mb-6">
                        <div className="flex justify-between">
                            <span className="text-[#3D3D3D]">Service:</span>
                            <span className="font-medium text-[#2A2A2A]">{appointment?.services?.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[#3D3D3D]">Staff:</span>
                            <span className="font-medium text-[#2A2A2A]">{appointment?.staff?.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[#3D3D3D]">Date:</span>
                            <span className="font-medium text-[#2A2A2A]">
                                {new Date(appointment?.appointment_date).toLocaleDateString('en-AU', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                })}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[#3D3D3D]">Time:</span>
                            <span className="font-medium text-[#2A2A2A]">
                                {appointment?.appointment_time}
                            </span>
                        </div>
                        <div className="flex justify-between pt-3 border-t border-gray-200">
                            <span className="text-[#3D3D3D]">Total Service Price:</span>
                            <span className="font-medium text-[#2A2A2A]">
                                ${appointment?.total_price}
                            </span>
                        </div>
                    </div>

                    <div className="bg-[#F5F2EF] rounded-lg p-4 mb-6">
                        <div className="flex items-center gap-2 mb-2">
                            <CreditCard size={20} className="text-[#C9A871]" />
                            <span className="font-semibold text-[#2A2A2A]">Deposit Required</span>
                        </div>
                        <p className="text-[#3D3D3D] text-sm mb-3">
                            A $40 non-refundable deposit is required to secure your booking.
                            The remaining balance will be paid at your appointment.
                        </p>
                        <div className="flex justify-between items-center">
                            <span className="text-[#3D3D3D]">Deposit Amount:</span>
                            <span className="text-2xl font-bold text-[#C9A871]">$40</span>
                        </div>
                    </div>

                    {/* Refund Policy */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-900">
                            <strong>Refund Policy:</strong> Full refund if cancelled 48+ hours before your appointment.
                            Cancellations within 48 hours are non-refundable.
                        </p>
                    </div>
                </div>

                {/* Payment Form */}
                {clientSecret && (
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                        <PaymentForm appointmentId={appointmentId} />
                    </Elements>
                )}
            </div>
        </div>
    );
}

// Separate component for payment form (uses Stripe hooks)
function PaymentForm({ appointmentId }: { appointmentId: string }) {
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
                    return_url: `${window.location.origin}/payment/success?appointment_id=${appointmentId}`,
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
                            Pay $40 Deposit
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