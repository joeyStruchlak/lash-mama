'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { ExclusiveSlot } from '@/types/exclusive-slot';

export default function HomePage() {
  const router = useRouter();
  const [exclusiveSlots, setExclusiveSlots] = useState<ExclusiveSlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExclusiveSlots();
  }, []);

  async function fetchExclusiveSlots() {
    try {
      const { data } = await supabase
        .from('exclusive_slots')
        .select('*')
        .eq('is_available', true)
        .order('slot_date', { ascending: true })
        .limit(4);

      setExclusiveSlots(data || []);
    } catch (err) {
      console.error('Error fetching slots:', err);
    } finally {
      setLoading(false);
    }
  }

  function formatSlotDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }

  function formatSlotTime(timeStr: string): string {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAF8F5' }}>
      {/* Hero Section - Exact from screenshot */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&q=80)',
            filter: 'brightness(1.1) contrast(0.95)',
          }}
        >
          {/* Soft overlay - exact from design */}
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(180deg, rgba(250,248,245,0.85) 0%, rgba(250,248,245,0.4) 40%, rgba(250,248,245,0.4) 60%, rgba(250,248,245,0.85) 100%)'
          }} />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto pt-32 pb-20">
          {/* Small label */}
          <p style={{
            fontSize: '11px',
            letterSpacing: '3px',
            color: '#B8956A',
            fontWeight: '600',
            marginBottom: '32px',
            textTransform: 'uppercase'
          }}>
            Luxury Lash Experience
          </p>
          
          {/* Main Heading - Exact typography */}
          <h1 style={{
            fontFamily: "'Playfair Display', 'Cormorant Garamond', serif",
            fontSize: 'clamp(48px, 7vw, 88px)',
            fontWeight: '600',
            lineHeight: '1.15',
            marginBottom: '28px',
            letterSpacing: '-0.02em'
          }}>
            <span style={{ color: '#2B2B2B' }}>Where Beauty</span>
            <br />
            <span style={{ color: '#B8956A' }}>Meets Elegance</span>
          </h1>

          {/* Description */}
          <p style={{
            fontSize: '17px',
            lineHeight: '1.7',
            color: '#5A5A5A',
            maxWidth: '650px',
            margin: '0 auto 48px',
            fontWeight: '400'
          }}>
            Lash extensions, facial styling, medical-grade skin treatments, and 
            professional beauty courses. Where luxury meets artistry in every detail.
          </p>

          {/* Stats - Exact spacing */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '80px',
            marginBottom: '56px',
            flexWrap: 'wrap'
          }}>
            <div>
              <p style={{
                fontSize: '42px',
                fontWeight: '600',
                color: '#B8956A',
                marginBottom: '4px',
                fontFamily: "'Playfair Display', serif"
              }}>500+</p>
              <p style={{ fontSize: '13px', color: '#6B6B6B', letterSpacing: '0.5px' }}>
                Happy Clients
              </p>
            </div>
            <div>
              <p style={{
                fontSize: '42px',
                fontWeight: '600',
                color: '#B8956A',
                marginBottom: '4px',
                fontFamily: "'Playfair Display', serif"
              }}>15+</p>
              <p style={{ fontSize: '13px', color: '#6B6B6B', letterSpacing: '0.5px' }}>
                Years Experience
              </p>
            </div>
            <div>
              <p style={{
                fontSize: '42px',
                fontWeight: '600',
                color: '#B8956A',
                marginBottom: '4px',
                fontFamily: "'Playfair Display', serif"
              }}>98%</p>
              <p style={{ fontSize: '13px', color: '#6B6B6B', letterSpacing: '0.5px' }}>
                Satisfaction
              </p>
            </div>
          </div>

          {/* CTA Buttons - Exact styling */}
          <div style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => router.push('/book')}
              style={{
                padding: '16px 40px',
                background: 'linear-gradient(135deg, #C9A872 0%, #B8956A 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 20px rgba(184, 149, 106, 0.25)',
                letterSpacing: '0.3px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 30px rgba(184, 149, 106, 0.35)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(184, 149, 106, 0.25)';
              }}
            >
              Book Your Appointment
            </button>
            
            <button
              onClick={() => router.push('/services')}
              style={{
                padding: '16px 40px',
                background: 'rgba(255, 255, 255, 0.9)',
                color: '#2B2B2B',
                border: '1.5px solid rgba(184, 149, 106, 0.3)',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)',
                letterSpacing: '0.3px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 1)';
                e.currentTarget.style.borderColor = 'rgba(184, 149, 106, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                e.currentTarget.style.borderColor = 'rgba(184, 149, 106, 0.3)';
              }}
            >
              Our Services
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: 'absolute',
          bottom: '32px',
          left: '50%',
          transform: 'translateX(-50%)',
          animation: 'bounce 2s infinite'
        }}>
          <div style={{
            width: '24px',
            height: '40px',
            border: '2px solid #B8956A',
            borderRadius: '20px',
            display: 'flex',
            justifyContent: 'center',
            paddingTop: '8px'
          }}>
            <div style={{
              width: '4px',
              height: '8px',
              background: '#B8956A',
              borderRadius: '2px',
              animation: 'scroll 2s infinite'
            }} />
          </div>
        </div>
      </section>

      {/* Exclusive Access Section - EXACT from screenshot */}
      <section style={{
        padding: '100px 24px',
        background: '#FAF8F5'
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{
            background: 'linear-gradient(135deg, #FFFFFF 0%, #FFFCF8 100%)',
            borderRadius: '32px',
            padding: 'clamp(48px, 8vw, 80px) clamp(32px, 6vw, 64px)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08), 0 8px 20px rgba(0, 0, 0, 0.04)',
            border: '1px solid rgba(184, 149, 106, 0.1)'
          }}>
            {/* Icon */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '24px'
            }}>
              <div style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #C9A872 0%, #B8956A 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(184, 149, 106, 0.3)'
              }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
            </div>

            {/* Label */}
            <p style={{
              textAlign: 'center',
              fontSize: '11px',
              letterSpacing: '3px',
              color: '#B8956A',
              fontWeight: '600',
              marginBottom: '16px',
              textTransform: 'uppercase'
            }}>
              Exclusive Access
            </p>

            {/* Heading */}
            <h2 style={{
              fontFamily: "'Playfair Display', 'Cormorant Garamond', serif",
              fontSize: 'clamp(36px, 5vw, 52px)',
              fontWeight: '600',
              textAlign: 'center',
              color: '#2B2B2B',
              marginBottom: '20px',
              letterSpacing: '-0.01em',
              lineHeight: '1.2'
            }}>
              Waiting List with Purni
            </h2>

            {/* Description */}
            <p style={{
              textAlign: 'center',
              fontSize: '17px',
              lineHeight: '1.7',
              color: '#5A5A5A',
              maxWidth: '700px',
              margin: '0 auto 40px',
              fontWeight: '400'
            }}>
              Get on the exclusive waiting list for appointments with{' '}
              <strong style={{ color: '#2B2B2B', fontWeight: '600' }}>Purni</strong>, 
              our CEO and Founder of Lash Mama. Limited availability for 
              our most discerning clients.
            </p>

            {/* Quote Box */}
            <div style={{
              background: 'linear-gradient(135deg, #F8F5F0 0%, #FAF8F5 100%)',
              borderRadius: '16px',
              padding: '32px 40px',
              marginBottom: '48px',
              border: '1px solid rgba(184, 149, 106, 0.15)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)'
            }}>
              <div style={{ display: 'flex', alignItems: 'start', gap: '20px' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="#B8956A" style={{ flexShrink: 0, marginTop: '4px' }}>
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                </svg>
                <div>
                  <p style={{
                    fontSize: '19px',
                    fontStyle: 'italic',
                    color: '#2B2B2B',
                    marginBottom: '12px',
                    lineHeight: '1.6',
                    fontFamily: "'Playfair Display', serif"
                  }}>
                    "Where luxury meets artistry"
                  </p>
                  <p style={{
                    fontSize: '14px',
                    color: '#6B6B6B',
                    fontWeight: '500'
                  }}>
                    — Purni, Lash Mama CEO
                  </p>
                </div>
              </div>
            </div>

            {/* Join Button */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '56px'
            }}>
              <button
                onClick={() => router.push('/book')}
                style={{
                  padding: '18px 48px',
                  background: 'linear-gradient(135deg, #C9A872 0%, #B8956A 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 8px 28px rgba(184, 149, 106, 0.3)',
                  letterSpacing: '0.3px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 12px 36px rgba(184, 149, 106, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 28px rgba(184, 149, 106, 0.3)';
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                Join Waiting List
              </button>
            </div>

            {/* Divider */}
            <div style={{
              height: '1px',
              background: 'linear-gradient(90deg, transparent 0%, rgba(184, 149, 106, 0.2) 50%, transparent 100%)',
              marginBottom: '48px'
            }} />

            {/* Available Slots Label */}
            <p style={{
              textAlign: 'center',
              fontSize: '14px',
              fontWeight: '600',
              color: '#2B2B2B',
              marginBottom: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              letterSpacing: '0.5px'
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B8956A" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              View Available Slots with Purni
            </p>

            {/* Slots Grid */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  border: '4px solid #F8F5F0',
                  borderTop: '4px solid #B8956A',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto'
                }} />
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '16px',
                maxWidth: '700px',
                margin: '0 auto'
              }}>
                {exclusiveSlots.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => router.push('/book')}
                    style={{
                      background: 'linear-gradient(135deg, #F8F5F0 0%, #FAF8F5 100%)',
                      border: '1px solid rgba(184, 149, 106, 0.15)',
                      borderRadius: '16px',
                      padding: '24px 20px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      textAlign: 'center',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #C9A872 0%, #B8956A 100%)';
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 12px 28px rgba(184, 149, 106, 0.25)';
                      const dateEl = e.currentTarget.querySelector('.slot-date') as HTMLElement;
                      const timeEl = e.currentTarget.querySelector('.slot-time') as HTMLElement;
                      if (dateEl) dateEl.style.color = 'white';
                      if (timeEl) timeEl.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #F8F5F0 0%, #FAF8F5 100%)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                      const dateEl = e.currentTarget.querySelector('.slot-date') as HTMLElement;
                      const timeEl = e.currentTarget.querySelector('.slot-time') as HTMLElement;
                      if (dateEl) dateEl.style.color = '#5A5A5A';
                      if (timeEl) timeEl.style.color = '#B8956A';
                    }}
                  >
                    <p className="slot-date" style={{
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#5A5A5A',
                      marginBottom: '8px',
                      transition: 'color 0.3s ease',
                      letterSpacing: '0.3px'
                    }}>
                      {formatSlotDate(slot.slot_date)}
                    </p>
                    <p className="slot-time" style={{
                      fontSize: '22px',
                      fontWeight: '700',
                      color: '#B8956A',
                      transition: 'color 0.3s ease',
                      fontFamily: "'Playfair Display', serif"
                    }}>
                      {formatSlotTime(slot.slot_time)}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Add keyframes for animations */}
      <style jsx global>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0) translateX(-50%); }
          50% { transform: translateY(-10px) translateX(-50%); }
        }
        @keyframes scroll {
          0% { opacity: 0; transform: translateY(0); }
          50% { opacity: 1; }
          100% { opacity: 0; transform: translateY(10px); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}