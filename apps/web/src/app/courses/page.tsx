'use client';

import { useState } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';

const coursesData = [
  {
    id: 1,
    name: 'VIP Vogue One-on-One Lash Course',
    level: 'Advanced',
    price: 599,
    duration: '6 weeks',
    instructor: 'Lash Mama (Purni)',
    description:
      'Premium individual training with personalized instruction. Learn advanced lashing techniques and build your portfolio.',
    highlights: [
      'One-on-one mentorship',
      'Advanced techniques',
      'Portfolio building',
      'Exclusive materials included',
    ],
    vipOnly: true,
  },
  {
    id: 2,
    name: 'Platinum Lash Course',
    level: 'Advanced',
    price: 399,
    duration: '4 weeks',
    instructor: 'Nikki & Beau',
    description:
      'Advanced lashing techniques for professionals. Perfect for those wanting to specialize in volume and mega volume sets.',
    highlights: [
      'Advanced volume techniques',
      'Group or 1-on-1 options',
      'Certification included',
      'Lifetime access to materials',
    ],
    vipOnly: false,
  },
  {
    id: 3,
    name: 'Silver Lash Course',
    level: 'Intermediate',
    price: 249,
    duration: '3 weeks',
    instructor: 'Natali',
    description:
      'Intermediate lashing techniques. Learn foundational skills and improve your application speed and precision.',
    highlights: [
      'Intermediate techniques',
      'Group class format',
      'Hands-on practice',
      'Certificate of completion',
    ],
    vipOnly: false,
  },
  {
    id: 4,
    name: 'Gold Lash Course',
    level: 'Beginner',
    price: 149,
    duration: '2 weeks',
    instructor: 'Lash Mama (Purni)',
    description:
      'Introduction to lash extensions. Perfect for beginners wanting to learn the basics of application.',
    highlights: [
      'Beginner-friendly',
      'Introduction to lashing',
      'Group setting',
      'Affordable entry point',
    ],
    vipOnly: false,
  },
  {
    id: 5,
    name: 'DIY Makeup Course',
    level: 'Beginner',
    price: 179,
    duration: '2 weeks',
    instructor: 'Nikki & Beau',
    description:
      'Learn professional makeup application techniques for everyday wear and special occasions at home.',
    highlights: [
      'Self-application techniques',
      'Product knowledge',
      'At-home styling tips',
      'Video tutorials included',
    ],
    vipOnly: false,
  },
  {
    id: 6,
    name: 'Masterclass & Hairstyling',
    level: 'Advanced',
    price: 299,
    duration: '3 weeks',
    instructor: 'Natali',
    description:
      'Advanced hair styling techniques including updos, curls, and bridal hair styling for special occasions.',
    highlights: [
      'Advanced styling',
      'Updo specialization',
      'Bridal styling focus',
      'Premium group workshop',
    ],
    vipOnly: false,
  },
];

const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];

export default function CoursesPage() {
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedCourse, setSelectedCourse] = useState<typeof coursesData[0] | null>(null);

  const filteredCourses =
    selectedLevel === 'All'
      ? coursesData
      : coursesData.filter((course) => course.level === selectedLevel);

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
                {course.vipOnly && (
                  <div className="mb-3 inline-block px-3 py-1 bg-pink-100 text-pink-600 rounded-full text-xs font-bold">
                    VIP Only
                  </div>
                )}

                {/* Course Info */}
                <h3 className="text-xl font-serif font-bold text-dark mb-2">
                  {course.name}
                </h3>
                <p className="text-sm text-dark-secondary mb-3">
                  by {course.instructor}
                </p>

                {/* Level & Duration */}
                <div className="flex gap-4 mb-4 text-sm">
                  <span className="px-3 py-1 bg-gold-50 text-dark-secondary rounded-full font-bold">
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

              {selectedCourse.vipOnly && (
                <div className="mb-4 inline-block px-3 py-1 bg-pink-100 text-pink-600 rounded-full text-sm font-bold">
                  VIP Only
                </div>
              )}

              <h2 className="text-3xl font-serif font-bold text-dark mb-2">
                {selectedCourse.name}
              </h2>
              <p className="text-dark-secondary mb-4">
                by {selectedCourse.instructor}
              </p>

              <div className="flex gap-4 mb-6">
                <span className="px-3 py-1 bg-gold-50 text-dark-secondary rounded-full font-bold text-sm">
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
                {selectedCourse.highlights.map((highlight) => (
                  <li key={highlight} className="text-dark-secondary flex items-start gap-2">
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
                  <Button variant="outline" onClick={() => setSelectedCourse(null)}>
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