'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/Card';
import { supabase } from '@/lib/supabase';

interface GalleryItem {
  id: string;
  category: string;
  artist_id: string;
  before_image_url: string;
  after_image_url: string;
  description: string;
  testimonial: string;
  is_featured: boolean;
}

interface Staff {
  id: string;
  name: string;
}

const categories = ['All', 'Mega Volume', 'Volume', 'Natural/Hybrid'];

export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const [galleryRes, staffRes] = await Promise.all([
        supabase.from('gallery_items').select('*').order('created_at', { ascending: false }),
        supabase.from('staff').select('id, name'),
      ]);

      if (galleryRes.data) setGalleryItems(galleryRes.data);
      if (staffRes.data) setStaff(staffRes.data);
      setLoading(false);
    }

    fetchData();
  }, []);

  const filteredItems =
    selectedCategory === 'All'
      ? galleryItems
      : galleryItems.filter((item) => item.category === selectedCategory);

  const getArtistName = (artistId: string) => {
    const artist = staff.find((s) => s.id === artistId);
    return artist?.name || 'Artist';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gold-50 py-12 flex items-center justify-center">
        <p className="text-xl text-dark-secondary">Loading gallery...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gold-50 py-12">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-serif font-bold text-dark mb-4">
            Lash Transformations
          </h1>
          <p className="text-xl text-dark-secondary">
            See the beautiful results from our talented artists
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex justify-center gap-4 mb-12 flex-wrap">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-3 rounded-full font-serif font-bold transition-all ${
                selectedCategory === category
                  ? 'bg-gold-600 text-white shadow-md'
                  : 'bg-white text-dark border-2 border-gold-200 hover:border-gold-600'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="cursor-pointer"
            >
              <Card className="p-0 overflow-hidden hover:shadow-lg transition-shadow h-full">
                {/* Before/After Container */}
                <div className="relative bg-gradient-to-r from-gold-100 to-gold-50 p-8 min-h-48 flex items-center justify-center">
                  <div className="flex gap-4 w-full">
                    <div className="flex-1 text-center">
                      <div className="w-full h-32 bg-gold-200 rounded-lg mb-2 overflow-hidden">
                        <img
                          src={item.before_image_url}
                          alt="Before"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-sm font-serif font-bold text-dark">
                        Before
                      </p>
                    </div>
                    <div className="flex items-center justify-center">
                      <p className="text-2xl text-gold-600">→</p>
                    </div>
                    <div className="flex-1 text-center">
                      <div className="w-full h-32 bg-gold-200 rounded-lg mb-2 overflow-hidden">
                        <img
                          src={item.after_image_url}
                          alt="After"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-sm font-serif font-bold text-dark">
                        After
                      </p>
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="p-6">
                  <h3 className="text-xl font-serif font-bold text-dark mb-2">
                    {item.description}
                  </h3>
                  <p className="text-sm text-dark-secondary mb-3">
                    by {getArtistName(item.artist_id)}
                  </p>
                  <p className="text-sm italic text-dark-secondary mb-4">
                    "{item.testimonial}"
                  </p>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-gold-50 text-dark-secondary rounded-full text-xs font-bold">
                      {item.category}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>

        {/* Lightbox Modal */}
        {selectedItem && (
          <div
            className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedItem(null)}
          >
            <Card className="max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setSelectedItem(null)}
                className="float-right text-2xl font-bold text-dark hover:text-gold-600 mb-4"
              >
                ✕
              </button>

              <div className="flex gap-8 mb-6">
                <div className="flex-1 text-center">
                  <div className="w-full h-64 bg-gold-200 rounded-lg mb-4 overflow-hidden">
                    <img
                      src={selectedItem.before_image_url}
                      alt="Before"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="font-serif font-bold text-dark">Before</p>
                </div>
                <div className="flex items-center justify-center">
                  <p className="text-4xl text-gold-600">→</p>
                </div>
                <div className="flex-1 text-center">
                  <div className="w-full h-64 bg-gold-200 rounded-lg mb-4 overflow-hidden">
                    <img
                      src={selectedItem.after_image_url}
                      alt="After"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="font-serif font-bold text-dark">After</p>
                </div>
              </div>

              <hr className="border-gold-200 my-6" />

              <h2 className="text-3xl font-serif font-bold text-dark mb-2">
                {selectedItem.description}
              </h2>
              <p className="text-dark-secondary mb-4">
                by {getArtistName(selectedItem.artist_id)}
              </p>
              <p className="text-lg italic text-dark-secondary mb-6">
                "{selectedItem.testimonial}"
              </p>

              <span className="inline-block px-4 py-2 bg-gold-50 text-dark-secondary rounded-full font-bold mb-6">
                {selectedItem.category}
              </span>

              <div className="flex gap-4">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="flex-1 px-6 py-3 bg-gold-100 text-dark rounded-lg font-bold hover:bg-gold-200 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="flex-1 px-6 py-3 bg-gold-600 text-white rounded-lg font-bold hover:bg-gold-500 transition-colors"
                >
                  Book with {getArtistName(selectedItem.artist_id).split(' ')[0]}
                </button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}