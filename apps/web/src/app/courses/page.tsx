'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { supabase } from '@/lib/supabase';

interface Course {
  id: string;
  name: string;
  level: string;
  price: number;
  duration: string;
  instructor_id: string;
  description: string;
  highlights: string[];
  vip_only: boolean;
}

interface Staff {
  id: string;
  name: string;
}

const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];

export default function CoursesPage() {
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const [coursesRes, staffRes] = await Promise.all([
        supabase.from('courses').select('*').eq('is_active', true),
        supabase.from('staff').select('id, name'),
      ]);

      if (coursesRes.data) setCourses(coursesRes.data);
      if (staffRes.data) setStaff(staffRes.data);
      setLoading(false);
    }

    fetchData();
  }, []);

  const filteredCourses =
    selectedLevel === 'All'
      ? courses
      : courses.filter(
          (course) => course.level.toLowerCase() === selectedLevel.toLowerCase()
        );

  const getInstructorName = (instructorId: string) => {
    const instructor = staff.find((s) => s.id === instructorId);
    return instructor?.name || 'TBA';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gold-50 py-12 flex items-center justify-center">
        <p className="text-xl text-dark-secondary">Loading courses...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gold-50 py-12">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-serif font-bold text-dark mb-4">
            Beauty Courses
          </h1>
          <p className="text-xl text-dark-secondary">
            Learn from our expert instructors and master new skills
          </p>
        </div>

        {/* Level Filter */}
        <div className="flex justify-center gap-4 mb-12 flex-wrap">
          {levels.map((level) => (
            <button
              key={level}
              onClick={() => setSelectedLevel(level)}
              className={`px-6 py-3 rounded-full font-serif font-bold transition-all ${
                selectedLevel === level
                  ? 'bg-gold-600 text-white shadow-md'
                  : 'bg-white text-dark border-2 border-gold-200 hover:border-gold-600'
              }`}
            >
              {level}
            </button>
          ))}
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              onClick={() => setSelectedCourse(course)}
              className="cursor-pointer"
            >
              <Card className="p-6 h-full flex flex-col hover:shadow-lg transition-shadow">
                {/* VIP Badge */}
                {course.vip_only && (
                  <div className="mb-3 inline-block px-3 py-1 bg-pink-100 text-pink-600 rounded-full text-xs font-bold">
                    VIP Only
                  </div>
                )}

                {/* Course Info */}
                <h3 className="text-xl font-serif font-bold text-dark mb-2">
                  {course.name}
                </h3>
                <p className="text-sm text-dark-secondary mb-3">
                  by {getInstructorName(course.instructor_id)}
                </p>

                {/* Level & Duration */}
                <div className="flex gap-4 mb-4 text-sm">
                  <span className="px-3 py-1 bg-gold-50 text-dark-secondary rounded-full font-bold capitalize">
                    {course.level}
                  </span>
                  <span className="px-3 py-1 bg-gold-50 text-dark-secondary rounded-full font-bold">
                    {course.duration}
                  </span>
                </div>

                {/* Description */}
                <p className="text-dark-secondary mb-6 flex-grow">
                  {course.description}
                </p>

                {/* Price & Button */}
                <div className="border-t border-gold-100 pt-4">
                  <p className="text-3xl font-bold text-gold-600 mb-4">
                    ${course.price}
                  </p>
                  <Button variant="primary" className="w-full">
                    View Details
                  </Button>
                </div>
              </Card>
            </div>
          ))}
        </div>

        {/* Course Details Modal */}
        {selectedCourse && (
          <div
            className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedCourse(null)}
          >
            <Card className="max-w-2xl w-full p-8 max-h-96 overflow-y-auto">
              <button
                onClick={() => setSelectedCourse(null)}
                className="float-right text-2xl font-bold text-dark hover:text-gold-600 mb-4"
              >
                ✕
              </button>

              {selectedCourse.vip_only && (
                <div className="mb-4 inline-block px-3 py-1 bg-pink-100 text-pink-600 rounded-full text-sm font-bold">
                  VIP Only
                </div>
              )}

              <h2 className="text-3xl font-serif font-bold text-dark mb-2">
                {selectedCourse.name}
              </h2>
              <p className="text-dark-secondary mb-4">
                by {getInstructorName(selectedCourse.instructor_id)}
              </p>

              <div className="flex gap-4 mb-6">
                <span className="px-3 py-1 bg-gold-50 text-dark-secondary rounded-full font-bold text-sm capitalize">
                  {selectedCourse.level}
                </span>
                <span className="px-3 py-1 bg-gold-50 text-dark-secondary rounded-full font-bold text-sm">
                  {selectedCourse.duration}
                </span>
              </div>

              <p className="text-dark-secondary mb-6">
                {selectedCourse.description}
              </p>

              <h4 className="font-serif font-bold text-dark mb-3">
                What You'll Learn:
              </h4>
              <ul className="space-y-2 mb-6">
                {selectedCourse.highlights.map((highlight, index) => (
                  <li
                    key={index}
                    className="text-dark-secondary flex items-start gap-2"
                  >
                    <span className="text-gold-600 font-bold">✓</span>
                    {highlight}
                  </li>
                ))}
              </ul>

              <hr className="border-gold-200 my-6" />

              <div className="flex justify-between items-center">
                <p className="text-3xl font-bold text-gold-600">
                  ${selectedCourse.price}
                </p>
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedCourse(null)}
                  >
                    Close
                  </Button>
                  <Button variant="primary">Enroll Now</Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}