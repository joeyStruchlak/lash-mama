'use client';

import { Card } from '@/components/Card';
import { Button } from '@/components/Button';

const featuredProducts = [
    {
        id: 1,
        name: 'Lash Mama Lash Serum',
        price: 45,
        image: '💧',
    },
    {
        id: 2,
        name: 'Premium Lash Glue',
        price: 32,
        image: '🧴',
    },
    {
        id: 3,
        name: 'Luxury Makeup Palette',
        price: 72,
        image: '🎭',
    },
    {
        id: 4,
        name: 'Lash Cleaner',
        price: 28,
        image: '✨',
    },
];

const SHOPIFY_URL = 'https://db5421-f1.myshopify.com/'; 

export default function ShopPage() {
    return (
        <div className="min-h-screen bg-gold-50 py-12">
            <div className="max-w-6xl mx-auto px-6">
                {/* Header */}
                <div className="mb-12 text-center">
                    <h1 className="text-5xl font-serif font-bold text-dark mb-4">
                        Lash Mama Shop
                    </h1>
                    <p className="text-xl text-dark-secondary mb-8">
                        Premium beauty products curated by our team
                    </p>
                </div>

                {/* Featured Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                    {featuredProducts.map((product) => (
                        <a 
                            key={product.id} 
                            href={SHOPIFY_URL} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="cursor-pointer"
                        >
                            <Card className="p-6 h-full flex flex-col hover:shadow-lg transition-shadow">
                                {/* Product Image */}
                                <div className="bg-gradient-to-br from-gold-100 to-gold-50 rounded-lg p-8 mb-4 text-center min-h-40 flex items-center justify-center">
                                    <p className="text-7xl">{product.image}</p>
                                </div>

                                {/* Product Info */}
                                <h3 className="text-lg font-serif font-bold text-dark mb-2">
                                    {product.name}
                                </h3>

                                {/* Price */}
                                <p className="text-2xl font-bold text-gold-600 mb-4 flex-grow">
                                    ${product.price}
                                </p>

                                {/* View on Shopify Button */}
                                <Button variant="primary" className="w-full">
                                    View on Shopify
                                </Button>
                            </Card>
                        </a>
                    ))}
                </div>

            {/* Call to Action */}
            <Card className="p-12 text-center">
                <h2 className="text-3xl font-serif font-bold text-dark mb-4">
                    Explore More Products
                </h2>
                <p className="text-dark-secondary mb-8 max-w-2xl mx-auto">
                    Visit our full Shopify store to browse our complete collection of premium beauty products and professional tools.
                </p>
                <a href={SHOPIFY_URL} target="_blank" rel="noopener noreferrer">
                    <Button variant="primary" className="px-12">
                        Visit Full Shop
                    </Button>
                </a>
            </Card>
        </div>
    </div >
  );
}   