'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from './Button';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { label: 'Book', href: '/book' },
    { label: 'Services', href: '/services' },
    { label: 'VIP', href: '/vip' },
    { label: 'Gallery', href: '/gallery' },
    { label: 'Shop', href: '/shop' },
    { label: 'Courses', href: '/courses' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md border-b border-gold-100">
      <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <h1 className="text-3xl font-serif font-bold text-gold-600 hover:text-gold-500 transition-colors">
            Lash Mama
          </h1>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-12 flex-1 justify-center">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-dark font-medium hover:text-gold-600 transition-colors duration-200 text-lg"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Right Side */}
        <div className="hidden md:flex items-center gap-4 flex-shrink-0">
          <Button variant="outline">Login</Button>
          <Button variant="primary">Book Now</Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 ml-auto"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6 text-dark"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gold-100 shadow-md">
          <nav className="flex flex-col gap-4 p-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-dark hover:text-gold-600 transition-colors font-medium text-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="flex flex-col gap-3 pt-6 border-t border-gold-100">
              <Button variant="outline" className="w-full">
                Login
              </Button>
              <Button variant="primary" className="w-full">
                Book Now
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}