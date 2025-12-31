import { VIPProgressBanner } from '@/components/VIPProgressBanner';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gold-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-20">
        <h1 className="text-5xl font-serif text-dark mb-6">
          Welcome to Lash Mama
        </h1>
        <p className="text-xl text-dark-secondary mb-12">
          Luxury beauty salon booking experience
        </p>

        {/* VIP Progress Banner - ADD HERE */}
        <div className="mb-12">
          <VIPProgressBanner />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg p-6 shadow-md">
            <h2 className="text-2xl font-serif mb-4">Book</h2>
            <p className="text-dark-secondary">
              Schedule your appointment with our expert artists
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md">
            <h2 className="text-2xl font-serif mb-4">VIP</h2>
            <p className="text-dark-secondary">
              Join our loyalty program and earn exclusive rewards
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md">
            <h2 className="text-2xl font-serif mb-4">Learn</h2>
            <p className="text-dark-secondary">
              Take our beauty courses and master new skills
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}