'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, Clock } from 'lucide-react';
import Link from 'next/link';

interface Service {
  id: string;
  name: string;
  category: string;
  duration_minutes: number;
  base_price: number;
  description: string;
  is_active: boolean;
  image_url: string;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All Services');
  const [searchQuery, setSearchQuery] = useState('');

  const serviceImages: Record<string, string> = {
    'Mega Volume Full Set': 'https://cdn.shopify.com/s/files/1/0619/3437/1060/files/Volume_Lash_Extensions.webp?v=1750251907',
    'Mega Volume Refills': 'https://thumbs.dreamstime.com/b/close-up-female-eye-eyelash-extensions-beauty-salon-treatment-black-classical-d-volume-d-volume-lashes-close-up-385654127.jpg',
    'Mega Volume Mini Refills': 'https://thelashspa.com.au/wp-content/uploads/2021/02/Heavy-volume-lashes-Gold-Coast.jpg',
    'Volume Full Set': 'https://lilacst.com/cdn/shop/files/shutterstock_1922854262_2_c13c7c7c-2b12-4a88-904b-9c48c4da449b.png?v=1718890701&width=1500',
    'Volume Refills': 'https://www.shutterstock.com/image-photo/close-eye-eyelash-extensions-beauty-260nw-2402801341.jpg',
    'Volume Mini Refills': 'https://lashesbyshigeru.com/wp-content/uploads/2025/12/Introduction.png',
    'Natural/Hybrid Full Set': 'https://www.lashify.com/cdn/shop/articles/whispy_a4132c2f-39b8-49fc-8bba-bd1f2ef5ab9d.jpg?crop=center&height=1024&v=1744976399&width=1024',
    'Natural/Hybrid Refills': 'https://www.shutterstock.com/image-photo/close-eye-eyelash-extensions-beauty-260nw-2402801341.jpg',
    'Natural/Hybrid Mini Refills': 'http://curacoro.com/cdn/shop/articles/4-eye-shapes-that-work-best-with-hybrid-cat-eyelashes.jpg?v=1686112712',
    'Makeup and Hair Package': 'http://www.lilyengland.com/cdn/shop/collections/Styled-2_d1c8696c-2520-416a-b525-e01c91de96a3_1200x630.jpg?v=1666640776',
    'Bridal Makeup & Hair Package': 'https://media-api.xogrp.com/images/a66c6f07-39c5-42f4-8ecc-011e51790bb4~rs_768.h-cr_151.0.2200.1537',
  };

  useEffect(() => {
    async function fetchServices() {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true });

      if (error) {
        console.error('Error:', error);
      } else {
        const enhanced = (data || []).map(s => ({
          ...s,
          image_url: serviceImages[s.name] || 'https://via.placeholder.com/800x600/F5F2EF/3D3D3D?text=' + encodeURIComponent(s.name)
        }));
        setServices(enhanced);
      }
      setLoading(false);
    }
    fetchServices();
  }, []);

  const categories = ['All Services', ...Array.from(new Set(services.map(s => s.category)))];
  
  const filtered = services
    .filter(s => selectedCategory === 'All Services' || s.category === selectedCategory)
    .filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const grouped = filtered.reduce((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {} as Record<string, Service[]>);

  return (
    <div className="min-h-screen bg-[#FAFAF7]">
      {/* Hero */}
      <div className="py-20 bg-gradient-to-b from-[#F5F2EF]/40 to-[#FAFAF7]">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-[#2A2A2A] mb-6" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Services & Pricing
          </h1>
          <p className="text-lg text-[#3D3D3D] max-w-3xl mx-auto mb-12">
            Explore our full range of beauty services. Each treatment is customized to your unique features and preferences.
          </p>

          {/* Search */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-[#3D3D3D]" />
              <input
                type="text"
                placeholder="Search services..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-16 pr-8 py-5 rounded-full bg-white border border-[#E5E7EB] text-lg focus:outline-none focus:ring-4 focus:ring-[#C9A871]/20"
              />
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-8 py-4 rounded-full font-medium text-lg transition-all duration-300 ${
                  selectedCategory === cat
                    ? 'bg-[#C9A871] text-white shadow-xl'
                    : 'bg-white text-[#2A2A2A] border border-[#E5E7EB] hover:border-[#C9A871] hover:shadow-md'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        {loading ? (
          <div className="text-center py-32">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-6 border-[#C9A871] border-t-transparent" />
            <p className="mt-6 text-xl text-[#3D3D3D]">Curating your beauty experience...</p>
          </div>
        ) : (
          <div className="space-y-32">
            {Object.entries(grouped).map(([category, items]) => (
              <section key={category}>
                <div className="mb-12 text-left">
                  <h2 className="text-4xl font-bold text-[#2A2A2A] mb-3" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                    {category}
                  </h2>
                  <p className="text-lg text-[#3D3D3D]">
                    {items.length} {items.length === 1 ? 'service' : 'services'} available
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {items.map((service) => (
                    <Link href="/book" key={service.id}>
                      <div className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500">
                        {/* Fixed Height Image Container */}
                        <div className="relative h-80 overflow-hidden bg-[#F5F2EF]/30">
                          <img
                            src={service.image_url}
                            alt={service.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          {/* Price Badge */}
                          <div className="absolute top-6 right-6 bg-white px-6 py-3 rounded-full shadow-xl">
                            <span className="text-2xl font-bold text-[#C9A871]">${service.base_price}</span>
                          </div>
                          {/* Category Label */}
                          <div className="absolute bottom-6 left-6 bg-[#2A2A2A]/70 backdrop-blur-sm px-4 py-2 rounded-full">
                            <span className="text-sm text-white font-medium uppercase tracking-wider">
                              {service.category}
                            </span>
                          </div>
                        </div>

                        {/* Fixed Height Body */}
                        <div className="p-8 h-64 flex flex-col justify-between">
                          <div>
                            <h3 className="text-xl font-bold text-[#2A2A2A] mb-3 group-hover:text-[#C9A871] transition-colors" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                              {service.name}
                            </h3>
                            <p className="text-[#3D3D3D] text-sm leading-relaxed line-clamp-3">
                              {service.description}
                            </p>
                          </div>

                          <div className="flex items-center justify-between mt-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#C9A871]/20 flex items-center justify-center">
                                <Clock className="w-4 h-4 text-[#C9A871]" />
                              </div>
                              <span className="text-[#3D3D3D] font-medium">{service.duration_minutes} min</span>
                            </div>
                            <button className="px-8 py-3 bg-[#C9A871] text-white font-medium rounded-full hover:bg-[#D4AF37] transition-colors shadow-md hover:shadow-lg">
                              Book →
                            </button>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      {/* Booking Policy */}
      <div className="bg-[#F5F2EF] py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h3 className="text-3xl font-bold text-[#2A2A2A] mb-6" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Booking Policy
          </h3>
          <p className="text-lg text-[#3D3D3D] leading-relaxed">
            A deposit of 20-35% is required to secure your appointment. This will be applied to your service total. Cancellations require 24-hour notice.
          </p>
        </div>
      </div>
    </div>
  );
}