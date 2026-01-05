import { NextRequest, NextResponse } from 'next/server';
import { createDepositPaymentIntent } from '@/lib/stripe-server';

export async function POST(req: NextRequest) {
  try {
    const { amount, appointmentId, userId } = await req.json();

    if (!amount || !appointmentId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { clientSecret, paymentIntentId } = await createDepositPaymentIntent(
      amount,
      appointmentId,
      userId
    );

    return NextResponse.json({
      clientSecret,
      paymentIntentId,
    });
  } catch (error) {
    console.error('Payment intent error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}