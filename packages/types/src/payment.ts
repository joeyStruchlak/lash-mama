export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded';
export type PaymentMethod = 'card' | 'afterpay' | 'bank_transfer';

export interface Payment {
  id: string;
  appointmentId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod;
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentIntent {
  appointmentId: string;
  amount: number;
  currency: string;
}