'use client';

import { useState } from 'react';
import { Card } from '@/components/Card';

const servicesData = [
  {
    category: 'Mega Volume',
    description: 'Bold, dramatic lashes with maximum volume',
    services: [
      { name: 'Mega Volume - Full Set', duration: '180 min', price: 250 },
      { name: 'Mega Volume - Refills', duration: '60 min', price: 80 },
    ],
  },
  {
    category: 'Volume',
    description: 'Full, voluminous lashes with natural appeal',
    services: [
      { name: 'Volume - Full Set', duration: '150 min', price: 200 },
      { name: 'Volume - Refills', duration: '60 min', price: 70 },
    ],
  },
  {
    category: 'Natural/Hybrid',
    description: 'Blend of natural and dramatic for everyday elegance',
    services: [
      { name: 'Natural/Hybrid - Full Set', duration: '120 min', price: 150 },
      { name: 'Natural/Hybrid - Refills', duration: '45 min', price: 60 },
    ],
  },
  {
    category: 'Makeup',
    description: 'Professional makeup application for any occasion',
    services: [
      { name: 'Bridal Makeup', duration: '90 min', price: 180 },
      { name: 'Event Makeup', duration: '60 min', price: 120 },
      { name: 'Everyday Makeup', duration: '45 min', price: 80 },
    ],
  },
  {
    category: 'Hair Styling',
    description: 'Expert hair styling for special occasions',
    services: [
      { name: 'Hair - Updo', duration: '90 min', price: 150 },
      { name: 'Hair - Curls', duration: '75 min', price: 120 },
    ],
  },
  {
    category: 'Bridal',
    description: 'Complete bridal beauty packages',
    services: [
      { name: 'Bridal Hair & Makeup', duration: '180 min', price: 300 },
      { name: 'Bridal Lashes', duration: '120 min', price: 200 },
    ],
  },
  {
    category: 'Packages',
    description: 'Bundled services at special pricing',
    services: [
      { name: 'Full Bridal Package', duration: '240 min', price: 450 },
      { name: 'Beauty Bundle', duration: '180 min', price: 350 },
    ],
  },
  {
    category: 'DIY Makeup Course',
    description: 'Learn makeup application at home',
    services: [
      { name: 'DIY Makeup Basics', duration: '120 min', price: 120 },
      { name: 'Advanced DIY Makeup', duration: '150 min', price: 180 },
    ],
  },
];

export default function ServicesPage() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gold-50 py-12">
      <div className="max-w-6xl mx-auto px-6">
        {/* Page Header */}
        <div className="mb-16">
          <h1 className="text-5xl font-serif font-bold text-dark mb-4">
            Our Services
          </h1>
          <p className="text-xl text-dark-secondary">
            Explore our complete range of beauty services
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 gap-8">
          {servicesData.map((categoryGroup) => (
            <Card key={categoryGroup.category} className="p-8">
              <button
                onClick={() =>
                  setExpandedCategory(
                    expandedCategory === categoryGroup.category
                      ? null
                      : categoryGroup.category
                  )
                }
                className="w-full text-left"
              >
                <h2 className="text-3xl font-serif font-bold text-dark mb-2 hover:text-gold-600 transition-colors">
                  {categoryGroup.category}
                </h2>
                <p className="text-dark-secondary mb-4">
                  {categoryGroup.description}
                </p>
              </button>

              {/* Expandable Services List */}
              {expandedCategory === categoryGroup.category && (
                <div className="mt-6 pt-6 border-t border-gold-100">
                  {categoryGroup.services.map((service) => (
                    <div
                      key={service.name}
                      className="flex justify-between items-center py-4 border-b border-gold-100 last:border-b-0"
                    >
                      <div>
                        <h3 className="font-serif font-semibold text-dark mb-1">
                          {service.name}
                        </h3>
                        <p className="text-sm text-dark-secondary">
                          {service.duration}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gold-600">
                          ${service.price}
                        </p>
                        <button className="text-gold-600 hover:text-gold-500 font-medium mt-2">
                          Book Now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}