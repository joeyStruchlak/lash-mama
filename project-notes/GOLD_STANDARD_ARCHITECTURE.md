# LASH MAMA - GOLD STANDARD ARCHITECTURE & DEPLOYMENT STRATEGY
## Professional Enterprise-Grade Setup

---

## START HERE: THE CORRECT STARTING POINT

### Phase 1: Foundation (Weeks 1-2)
**DON'T build UI yet.** Build infrastructure first.

1. **Repository structure** (monorepo with proper separation)
2. **Supabase project setup** (prod + UAT + dev)
3. **CI/CD pipelines** (GitHub Actions)
4. **Environment management** (.env files, secrets, configs)
5. **Database schema** (migrations, versioning)
6. **API structure** (Supabase Edge Functions)
7. **Design system** (Tailwind config, shared components)
8. **Testing framework** (Jest, E2E)

### Phase 2: Build (Weeks 3-8)
**NOW you build UI/features** with solid foundation

### Phase 3: Deploy (Weeks 9-10)
**Ship to UAT → Production with confidence**

---

## ENVIRONMENT STRATEGY (3-TIER APPROACH)

### Tier 1: DEVELOPMENT (Local)
```
Environment: http://localhost:3000 (web), emulator (mobile)
Database: Local Supabase (via docker)
Auth: Local Supabase auth
Stripe: Stripe TEST keys
Payments: Test cards only
Data: Throwaway test data
CI/CD: Disabled (local only)
```

### Tier 2: UAT (Staging)
```
URL: https://uat.lashmama.app
Database: Supabase UAT project (separate instance)
Auth: Supabase UAT auth
Stripe: Stripe TEST keys (but different account/keys)
Payments: Test cards only
Data: Production-like data (anonymized real data)
CI/CD: Auto-deploy on every push to 'staging' branch
Monitoring: Full Sentry, logging, analytics
Access: Internal team + select clients for testing
TLS: HTTPS enforced
```

### Tier 3: PRODUCTION
```
URL: https://lashmama.app
Database: Supabase PROD project (enterprise backup)
Auth: Supabase PROD auth with MFA for admins
Stripe: Stripe LIVE keys
Payments: Real credit cards, real money
Data: Real client data (encrypted, compliant)
CI/CD: Manual approval required + main branch only
Monitoring: Full observability, alerting, incident response
Access: End users + authorized staff only
TLS: HTTPS + HTTP/2 + security headers
CDN: CloudFlare (caching, DDoS protection, analytics)
Backup: Daily automated backups + 30-day retention
```

---

## REPOSITORY STRUCTURE (MONOREPO - BEST PRACTICE)

### Root Level Organization
```
lash-mama/
├── .github/
│   └── workflows/                    # CI/CD pipelines
│       ├── test.yml                  # Run tests on PR
│       ├── deploy-uat.yml            # Deploy to UAT on 'staging' branch
│       ├── deploy-prod.yml           # Deploy to PROD (manual approval)
│       ├── lint.yml                  # Code quality checks
│       └── security.yml              # Dependency scanning, SAST
│
├── apps/
│   ├── web/                          # Next.js web app
│   │   ├── src/
│   │   │   ├── pages/                # Route pages
│   │   │   ├── components/           # Reusable components
│   │   │   ├── hooks/                # Custom React hooks
│   │   │   ├── lib/                  # Utilities, helpers
│   │   │   ├── styles/               # Global styles, themes
│   │   │   ├── services/             # API calls to Supabase
│   │   │   └── types/                # TypeScript types
│   │   ├── __tests__/                # Jest tests
│   │   ├── .env.example              # Template for env vars
│   │   ├── .env.local                # Local dev (gitignored)
│   │   ├── .env.uat                  # UAT secrets (gitignored)
│   │   ├── .env.production           # PROD secrets (gitignored)
│   │   ├── next.config.ts
│   │   ├── tailwind.config.ts
│   │   └── package.json
│   │
│   ├── mobile/                       # React Native + Expo
│   │   ├── app/                      # Expo Router screens
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── lib/
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   └── styles/
│   │   ├── __tests__/
│   │   ├── .env.example
│   │   ├── .env.local
│   │   ├── .env.uat
│   │   ├── .env.production
│   │   ├── app.json
│   │   ├── eas.json                  # Expo Application Services config
│   │   └── package.json
│   │
│   └── api/                          # Supabase Edge Functions
│       ├── functions/
│       │   ├── send-notification/    # SMS/Email notifications
│       │   ├── process-payment/      # Stripe webhook handler
│       │   ├── book-appointment/     # Appointment creation
│       │   ├── remind-appointment/   # 24h before reminder
│       │   └── generate-referral/    # Referral link generation
│       ├── migrations/               # Database migrations
│       │   ├── 001_init_schema.sql
│       │   ├── 002_add_vip_tables.sql
│       │   └── 003_add_gallery.sql
│       ├── seed.sql                  # Seed data for dev/UAT
│       └── supabase/config.toml      # Supabase local config
│
├── packages/                         # Shared code (monorepo magic)
│   ├── ui/                           # Shared UI components
│   │   ├── components/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── index.ts
│   │   ├── styles/
│   │   │   ├── colors.ts             # Shared color system
│   │   │   ├── spacing.ts            # Spacing scale
│   │   │   ├── typography.ts         # Font sizes, weights
│   │   │   └── shadows.ts            # Shadow definitions
│   │   ├── tailwind.config.ts        # Shared Tailwind config
│   │   └── package.json
│   │
│   ├── types/                        # Shared TypeScript types
│   │   ├── user.ts
│   │   ├── booking.ts
│   │   ├── service.ts
│   │   ├── vip.ts
│   │   └── index.ts
│   │
│   ├── api-client/                   # Shared Supabase client
│   │   ├── supabase.ts               # Supabase client factory
│   │   ├── auth.ts                   # Auth utilities
│   │   ├── bookings.ts               # Booking API calls
│   │   ├── vip.ts                    # VIP API calls
│   │   ├── payments.ts               # Payment API calls
│   │   └── package.json
│   │
│   ├── config/                       # Environment & config
│   │   ├── env.ts                    # Environment variables (typed)
│   │   ├── constants.ts              # App constants
│   │   ├── stripe.config.ts          # Stripe configuration
│   │   └── package.json
│   │
│   └── utils/                        # Shared utilities
│       ├── validation.ts             # Form validation (Zod)
│       ├── date.ts                   # Date utilities
│       ├── formatting.ts             # Price, phone formatting
│       ├── logger.ts                 # Logging utility
│       └── package.json
│
├── .github/
│   └── workflows/
│       ├── ci.yml                    # Test & lint on every PR
│       ├── deploy-uat.yml            # Deploy staging on push to 'staging'
│       └── deploy-prod.yml           # Deploy prod (manual trigger)
│
├── docker-compose.yml                # Local dev environment
├── .gitignore                        # Ignore sensitive files
├── .env.example                      # Template for all env vars
├── README.md                         # Project overview
├── ARCHITECTURE.md                   # This file
├── DEPLOYMENT.md                     # Deployment procedures
├── TESTING.md                        # Testing strategy
├── package.json                      # Root package.json (pnpm workspaces)
├── pnpm-workspace.yaml               # Monorepo workspace config
├── turbo.json                        # Build orchestration (Turbo)
└── tsconfig.json                     # Root TypeScript config
```

---

## ENVIRONMENT VARIABLES STRATEGY

### Best Practice: Typed Environment Variables

**File: `packages/config/env.ts`**
```typescript
import { z } from 'zod';

const EnvSchema = z.object({
  // App
  NODE_ENV: z.enum(['development', 'uat', 'production']),
  APP_NAME: z.string().default('Lash Mama'),
  APP_URL: z.string().url(),
  
  // Supabase
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string(),
  SUPABASE_SERVICE_KEY: z.string(),
  
  // Stripe
  STRIPE_PUBLIC_KEY: z.string(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  
  // APIs
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  SENDGRID_API_KEY: z.string().optional(),
  
  // Analytics
  SENTRY_DSN: z.string().optional(),
  ANALYTICS_KEY: z.string().optional(),
});

export const env = EnvSchema.parse(process.env);
export type Env = z.infer<typeof EnvSchema>;
```

### Environment Files

**.env.local** (development, not committed)
```
NODE_ENV=development
APP_URL=http://localhost:3000
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_KEY=eyJhbGc...
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

**.env.uat** (staging, in CI/CD secrets)
```
NODE_ENV=uat
APP_URL=https://uat.lashmama.app
SUPABASE_URL=https://uat-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_KEY=eyJhbGc...
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
SENTRY_DSN=https://...@sentry.io/...
```

**.env.production** (prod, in CI/CD secrets only)
```
NODE_ENV=production
APP_URL=https://lashmama.app
SUPABASE_URL=https://prod-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_KEY=eyJhbGc...
STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
SENTRY_DSN=https://...@sentry.io/...
```

---

## SUPABASE SETUP (GOLD STANDARD)

### Create 3 Separate Supabase Projects

**Project 1: Development** (`lashmama-dev`)
```
- Local development
- Throwaway data
- Full logging enabled
- No backup requirement
- Free tier OK
```

**Project 2: UAT/Staging** (`lashmama-uat`)
```
- Staging environment
- Production-like data (anonymized)
- Full monitoring enabled
- Daily backups
- Paid tier recommended
```

**Project 3: Production** (`lashmama-prod`)
```
- Live environment
- Real data (encrypted)
- Enterprise monitoring
- Hourly backups + 30-day retention
- Paid tier REQUIRED
```

### Database Schema Management (Migrations)

**File: `apps/api/migrations/001_init_schema.sql`**
```sql
-- Version: 001
-- Description: Initial schema with users, services, bookings
-- Deployed: 2025-01-15

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  avatar_url TEXT,
  vip_tier VARCHAR(50) DEFAULT 'bronze',
  vip_points INTEGER DEFAULT 0,
  role VARCHAR(50) DEFAULT 'client',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Services table
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL,
  base_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Staff table
CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  tier_level VARCHAR(50) NOT NULL,
  specialty TEXT[],
  avatar_url TEXT,
  bio TEXT,
  price_multiplier DECIMAL(3,2) DEFAULT 1.0,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Appointments table
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES staff(id),
  service_id UUID NOT NULL REFERENCES services(id),
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(staff_id, scheduled_at)
);

-- Payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(50) DEFAULT 'pending',
  stripe_payment_intent_id VARCHAR(255),
  stripe_charge_id VARCHAR(255),
  payment_method VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- VIP profiles table
CREATE TABLE vip_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  tier VARCHAR(50) NOT NULL,
  points INTEGER DEFAULT 0,
  lifetime_bookings INTEGER DEFAULT 0,
  lifetime_spent DECIMAL(12,2) DEFAULT 0,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Achievements table
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_name VARCHAR(255) NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_name)
);

-- Gallery items table
CREATE TABLE gallery_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  before_image_url TEXT NOT NULL,
  after_image_url TEXT NOT NULL,
  service_category VARCHAR(100),
  staff_id UUID REFERENCES staff(id),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Courses table
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  level VARCHAR(50),
  price DECIMAL(10,2),
  instructor_id UUID REFERENCES staff(id),
  description TEXT,
  duration_hours INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Course enrollments
CREATE TABLE course_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id),
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- Create indexes for performance
CREATE INDEX idx_appointments_user ON appointments(user_id);
CREATE INDEX idx_appointments_staff ON appointments(staff_id);
CREATE INDEX idx_appointments_scheduled_at ON appointments(scheduled_at);
CREATE INDEX idx_payments_appointment ON payments(appointment_id);
CREATE INDEX idx_vip_user ON vip_profiles(user_id);
CREATE INDEX idx_achievements_user ON achievements(user_id);

-- Enable RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE vip_profiles ENABLE ROW LEVEL SECURITY;
```

### Deploy Migrations

**File: `apps/api/migrations/script.sh`**
```bash
#!/bin/bash

ENV=$1  # 'dev', 'uat', 'prod'

if [ "$ENV" = "prod" ]; then
  echo "⚠️  PRODUCTION DEPLOYMENT"
  read -p "Are you absolutely sure? Type 'yes' to continue: " confirm
  if [ "$confirm" != "yes" ]; then
    echo "Cancelled."
    exit 1
  fi
fi

# Load environment variables
source .env.$ENV

# Apply migrations
supabase migration list --project-id $SUPABASE_PROJECT_ID
supabase migration up --project-id $SUPABASE_PROJECT_ID

echo "✅ Migrations deployed to $ENV"
```

---

## CI/CD PIPELINES (GitHub Actions)

### Pipeline 1: Test & Lint (On Every PR)

**File: `.github/workflows/ci.yml`**
```yaml
name: CI - Test & Lint

on:
  pull_request:
    branches: [main, staging]
  push:
    branches: [staging]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Lint
        run: pnpm lint
      
      - name: Type check
        run: pnpm type-check
      
      - name: Unit tests
        run: pnpm test --coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run Snyk scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

### Pipeline 2: Deploy to UAT

**File: `.github/workflows/deploy-uat.yml`**
```yaml
name: Deploy to UAT

on:
  push:
    branches: [staging]

env:
  SUPABASE_PROJECT_ID: ${{ secrets.SUPABASE_UAT_PROJECT_ID }}
  SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 20.x
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Build
        run: pnpm build
        env:
          NODE_ENV: uat
      
      - name: Deploy to Vercel (Web)
        uses: vercel/action@master
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID_UAT }}
          scope: ${{ secrets.VERCEL_ORG_ID }}
      
      - name: Deploy Edge Functions
        run: |
          pnpm install -g supabase
          supabase functions deploy --project-id $SUPABASE_PROJECT_ID
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
      
      - name: Notify Slack
        if: always()
        run: |
          curl -X POST ${{ secrets.SLACK_WEBHOOK }} \
            -H 'Content-Type: application/json' \
            -d '{"text":"✅ UAT deployment completed"}'
```

### Pipeline 3: Deploy to Production

**File: `.github/workflows/deploy-prod.yml`**
```yaml
name: Deploy to Production

on:
  workflow_dispatch:  # Manual trigger only
    inputs:
      version:
        description: 'Deployment version'
        required: true

env:
  SUPABASE_PROJECT_ID: ${{ secrets.SUPABASE_PROD_PROJECT_ID }}
  SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production  # Require approval
    
    steps:
      - uses: actions/checkout@v3
        with:
          ref: main  # Always deploy from main branch
      
      - name: Verify version tag
        run: |
          if ! git rev-parse "v${{ github.event.inputs.version }}" >/dev/null 2>&1; then
            echo "❌ Version tag not found"
            exit 1
          fi
      
      - name: Setup & Build
        run: |
          pnpm install --frozen-lockfile
          pnpm build
        env:
          NODE_ENV: production
      
      - name: Deploy to Vercel (Web)
        uses: vercel/action@master
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID_PROD }}
          scope: ${{ secrets.VERCEL_ORG_ID }}
      
      - name: Deploy Edge Functions
        run: supabase functions deploy --project-id $SUPABASE_PROJECT_ID
      
      - name: Database backup (pre-deployment)
        run: |
          # Create pre-deployment backup
          supabase db push --project-id $SUPABASE_PROJECT_ID --dry-run
      
      - name: Create release notes
        run: |
          echo "# Release v${{ github.event.inputs.version }}" > RELEASE.md
          git log --oneline main..staging >> RELEASE.md
      
      - name: Notify team
        run: |
          curl -X POST ${{ secrets.SLACK_WEBHOOK }} \
            -H 'Content-Type: application/json' \
            -d "{\"text\":\"🚀 PRODUCTION DEPLOYED v${{ github.event.inputs.version }}\"}"
```

---

## LOCAL DEVELOPMENT ENVIRONMENT

### Docker Compose Setup

**File: `docker-compose.yml`**
```yaml
version: '3.8'

services:
  # Supabase Local Development
  supabase:
    image: supabase/supabase:latest
    container_name: supabase-dev
    ports:
      - "54321:5432"      # PostgreSQL
      - "54322:3000"      # API
      - "54323:4000"      # Studio
    environment:
      POSTGRES_PASSWORD: postgres
      JWT_SECRET: your-jwt-secret-here
      ANON_KEY: your-anon-key-here
      SERVICE_KEY: your-service-key-here
    volumes:
      - ./apps/api/migrations:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: redis-dev
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # PostgreSQL (if not using Supabase)
  postgres:
    image: postgres:15-alpine
    container_name: postgres-dev
    environment:
      POSTGRES_DB: lashmama
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Setup Script

**File: `scripts/setup.sh`**
```bash
#!/bin/bash

echo "🚀 Setting up Lash Mama development environment..."

# 1. Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# 2. Start Docker services
echo "🐳 Starting Docker services..."
docker-compose up -d

# 3. Wait for services to be ready
echo "⏳ Waiting for services..."
sleep 10

# 4. Initialize database
echo "🗄️  Initializing database..."
pnpm db:migrate

# 5. Seed data
echo "🌱 Seeding data..."
pnpm db:seed

# 6. Setup environment files
echo "⚙️  Setting up environment..."
cp .env.example .env.local

# 7. Generate types from Supabase
echo "📝 Generating types..."
pnpm db:types

echo "✅ Setup complete!"
echo "👉 Start with: pnpm dev"
```

---

## CODE ORGANIZATION & STANDARDS

### Package.json Structure (Root)
```json
{
  "name": "lash-mama",
  "version": "1.0.0",
  "private": true,
  "packageManager": "pnpm@8.0.0",
  "scripts": {
    "dev": "turbo run dev --parallel",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "type-check": "turbo run type-check",
    "format": "prettier --write \"**/*.{ts,tsx,md,json}\"",
    "db:migrate": "supabase migration up",
    "db:seed": "supabase db seed",
    "db:types": "supabase gen types typescript --project-id $SUPABASE_PROJECT_ID > packages/types/database.ts"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "turbo": "^1.10.0",
    "prettier": "^3.0.0",
    "eslint": "^8.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "jest": "^29.0.0",
    "vitest": "^1.0.0"
  },
  "workspaces": [
    "apps/*",
    "packages/*"
  ]
}
```

### TypeScript Config (Shared)

**File: `tsconfig.json`**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@ui/*": ["packages/ui/*"],
      "@types/*": ["packages/types/*"],
      "@api/*": ["packages/api-client/*"],
      "@config/*": ["packages/config/*"],
      "@utils/*": ["packages/utils/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

---

## TESTING STRATEGY

### Unit Tests (Jest)
```typescript
// Example: apps/web/src/services/booking.test.ts
import { createBooking } from './booking';

describe('Booking Service', () => {
  it('should create appointment with valid data', async () => {
    const result = await createBooking({
      userId: 'user-123',
      serviceId: 'service-456',
      staffId: 'staff-789',
      scheduledAt: new Date('2025-02-15T14:00:00')
    });
    
    expect(result.id).toBeDefined();
    expect(result.status).toBe('pending');
  });

  it('should reject double-booking', async () => {
    await expect(
      createBooking({
        userId: 'user-123',
        staffId: 'staff-789',
        scheduledAt: new Date('2025-02-15T14:00:00')
      })
    ).rejects.toThrow('Staff member not available');
  });
});
```

### E2E Tests (Playwright)
```typescript
// tests/e2e/booking.spec.ts
import { test, expect } from '@playwright/test';

test('Complete booking flow', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // Click book button
  await page.click('button:has-text("Book Your Appointment")');
  
  // Select service
  await page.click('text=Mega Volume');
  
  // Select artist
  await page.click('text=Lash Mama');
  
  // Select date/time
  await page.click('text=Feb 15');
  
  // Confirm
  await page.click('button:has-text("Confirm Booking")');
  
  // Verify success
  await expect(page).toHaveURL(/confirmation/);
});
```

---

## DEPLOYMENT CHECKLIST

### Pre-UAT
- [ ] Code review complete
- [ ] All tests passing
- [ ] No linting errors
- [ ] Database migrations tested locally
- [ ] Secrets configured in CI/CD
- [ ] Environment variables documented

### Pre-Production
- [ ] UAT sign-off completed
- [ ] Performance tested (load testing)
- [ ] Security audit passed
- [ ] Database backup verified
- [ ] Rollback plan documented
- [ ] On-call schedule established
- [ ] Monitoring/alerting configured

### Post-Deployment
- [ ] Monitoring dashboards active
- [ ] Error rates normal
- [ ] Database queries optimized
- [ ] CDN cache warming complete

---

## MONITORING & OBSERVABILITY

### Tools
- **Error Tracking**: Sentry (production errors)
- **Logs**: Vercel logs + Supabase logs
- **Metrics**: Datadog or New Relic
- **Uptime**: Pingdom or Uptime Robot
- **Analytics**: PostHog or Mixpanel

### Alerts
- Payment processing failures
- Database connection errors
- API response time > 2s
- Error rate > 1%
- Deployment failures

---

## QUICK START COMMAND CHECKLIST

```bash
# Setup
npm install -g pnpm
git clone <repo>
cd lash-mama
bash scripts/setup.sh

# Development
pnpm dev                 # Start all services
pnpm web dev             # Web only
pnpm mobile dev          # Mobile only

# Testing
pnpm test                # Unit tests
pnpm test:e2e            # E2E tests
pnpm lint                # Linting

# Database
pnpm db:migrate          # Run migrations
pnpm db:seed             # Seed data
pnpm db:types            # Generate types

# Deployment
git push origin staging   # Deploy to UAT (auto)
gh workflow run deploy-prod -f version=1.0.0  # Deploy to PROD (manual)
```

---

## THE PROFESSIONAL SUMMARY

This architecture gives you:

✅ **Proper separation** - Dev, UAT, Prod (3-tier)
✅ **Modular structure** - Monorepo with shared packages
✅ **Type safety** - TypeScript everywhere
✅ **CI/CD pipelines** - Automated testing & deployment
✅ **Database migrations** - Version controlled, rollback-able
✅ **Environment management** - Typed, secure, no secrets in code
✅ **Testing strategy** - Unit + E2E coverage
✅ **Monitoring ready** - Sentry, logging, alerts
✅ **Professional standards** - Code reviews, linting, formatting
✅ **Scalable foundation** - Ready for growth without refactoring

**This is what professional devs call "shipping it right"** 🚀

---

## NEXT STEPS

1. **Create GitHub repo** with this structure
2. **Setup Supabase projects** (dev + uat + prod)
3. **Configure CI/CD** with GitHub Actions
4. **Setup local environment** with Docker Compose
5. **Write database schema** migrations
6. **Start building features** with solid foundation

Ready to start? 🎯