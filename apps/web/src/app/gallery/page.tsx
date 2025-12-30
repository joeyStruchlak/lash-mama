'use client';

import { useState } from 'react';
import { Card } from '@/components/Card';

const galleryItems = [
    {
        id: 1,
        category: 'Mega Volume',
        artist: 'Lash Mama (Purni)',
        beforeImage: '👁️ Before',
        afterImage: '✨ After',
        description: 'Dramatic mega volume transformation',
        testimonial: 'Amazing results! My lashes look incredible!',
    },
    {
        id: 2,
        category: 'Natural/Hybrid',
        artist: 'Nikki & Beau',
        beforeImage: '👁️ Before',
        afterImage: '✨ After',
        description: 'Subtle natural hybrid set',
        testimonial: 'Perfect everyday look, so natural!',
    },
    {
        id: 3,
        category: 'Volume',
        artist: 'Natali',
        beforeImage: '👁️ Before',
        afterImage: '✨ After',
        description: 'Full voluminous lashes',
        testimonial: 'Best lash artist! Highly recommend!',
    },
    {
        id: 4,
        category: 'Mega Volume',
        artist: 'Lash Mama (Purni)',
        beforeImage: '👁️ Before',
        afterImage: '✨ After',
        description: 'Glamorous mega volume set',
        testimonial: 'Turned heads at the party!',
    },
    {
        id: 5,
        category: 'Natural/Hybrid',
        artist: 'Nikki & Beau',
        beforeImage: '👁️ Before',
        afterImage: '✨ After',
        description: 'Elegant hybrid lashes',
        testimonial: 'Love the natural look with volume!',
    },
    {
        id: 6,
        category: 'Volume',
        artist: 'Lash Mama (Purni)',
        beforeImage: '👁️ Before',
        afterImage: '✨ After',
        description: 'Stunning volume transformation',
        testimonial: 'Worth every penny!',
    },
];

const categories = [
    'All',
    'Mega Volume',
    'Volume',
    'Natural/Hybrid',
];

export default function GalleryPage() {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedItem, setSelectedItem] = useState<typeof galleryItems[0] | null>(null);

    const filteredItems =
        selectedCategory === 'All'
            ? galleryItems
            : galleryItems.filter((item) => item.category === selectedCategory);

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
                            className={`px-6 py-3 rounded-full font-serif font-bold transition-all ${selectedCategory === category
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
                                            <p className="text-4xl mb-2">{item.beforeImage}</p>
                                            <p className="text-sm font-serif font-bold text-dark">
                                                Before
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-center">
                                            <p className="text-2xl text-gold-600">→</p>
                                        </div>
                                        <div className="flex-1 text-center">
                                            <p className="text-4xl mb-2">{item.afterImage}</p>
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
                                        by {item.artist}
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
                        <Card className="max-w-2xl w-full p-8">
                            <button
                                onClick={() => setSelectedItem(null)}
                                className="float-right text-2xl font-bold text-dark hover:text-gold-600 mb-4"
                            >
                                ✕
                            </button>

                            <div className="flex gap-8 mb-6">
                                <div className="flex-1 text-center">
                                    <p className="text-6xl mb-4">{selectedItem.beforeImage}</p>
                                    <p className="font-serif font-bold text-dark">Before</p>
                                </div>
                                <div className="flex items-center justify-center">
                                    <p className="text-4xl text-gold-600">→</p>
                                </div>
                                <div className="flex-1 text-center">
                                    <p className="text-6xl mb-4">{selectedItem.afterImage}</p>
                                    <p className="font-serif font-bold text-dark">After</p>
                                </div>
                            </div>

                            <hr className="border-gold-200 my-6" />

                            <h2 className="text-3xl font-serif font-bold text-dark mb-2">
                                {selectedItem.description}
                            </h2>
                            <p className="text-dark-secondary mb-4">
                                by {selectedItem.artist}
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
                                    Book with {selectedItem.artist.split(' ')[0]}
                                </button>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}