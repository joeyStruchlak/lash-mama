'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { CheckCircle, Loader2 } from 'lucide-react';
import { createNotification } from '@/lib/notifications';

export default function CoursePaymentSuccessPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const enrollmentId = searchParams.get('enrollment_id');

  const [loading, setLoading] = useState(true);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [course, setCourse] = useState<any>(null);

  useEffect(() => {
    if (enrollmentId) {
      updateEnrollmentStatus(enrollmentId);
    }
  }, [enrollmentId]);

  async function updateEnrollmentStatus(enrollmentId: string) {
    try {
      // Update enrollment status to completed
      await supabase
        .from('course_enrollments')
        .update({ payment_status: 'completed' })
        .eq('id', enrollmentId);

      // Fetch enrollment and course details
      const { data: enrollmentData } = await supabase
        .from('course_enrollments')
        .select(`
          *,
          course:course_id(
            title,
            price,
            start_date,
            instructor:instructor_id(name)
          )
        `)
        .eq('id', enrollmentId)
        .single();

      setEnrollment(enrollmentData);
      setCourse(enrollmentData?.course);

      // Send notification
      if (enrollmentData) {
        await createNotification({
          user_id: enrollmentData.user_id,
          type: 'booking_confirmed',
          title: 'Course Enrollment Confirmed! 🎓',
          message: `You're enrolled in ${enrollmentData.course?.title}! We'll send you course details closer to the start date.`,
        });
      }
    } catch (err) {
      console.error('Error updating enrollment:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FAFAF7]">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-[#C9A871] animate-spin mx-auto" />
          <p className="mt-4 text-[#2A2A2A]">Confirming your enrollment...</p>
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
          Enrollment Successful!
        </h1>
        
        <p className="text-lg text-[#3D3D3D] mb-8">
          Your payment has been processed and you're enrolled in the course.
        </p>

        {course && (
          <div className="bg-[#F5F2EF] rounded-lg p-6 mb-8 text-left">
            <h2 className="text-xl font-bold text-[#2A2A2A] mb-4">Course Details</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-[#3D3D3D]">Course:</span>
                <span className="font-medium text-[#2A2A2A]">{course.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#3D3D3D]">Instructor:</span>
                <span className="font-medium text-[#2A2A2A]">{course.instructor?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#3D3D3D]">Start Date:</span>
                <span className="font-medium text-[#2A2A2A]">
                  {new Date(course.start_date).toLocaleDateString('en-AU', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex justify-between pt-3 border-t border-gray-300">
                <span className="text-[#3D3D3D]">Amount Paid:</span>
                <span className="font-bold text-green-600">${enrollment?.payment_amount}</span>
              </div>
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-900">
            <strong>What's Next?</strong> You'll receive a confirmation email with course materials 
            and location details. See you at the course!
          </p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => router.push('/courses')}
            className="flex-1 px-6 py-3 bg-gray-100 text-[#2A2A2A] rounded-xl hover:bg-gray-200 transition font-medium"
          >
            Browse More Courses
          </button>
          <button
            onClick={() => router.push('/')}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-[#C9A871] to-[#D4AF37] text-white rounded-xl hover:shadow-lg transition font-medium"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}