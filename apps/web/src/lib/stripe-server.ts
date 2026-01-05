import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

// Initialize Stripe with secret key (server-side only)
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-12-15.clover',
  typescript: true,
});

// Helper to create payment intent for deposit
export async function createDepositPaymentIntent(
  amount: number, // in dollars
  appointmentId: string,
  userId: string
): Promise<{ clientSecret: string; paymentIntentId: string }> {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'aud',
      metadata: {
        appointment_id: appointmentId,
        user_id: userId,
        payment_type: 'deposit',
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      clientSecret: paymentIntent.client_secret!,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
}

// Helper to create refund
export async function createRefund(
  paymentIntentId: string,
  reason?: string
): Promise<Stripe.Refund> {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      reason: 'requested_by_customer',
      metadata: {
        refund_reason: reason || 'Customer cancelled 48+ hours before appointment',
      },
    });

    return refund;
  } catch (error) {
    console.error('Error creating refund:', error);
    throw error;
  }
}

// Helper to check refund eligibility
export function isRefundEligible(appointmentDate: string, appointmentTime: string): {
  eligible: boolean;
  reason: string;
  hoursUntilAppointment: number;
} {
  const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
  const now = new Date();
  const hoursUntilAppointment = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursUntilAppointment >= 48) {
    return {
      eligible: true,
      reason: 'Cancelled 48+ hours before appointment',
      hoursUntilAppointment: Math.floor(hoursUntilAppointment),
    };
  } else {
    return {
      eligible: false,
      reason: `Only ${Math.floor(hoursUntilAppointment)} hours until appointment (48 hours required for refund)`,
      hoursUntilAppointment: Math.floor(hoursUntilAppointment),
    };
  }
}