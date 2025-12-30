'use client';

import { useState } from 'react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';

const services = [
    { id: 'mega-volume', name: 'Mega Volume Full Set', price: 250, duration: 180 },
    { id: 'mega-refill', name: 'Mega Volume Refills', price: 80, duration: 60 },
    { id: 'volume-set', name: 'Volume Full Set', price: 200, duration: 150 },
    { id: 'volume-refill', name: 'Volume Refills', price: 70, duration: 60 },
    { id: 'natural-set', name: 'Natural/Hybrid Full Set', price: 150, duration: 120 },
    { id: 'natural-refill', name: 'Natural/Hybrid Refills', price: 60, duration: 45 },
];

const staff = [
    {
        id: 'purni',
        name: 'Lash Mama (Purni)',
        tier: 'Premium',
        priceMultiplier: 1.25,
        avatar: '👑',
    },
    {
        id: 'nikki',
        name: 'Nikki & Beau',
        tier: 'Senior',
        priceMultiplier: 1.0,
        avatar: '⭐',
    },
    {
        id: 'natali',
        name: 'Natali',
        tier: 'Junior',
        priceMultiplier: 0.85,
        avatar: '✨',
    },
];

interface BookingState {
    step: 1 | 2 | 3 | 4;
    serviceId?: string;
    staffId?: string;
    date?: string;
    time?: string;
}

export function BookingWizard() {
    const [booking, setBooking] = useState<BookingState>({ step: 1 });

    const selectedService = services.find((s) => s.id === booking.serviceId);
    const selectedStaff = staff.find((s) => s.id === booking.staffId);

    const finalPrice = selectedService && selectedStaff
        ? selectedService.price * selectedStaff.priceMultiplier
        : 0;

    const handleNext = () => {
        if (booking.step < 4) {
            setBooking({ ...booking, step: (booking.step + 1) as any });
        }
    };

    const handleBack = () => {
        if (booking.step > 1) {
            setBooking({ ...booking, step: (booking.step - 1) as any });
        }
    };

    return (
        <div className="min-h-screen bg-gold-50 py-12">
            <div className="max-w-2xl mx-auto px-6">
                {/* Progress Bar */}
                <div className="mb-12">
                    <div className="flex justify-between mb-4">
                        {[1, 2, 3, 4].map((step) => (
                            <div
                                key={step}
                                className={`flex items-center justify-center w-12 h-12 rounded-full font-bold ${step <= booking.step
                                    ? 'bg-gold-600 text-white'
                                    : 'bg-gold-100 text-dark'
                                    }`}
                            >
                                {step}
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <div className={`flex-1 h-1 rounded-full ${booking.step >= 1 ? 'bg-gold-600' : 'bg-gold-100'}`} />
                        <div className={`flex-1 h-1 rounded-full ${booking.step >= 2 ? 'bg-gold-600' : 'bg-gold-100'}`} />
                        <div className={`flex-1 h-1 rounded-full ${booking.step >= 3 ? 'bg-gold-600' : 'bg-gold-100'}`} />
                        <div className={`flex-1 h-1 rounded-full ${booking.step >= 4 ? 'bg-gold-600' : 'bg-gold-100'}`} />
                    </div>
                </div>

                <Card className="p-8">
                    {/* STEP 1: Select Service */}
                    {booking.step === 1 && (
                        <div>
                            <h2 className="text-3xl font-serif font-bold text-dark mb-6">
                                Step 1: Select Service
                            </h2>
                            <div className="space-y-4">
                                {services.map((service) => (
                                    <button
                                        key={service.id}
                                        onClick={() => setBooking({ ...booking, serviceId: service.id })}
                                        className={`w-full p-4 text-left border-2 rounded-lg transition-all ${booking.serviceId === service.id
                                            ? 'border-gold-600 bg-gold-50'
                                            : 'border-gold-100 hover:border-gold-600'
                                            }`}
                                    >
                                        <h3 className="font-serif font-bold text-dark">
                                            {service.name}
                                        </h3>
                                        <p className="text-sm text-dark-secondary">
                                            {service.duration} min • ${service.price}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* STEP 2: Select Staff */}
                    {booking.step === 2 && (
                        <div>
                            <h2 className="text-3xl font-serif font-bold text-dark mb-6">
                                Step 2: Select Artist
                            </h2>
                            <div className="space-y-4">
                                {staff.map((artist) => (
                                    <button
                                        key={artist.id}
                                        onClick={() => setBooking({ ...booking, staffId: artist.id })}
                                        className={`w-full p-4 text-left border-2 rounded-lg transition-all ${booking.staffId === artist.id
                                            ? 'border-gold-600 bg-gold-50'
                                            : 'border-gold-100 hover:border-gold-600'
                                            }`}
                                    >
                                        <h3 className="font-serif font-bold text-dark">
                                            {artist.avatar} {artist.name}
                                        </h3>
                                        <p className="text-sm text-dark-secondary">
                                            {artist.tier} Artist
                                            {artist.priceMultiplier > 1 && ` • +${((artist.priceMultiplier - 1) * 100).toFixed(0)}%`}
                                            {artist.priceMultiplier < 1 && ` • -${((1 - artist.priceMultiplier) * 100).toFixed(0)}%`}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* STEP 3: Select Date & Time */}
                    {booking.step === 3 && (
                        <div>
                            <h2 className="text-3xl font-serif font-bold text-dark mb-6">
                                Step 3: Select Date & Time
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block font-serif font-bold text-dark mb-2">
                                        Date
                                    </label>
                                    <input
                                        type="date"
                                        value={booking.date || ''}
                                        onChange={(e) =>
                                            setBooking({ ...booking, date: e.target.value })
                                        }
                                        className="w-full p-3 border-2 border-gold-200 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block font-serif font-bold text-dark mb-2">
                                        Time
                                    </label>
                                    <select
                                        value={booking.time || ''}
                                        onChange={(e) =>
                                            setBooking({ ...booking, time: e.target.value })
                                        }
                                        className="w-full p-3 border-2 border-gold-200 rounded-lg"
                                    >
                                        <option value="">Select a time</option>
                                        <option value="09:00">9:00 AM</option>
                                        <option value="10:00">10:00 AM</option>
                                        <option value="11:00">11:00 AM</option>
                                        <option value="12:00">12:00 PM</option>
                                        <option value="13:00">1:00 PM</option>
                                        <option value="14:00">2:00 PM</option>
                                        <option value="15:00">3:00 PM</option>
                                        <option value="16:00">4:00 PM</option>
                                        <option value="17:00">5:00 PM</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 4: Confirm & Payment */}
                    {booking.step === 4 && (
                        <div>
                            <h2 className="text-3xl font-serif font-bold text-dark mb-6">
                                Step 4: Confirm & Pay
                            </h2>
                            <div className="space-y-4 mb-8 p-4 bg-gold-50 rounded-lg">
                                <div className="flex justify-between">
                                    <span className="text-dark-secondary">Service:</span>
                                    <span className="font-bold text-dark">{selectedService?.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-dark-secondary">Artist:</span>
                                    <span className="font-bold text-dark">{selectedStaff?.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-dark-secondary">Date:</span>
                                    <span className="font-bold text-dark">{booking.date}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-dark-secondary">Time:</span>
                                    <span className="font-bold text-dark">{booking.time}</span>
                                </div>
                                <div className="pt-4 border-t-2 border-gold-200 flex justify-between">
                                    <span className="font-bold text-dark">Total:</span>
                                    <span className="text-3xl font-bold text-gold-600">
                                        ${finalPrice.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                            <p className="text-sm text-dark-secondary mb-6">
                                Pay in 4 interest-free payments with Afterpay
                            </p>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex gap-4 mt-8">
                        <Button
                            variant="outline"
                            onClick={handleBack}
                            disabled={booking.step === 1}
                            className="disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Back
                        </Button>
                        {booking.step < 4 ? (
                            <Button
                                variant="primary"
                                onClick={() => {
                                    if (booking.step === 1 && booking.serviceId) {
                                        handleNext();
                                    } else if (booking.step === 2 && booking.staffId) {
                                        handleNext();
                                    } else if (booking.step === 3 && booking.date && booking.time) {
                                        handleNext();
                                    }
                                }}
                                disabled={
                                    (booking.step === 1 && !booking.serviceId) ||
                                    (booking.step === 2 && !booking.staffId) ||
                                    (booking.step === 3 && (!booking.date || !booking.time))
                                }
                                className="flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </Button>
                        ) : (
                            <Button variant="primary" className="flex-1">
                                Complete Booking
                            </Button>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}