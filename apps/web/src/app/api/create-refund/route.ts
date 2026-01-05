import { NextRequest, NextResponse } from 'next/server';
import { createRefund, isRefundEligible } from '@/lib/stripe-server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { paymentIntentId, appointmentId, reason } = await req.json();

    if (!paymentIntentId || !appointmentId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get appointment details
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select('appointment_date, appointment_time')
      .eq('id', appointmentId)
      .single();

    if (appointmentError || !appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    // Check refund eligibility (48-hour rule)
    const eligibility = isRefundEligible(
      appointment.appointment_date,
      appointment.appointment_time
    );

    if (!eligibility.eligible) {
      return NextResponse.json(
        { 
          error: eligibility.reason,
          eligible: false,
          hoursUntilAppointment: eligibility.hoursUntilAppointment,
        },
        { status: 400 }
      );
    }

    // Create refund in Stripe
    const refund = await createRefund(paymentIntentId, reason);

    // Update payment record in database
    await supabase
      .from('payments')
      .update({
        status: 'refunded',
        stripe_refund_id: refund.id,
        refunded_at: new Date().toISOString(),
      })
      .eq('stripe_payment_intent_id', paymentIntentId);

    return NextResponse.json({
      success: true,
      refund,
      message: 'Refund processed successfully',
    });
  } catch (error) {
    console.error('Refund error:', error);
    return NextResponse.json(
      { error: 'Failed to process refund' },
      { status: 500 }
    );
  }
}