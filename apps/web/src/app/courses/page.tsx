'use client';

import { Sparkles, Calendar, Bell } from 'lucide-react';

export default function CoursesPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Icon */}
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#C9A871] to-[#D4AF37] flex items-center justify-center">
            <Sparkles size={48} className="text-white" />
          </div>
        </div>

        {/* Heading */}
        <h1
          className="text-5xl font-bold text-[#2A2A2A] mb-4"
          style={{ fontFamily: 'Cormorant Garamond, serif' }}
        >
          Professional Beauty Courses
        </h1>

        <p className="text-2xl text-[#C9A871] font-medium mb-6">
          Coming Soon in 2026
        </p>

        {/* Description */}
        <p className="text-lg text-[#3D3D3D] mb-12 leading-relaxed">
          We're developing an exclusive range of professional beauty courses including 
          Lash Extensions, Makeup Artistry, and Hair Styling. Learn from industry experts 
          and take your skills to the next level.
        </p>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <Calendar size={32} className="text-[#C9A871] mx-auto mb-3" />
            <h3 className="font-bold text-[#2A2A2A] mb-2">Flexible Schedule</h3>
            <p className="text-sm text-[#3D3D3D]">
              Weekend and evening classes available
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <Sparkles size={32} className="text-[#C9A871] mx-auto mb-3" />
            <h3 className="font-bold text-[#2A2A2A] mb-2">Expert Instructors</h3>
            <p className="text-sm text-[#3D3D3D]">
              Learn from certified professionals
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <Bell size={32} className="text-[#C9A871] mx-auto mb-3" />
            <h3 className="font-bold text-[#2A2A2A] mb-2">Get Notified</h3>
            <p className="text-sm text-[#3D3D3D]">
              Be first to know when courses launch
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-[#C9A871] to-[#D4AF37] rounded-xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-3">
            Want Early Access?
          </h3>
          <p className="mb-6">
            Join our VIP program to get exclusive first access to our course offerings 
            and special member pricing!
          </p>
          <a
            href="/vip"
            className="inline-block px-8 py-3 bg-white text-[#C9A871] font-bold rounded-xl hover:shadow-lg transition-all duration-200"
          >
            Learn About VIP
          </a>
        </div>

        {/* Back Button */}
        <div className="mt-8">
          <a
            href="/"
            className="text-[#C9A871] hover:text-[#B89761] font-medium transition"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}