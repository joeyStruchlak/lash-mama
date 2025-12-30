'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/Card';
import { supabase } from '@/lib/supabase';

interface Service {
  id: string;
  name: string;
  category: string;
  duration: number;
  base_price: number;
  description: string;
  is_active: boolean;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  useEffect(() => {
    async function fetchServices() {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true });

      if (error) {
        console.error('Error fetching services:', error);
      } else {
        setServices(data || []);
      }
      setLoading(false);
    }

    fetchServices();
  }, []);

  // Group services by category
  const categories = Array.from(new Set(services.map((s) => s.category)));

  return (
    <div className="min-h-screen bg-gold-50 py-12">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-serif font-bold text-dark mb-4">
            Our Services
          </h1>
          <p className="text-xl text-dark-secondary">
            Premium beauty services tailored to your needs
          </p>
        </div>

        {loading ? (
          <div className="text-center text-dark-secondary">Loading services...</div>
        ) : (
          /* Categories */
          <div className="space-y-6">
            {categories.map((category) => {
              const categoryServices = services.filter((s) => s.category === category);
              const isExpanded = expandedCategory === category;

              return (
                <Card key={category} className="overflow-hidden">
                  {/* Category Header */}
                  <button
                    onClick={() =>
                      setExpandedCategory(isExpanded ? null : category)
                    }
                    className="w-full p-6 text-left flex justify-between items-center hover:bg-gold-50 transition-colors"
                  >
                    <div>
                      <h2 className="text-2xl font-serif font-bold text-dark">
                        {category}
                      </h2>
                      <p className="text-sm text-dark-secondary">
                        {categoryServices.length} service
                        {categoryServices.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div
                      className={`text-3xl text-gold-600 transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    >
                      ↓
                    </div>
                  </button>

                  {/* Services List */}
                  {isExpanded && (
                    <div className="border-t border-gold-100">
                      {categoryServices.map((service) => (
                        <div
                          key={service.id}
                          className="p-6 border-b border-gold-100 last:border-b-0 hover:bg-gold-50 transition-colors"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-xl font-serif font-bold text-dark">
                              {service.name}
                            </h3>
                            <span className="text-2xl font-bold text-gold-600">
                              ${service.base_price}
                            </span>
                          </div>
                          <p className="text-dark-secondary mb-2">
                            {service.description}
                          </p>
                          <p className="text-sm text-dark-secondary">
                            Duration: {service.duration} minutes
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}