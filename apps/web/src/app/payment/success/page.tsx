'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { CheckCircle, Loader2 } from 'lucide-react';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState<any>(null);

  useEffect(() => {
    const appointmentId = searchParams.get('appointment_id');
    if (appointmentId) {
      updateAppointmentStatus(appointmentId);
    }
  }, [searchParams]);

  async function updateAppointmentStatus(appointmentId: string) {
    try {
      // Update appointment status to confirmed
      await supabase
        .from('appointments')
        .update({ status: 'confirmed' })
        .eq('id', appointmentId);

      // Update payment status
      await supabase
        .from('payments')
        .update({ status: 'completed' })
        .eq('appointment_id', appointmentId);

      // Fetch appointment details
      const { data } = await supabase
        .from('appointments')
        .select(`
          *,
          services:service_id(name),
          staff:staff_id(name)
        `)
        .eq('id', appointmentId)
        .single();

      setAppointment(data);
    } catch (err) {
      console.error('Error updating appointment:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FAFAF7]">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-[#C9A871] animate-spin mx-auto" />
          <p className="mt-4 text-[#2A2A2A]">Confirming your booking...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center px-4">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-6" />
        
        <h1
          className="text-4xl font-bold text-[#2A2A2A] mb-4"
          style={{ fontFamily: 'Cormorant Garamond, serif' }}
        >
          Payment Successful!
        </h1>
        
        <p className="text-lg text-[#3D3D3D] mb-8">
          Your $40 deposit has been processed and your appointment is confirmed.
        </p>

        {appointment && (
          <div className="bg-[#F5F2EF] rounded-lg p-6 mb-8 text-left">
            <h2 className="text-xl font-bold text-[#2A2A2A] mb-4">Booking Details</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-[#3D3D3D]">Service:</span>
                <span className="font-medium text-[#2A2A2A]">{appointment.services?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#3D3D3D]">Staff:</span>
                <span className="font-medium text-[#2A2A2A]">{appointment.staff?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#3D3D3D]">Date:</span>
                <span className="font-medium text-[#2A2A2A]">
                  {new Date(appointment.appointment_date).toLocaleDateString('en-AU', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#3D3D3D]">Time:</span>
                <span className="font-medium text-[#2A2A2A]">{appointment.appointment_time}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-gray-300">
                <span className="text-[#3D3D3D]">Deposit Paid:</span>
                <span className="font-bold text-green-600">$40.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#3D3D3D]">Remaining Balance:</span>
                <span className="font-medium text-[#2A2A2A]">
                  ${(parseFloat(appointment.total_price) - 40).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-900">
            <strong>What's Next?</strong> You'll receive a confirmation email shortly. 
            The remaining balance of ${appointment ? (parseFloat(appointment.total_price) - 40).toFixed(2) : '0.00'} 
            will be paid at your appointment.
          </p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => router.push('/')}
            className="flex-1 px-6 py-3 bg-gray-100 text-[#2A2A2A] rounded-xl hover:bg-gray-200 transition font-medium"
          >
            Go Home
          </button>
          <button
            onClick={() => router.push('/vip')}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-[#C9A871] to-[#D4AF37] text-white rounded-xl hover:shadow-lg transition font-medium"
          >
            View My Bookings
          </button>
        </div>
      </div>
    </div>
  );
}