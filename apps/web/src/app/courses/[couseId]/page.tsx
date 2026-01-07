'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Users, Clock, Calendar, DollarSign, CheckCircle, Loader2 } from 'lucide-react';
import type { CourseWithInstructor, CourseEnrollment } from '@/types/course';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<CourseWithInstructor | null>(null);
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    fetchCourseDetails();
  }, [courseId]);

  async function fetchCourseDetails() {
    try {
      setLoading(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }

      // Get course details
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select(`
          *,
          instructor:instructor_id(id, name, email)
        `)
        .eq('id', courseId)
        .single();

      if (courseError) throw courseError;

      setCourse(courseData as any);

      // Get all enrollments for this course
      const { data: enrollmentData, error: enrollmentError } = await supabase
        .from('course_enrollments')
        .select('*')
        .eq('course_id', courseId)
        .eq('payment_status', 'completed');

      if (enrollmentError) throw enrollmentError;

      setEnrollments(enrollmentData || []);

      // Check if current user is enrolled
      if (user) {
        const userEnrollment = (enrollmentData || []).find(e => e.user_id === user.id);
        setIsEnrolled(!!userEnrollment);
      }

    } catch (err) {
      console.error('Error fetching course:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleEnroll() {
    if (!currentUserId) {
      router.push('/login');
      return;
    }

    try {
      setEnrolling(true);

      // Create enrollment record
      const { data: enrollmentData, error: enrollmentError } = await supabase
        .from('course_enrollments')
        .insert({
          course_id: courseId,
          user_id: currentUserId,
          payment_amount: course?.price || 0,
          payment_status: 'pending',
        })
        .select()
        .single();

      if (enrollmentError) throw enrollmentError;

      // Redirect to course payment page
      router.push(`/courses/${courseId}/payment/${enrollmentData.id}`);

    } catch (err: any) {
      console.error('Error enrolling:', err);
      if (err.code === '23505') {
        alert('You are already enrolled in this course!');
      } else {
        alert('Failed to enroll. Please try again.');
      }
    } finally {
      setEnrolling(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FAFAF7]">
        <Loader2 className="w-16 h-16 text-[#C9A871] animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FAFAF7]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#2A2A2A] mb-4">Course Not Found</h1>
          <button
            onClick={() => router.push('/courses')}
            className="px-6 py-3 bg-[#C9A871] text-white rounded-xl hover:bg-[#B89761] transition"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  const spotsRemaining = course.max_students - enrollments.length;
  const isFull = spotsRemaining <= 0;

  return (
    <div className="min-h-screen bg-[#FAFAF7] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push('/courses')}
          className="mb-6 text-[#C9A871] hover:text-[#B89761] transition flex items-center gap-2"
        >
          ← Back to Courses
        </button>

        {/* Course Header */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
          <h1
            className="text-4xl font-bold text-[#2A2A2A] mb-4"
            style={{ fontFamily: 'Cormorant Garamond, serif' }}
          >
            {course.name}
          </h1>

          <div className="flex items-center gap-2 text-[#3D3D3D] mb-6">
            <Users size={20} />
            <span>Instructor: {course.instructor?.name || 'TBA'}</span>
          </div>

          <p className="text-[#3D3D3D] text-lg mb-6">
            {course.description}
          </p>

          {/* Course Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-3 p-4 bg-[#F5F2EF] rounded-lg">
              <Clock size={24} className="text-[#C9A871]" />
              <div>
                <p className="text-xs text-[#3D3D3D]">Duration</p>
                <p className="font-semibold text-[#2A2A2A]">{course.duration}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-[#F5F2EF] rounded-lg">
              <Calendar size={24} className="text-[#C9A871]" />
              <div>
                <p className="text-xs text-[#3D3D3D]">Start Date</p>
                <p className="font-semibold text-[#2A2A2A]">
                  {new Date(course.start_date).toLocaleDateString('en-AU', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-[#F5F2EF] rounded-lg">
              <DollarSign size={24} className="text-[#C9A871]" />
              <div>
                <p className="text-xs text-[#3D3D3D]">Price</p>
                <p className="font-semibold text-[#2A2A2A]">${course.price}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-[#F5F2EF] rounded-lg">
              <Users size={24} className="text-[#C9A871]" />
              <div>
                <p className="text-xs text-[#3D3D3D]">Spots Available</p>
                <p className="font-semibold text-[#2A2A2A]">
                  {spotsRemaining} of {course.max_students}
                </p>
              </div>
            </div>
          </div>

          {/* Visual Spot Indicator */}
          <div className="mb-6">
            <p className="text-sm font-medium text-[#2A2A2A] mb-3">Course Availability:</p>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: course.max_students }).map((_, index) => {
                const isOccupied = index < enrollments.length;
                return (
                  <div
                    key={index}
                    className={`w-12 h-12 rounded-lg flex items-center justify-center text-sm font-bold transition ${
                      isOccupied
                        ? 'bg-[#C9A871] text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {index + 1}
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-[#3D3D3D] mt-2">
              Gold boxes = Enrolled students | Gray boxes = Available spots
            </p>
          </div>

          {/* Enroll Button */}
          {isEnrolled ? (
            <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-xl">
              <CheckCircle className="text-green-600" size={24} />
              <p className="text-green-800 font-medium">
                You're enrolled in this course!
              </p>
            </div>
          ) : isFull ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-center">
              <p className="text-red-800 font-medium">
                This course is fully booked
              </p>
            </div>
          ) : (
            <button
              onClick={handleEnroll}
              disabled={enrolling || !currentUserId}
              className="w-full px-6 py-4 bg-gradient-to-r from-[#C9A871] to-[#D4AF37] text-white text-lg font-semibold rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {enrolling ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Processing...
                </>
              ) : !currentUserId ? (
                'Login to Enroll'
              ) : (
                <>
                  Enroll Now - ${course.price}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}