export interface Payment {
  id: string;
  appointment_id: string;
  user_id: string;
  amount: number;
  payment_type: 'deposit' | 'full_payment' | 'refund';
  payment_method: 'stripe' | 'afterpay' | 'cash' | 'manual';
  stripe_payment_intent_id?: string | null;
  stripe_refund_id?: string | null;
  afterpay_order_id?: string | null;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  refund_eligible: boolean;
  refunded_at?: string | null;
  created_at: string;
}

export interface StripePaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

export interface RefundRequest {
  payment_id: string;
  appointment_id: string;
  reason?: string;
}

export interface RefundEligibility {
  eligible: boolean;
  reason: string;
  hours_until_appointment: number;
}