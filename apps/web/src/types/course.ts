export interface Course {
  id: string;
  name: string; // Changed from 'title'
  description: string;
  instructor_id: string;
  price: number;
  duration: string; 
  level: string;
  max_students: number;
  start_date: string;
  highlights?: string[];
  vip_only: boolean;
  is_active: boolean;
  created_at: string;
}

export interface CourseWithInstructor extends Course {
  instructor?: {
    id: string;
    name: string;
    email: string;
  };
  enrolled_count?: number;
  available_spots?: number;
}

export interface CourseEnrollment {
  id: string;
  course_id: string;
  user_id: string;
  enrollment_date: string;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_amount: number;
  stripe_payment_intent_id?: string | null;
  completed: boolean;
  completion_date?: string | null;
  certificate_url?: string | null;
  notes?: string | null;
  created_at: string;
}

export interface CourseEnrollmentWithDetails extends CourseEnrollment {
  course?: Course;
  user?: {
    id: string;
    full_name: string;
    email: string;
  };
}

export interface EnrollmentFormData {
  course_id: string;
  user_id: string;
  payment_amount: number;
}