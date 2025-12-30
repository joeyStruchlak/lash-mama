# Lash Mama - Luxury Beauty Salon Booking App

Premium beauty salon booking platform with gamified loyalty system, appointment management, and seamless payment processing.

## 🎯 Project Overview

**Lash Mama** is a luxury beauty booking application for high-end salon clients. Features include:
- Elegant appointment booking flow
- VIP gamification & loyalty tiers
- Stripe + Afterpay payments
- Staff management & scheduling
- Before/after gallery showcase
- Course enrollment system

## 🏗️ Architecture

Monorepo structure using **pnpm workspaces** and **Turbo**:
```
lash-mama/
├── apps/
│   ├── web/           # Next.js web application
│   ├── mobile/        # React Native + Expo app
│   └── api/           # Supabase Edge Functions
├── packages/
│   ├── ui/            # Shared UI components
│   ├── types/         # Shared TypeScript types
│   ├── api-client/    # Supabase client
│   ├── config/        # Environment & config
│   └── utils/         # Shared utilities
└── scripts/           # Setup & automation scripts
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ ([download](https://nodejs.org/))
- pnpm 8+ (`npm install -g pnpm`)
- Git

### Installation
```bash
# Clone the repository
git clone https://github.com/joeyStruchlak/lash-mama.git
cd lash-mama

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

## 📦 Available Commands
```bash
# Development
pnpm dev              # Start all dev servers

# Building
pnpm build            # Build all apps & packages

# Testing
pnpm test             # Run all tests
pnpm test:watch      # Run tests in watch mode

# Code Quality
pnpm lint             # Check code quality
pnpm format           # Format code with Prettier
pnpm type-check       # Check TypeScript types

# Database
pnpm db:migrate       # Run database migrations
pnpm db:seed          # Seed development data
pnpm db:types         # Generate TypeScript types
```

## 🌍 Environments

### Development
- Local environment for active development
- Local Supabase instance (Docker)
- Test Stripe keys

### UAT (Staging)
- URL: `https://uat.lashmama.app`
- Separate Supabase project
- Test Stripe keys
- Auto-deploys on `staging` branch

### Production
- URL: `https://lashmama.app`
- Live Supabase instance
- Live Stripe keys
- Manual deployment required

## 🗂️ Project Structure

### Apps

**`apps/web`** - Next.js Web Application
- Responsive web UI
- Server-side rendering
- API routes

**`apps/mobile`** - React Native + Expo
- iOS & Android support
- Cross-platform code sharing
- Native performance

**`apps/api`** - Supabase Edge Functions
- Appointment notifications
- Payment processing
- Business logic

### Packages

**`packages/ui`** - Shared Components
- Button, Card, Modal, etc.
- Design system (colors, typography, spacing)
- Reusable across web & mobile

**`packages/types`** - TypeScript Definitions
- User, Booking, Service types
- Shared across all apps

**`packages/api-client`** - Supabase Client
- Authentication utilities
- Booking API calls
- Payment integration

**`packages/config`** - Configuration
- Environment variables (typed)
- Stripe config
- App constants

**`packages/utils`** - Utilities
- Date formatting
- Phone number validation
- Price formatting
- Logging

## 💻 Tech Stack

### Frontend
- **Web**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Mobile**: React Native, Expo, NativeWind

### Backend
- **Database**: PostgreSQL (via Supabase)
- **Auth**: Supabase Auth
- **Functions**: Supabase Edge Functions
- **Storage**: Supabase Storage

### Payments
- **Primary**: Stripe
- **Alternative**: Afterpay (Pay in 4)

### DevOps
- **Package Manager**: pnpm
- **Build Tool**: Turbo
- **Code Quality**: ESLint, Prettier
- **Testing**: Jest, Vitest, Playwright
- **CI/CD**: GitHub Actions
- **Deployment**: Vercel (web), EAS (mobile)
- **Monitoring**: Sentry, Datadog

## 🔐 Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:
```bash
cp .env.example .env.local
```

Required variables:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `STRIPE_PUBLIC_KEY`

## 🧪 Testing
```bash
# Run all tests
pnpm test

# Run E2E tests
pnpm test:e2e

# Coverage report
pnpm test:coverage
```

## 🚢 Deployment

### Deploy to UAT (Auto)
```bash
git push origin staging
```

### Deploy to Production (Manual)
```bash
gh workflow run deploy-prod -f version=1.0.0
```

## 📚 Documentation

- [Architecture](./ARCHITECTURE.md) - System design & infrastructure
- [Requirements](./LASH_MAMA_REQUIREMENTS.md) - Feature specifications
- [Deployment](./DEPLOYMENT.md) - Deployment procedures

## 👥 Team

- **Developer**: You
- **Assistant**: Claude

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Commit changes: `git commit -m "Add my feature"`
3. Push to branch: `git push origin feature/my-feature`
4. Create Pull Request

## 📞 Support

For issues or questions, open a GitHub issue.

---

**Last Updated**: January 2025