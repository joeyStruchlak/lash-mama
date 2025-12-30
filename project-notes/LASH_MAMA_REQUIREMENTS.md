# LASH MAMA - LUXURY BEAUTY BOOKING APP
## Complete Requirements Document

---

## PROJECT OVERVIEW

**App Name**: Lash Mama
**Type**: Luxury Beauty Salon Booking & Management Platform
**Primary Users**: High-end beauty salon clients + staff management
**Core USP**: Premium, elegant, gamified loyalty experience for beauty services

---

## TECH STACK (LOCKED IN)

- **Frontend**: React Native + Expo (iOS, Android, Web)
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Styling**: NativeWind (Tailwind for React Native)
- **Payments**: Stripe + Afterpay (Pay in 4)
- **Design Philosophy**: Luxury boutique aesthetic (Glossier/Goop inspired)

---

## DESIGN SYSTEM & BRANDING

### Color Palette
- **Primary Gold**: #C9A871 (warm, luxurious)
- **Dark Charcoal**: #2A2A2A (text, headers)
- **Cream/Beige**: #FAFAF7 (backgrounds)
- **Warm Off-White**: #F5F2EF
- **Accent Gold**: #D4AF37 (CTAs, highlights)
- **Secondary Dark**: #3D3D3D (subtle text)

### Typography
- **Display/Headings**: Cormorant Garamond (elegant serif)
- **Body Text**: Inter or Sohne (clean, professional)
- **Accent/Luxury**: Shimmer gold gradient text for hero sections

### Visual Elements
- NO EMOJIS (removed entirely)
- Golden gradient overlays on cards
- Soft shadows (0 4px 12px rgba(0,0,0,0.12))
- Shimmer sweep effects on buttons
- Radial gold glows on VIP elements
- Smooth micro-interactions & animations
- Generous whitespace
- Refined, minimal aesthetic

### Feel & Experience
- Super feminine, elegant, sophisticated
- High-end boutique experience
- Smooth, polished interactions
- Luxury gradients (not overdone)
- Professional, clean interfaces

---

## CORE FEATURES

### 1. HOME PAGE / MAIN NAVIGATION

**Current State**: 5 elegant golden buttons (smaller, not cards)
- Button 1: "Book Your Appointment" (standard styling)
- Button 2: "Our Services" (standard styling)
- Button 3: "VIP Clients" (SPECIAL EFFECT - stands out more, diamond icon, glow effect)
- Button 4: "Shop" (standard styling)
- Button 5: "Courses" (standard styling)

**Content Areas Removed**:
- "Curated Lash Experience" section
- "About Us" section
- "Waiting List with Purni" (now in secondary section: "View Next Available Slots with Purni")

**Additional Home Features**:
- ShopPreview section (featured products with real images)
- VIP Preview section (teaser for loyalty program)
- Referral Program banner ("$25 give/get")
- Featured courses section
- "View Next Available Slots with Purni" CTA

---

### 2. BOOKING FLOW (4-STEP PROCESS)

**Step 1: Select Service**
- Expandable service categories:
  - **Mega Volume**: Full Set, Refills
  - **Volume**: Full Set, Refills
  - **Natural/Hybrid**: Full Set, Refills
  - **Makeup**: Various makeup services
  - **Hair Styling**: Updo, Curls
  - **Bridal**: Bridal Makeup, Bridal Hair
  - **Packages**: Bundled services
  - **DIY Makeup Course**: Educational package

**Step 2: Select Artist/Staff**
- 4 Staff Members:
  - **Lash Mama (Purni)**: Premium (+25% surcharge), CEO profile, top tier
  - **Nikki & Beau**: Senior artists (standard rate)
  - **Natali**: Junior artist (-15% discount, supervised)
- Display staff with:
  - Profile picture (beautiful, professional)
  - Name & tier level
  - Experience level badge
  - Price adjustment indicator

**Step 3: Select Date & Time**
- Calendar view with available slots
- Real-time availability updates
- Display wait times if applicable

**Step 4: Confirm & Payment**
- Order summary
- Deposit payment via Stripe
- Afterpay option ("Pay in 4" with badge)
- Optional VIP recurring booking toggle:
  - Weekly recurring
  - Bi-weekly recurring
  - Monthly recurring

---

### 3. SERVICES PAGE

**Features**:
- Browse all services with expandable categories
- Service descriptions
- Pricing (with staff tier adjustments)
- Filtering & search functionality
- Beautiful card components with hover animations
- Category breakdown with visual hierarchy

---

### 4. VIP CLIENTS SECTION (GAMIFIED LOYALTY)

**VIP Portal Access** (separate /vip route):

#### 4.1 Gamification & Loyalty Tiers
- **Tier System** (progression: Bronze → Silver → Gold → Platinum → Diamond)
- **Points System**: 
  - Earn points per booking
  - Points accumulate toward tier upgrades
  - Redemption for rewards
  
#### 4.2 VIP Dashboard Components

**Loyalty Stats Display**:
- Current tier level with visual indicator
- Points balance & progress to next tier
- Lifetime bookings count
- Member since date
- Next reward milestone

**Achievements Section**:
- Unlocked achievements with descriptions
- "Longest Serving Regular Client" badge
- Service milestone badges (10 bookings, 50 bookings, etc.)
- Referral achievements
- Seasonal/event achievements

**Booking History**:
- Complete past booking list
- Service details, artist, date, price
- Ability to view receipt
- Re-book with same artist/service option
- Filter by date range

**Rewards Redemption**:
- Available rewards with point costs
- Redeemed rewards history
- Exclusive VIP perks (early access, discounts, etc.)
- Free service upgrades available

#### 4.3 VIP Profile Examples
- 5 example VIP profiles displaying on the VIP page:
  - Profile picture
  - Name
  - VIP tier level with diamond badge
  - Points balance
  - Booking count
  - Member since date
  - Show variety of tier levels (Bronze, Silver, Gold, Platinum, Diamond)

#### 4.4 My Notes Tab (New Addition)
- Add personal notes/reminders about beauty appointments
- Editable notes area
- Save reminders
- View previous notes history
- Quick access notes for appointment scheduling

#### 4.5 Referral Program Integration
- "$25 give/get" referral banner
- Referral link generation
- Referral modal with sharing options
- Referral tracking & earnings

---

### 5. SHOP PAGE

**Features**:
- Shopify store integration/product showcase
- Featured products with beautiful imagery
- Product cards with:
  - Image
  - Name
  - Price
  - Brief description
  - "View More" or direct purchase link
- Grid layout (responsive mobile-first)
- Shop preview on home page
- Link to full Shopify store

---

### 6. COURSES PAGE

**Course Listings** (6 courses available):

1. **VIP Vogue One-on-One Lash Course**
   - Premium individual training
   - Highest price tier
   - Exclusive for VIP members
   - Personalized instruction

2. **Platinum Lash Course**
   - Advanced techniques
   - Premium pricing
   - Small group or 1-on-1 option

3. **Silver Lash Course**
   - Intermediate level
   - Foundational techniques
   - Group class format
   - Moderate pricing

4. **Gold Lash Course**
   - Beginner-friendly
   - Introduction to lashing
   - Most affordable
   - Group setting

5. **DIY Makeup Course**
   - Self-application techniques
   - Product knowledge
   - At-home styling tips
   - Beginner to intermediate

6. **Masterclass & Hairstyling**
   - Advanced hair techniques
   - Updo specialization
   - Bridal styling focus
   - Premium group workshop

**Course Display**:
- Course cards with:
  - Course name
  - Description
  - Duration
  - Price
  - Level (Beginner/Intermediate/Advanced)
  - Instructor (which staff member)
  - "Enroll" or "Learn More" button
- Beautiful, elegant layout
- Responsive grid

---

### 7. GALLERY / BEFORE & AFTER SHOWCASE (NEW FEATURE)

**Before & After Lash Transformations**:
- Elegant grid layout of transformations
- Categories:
  - Mega Volume transforms
  - Natural/Hybrid transforms
  - Special occasion lashes
  - Client stories with results

**Features**:
- Side-by-side before/after images
- Lightbox/modal view for enlarged viewing
- Smooth transitions & animations
- Client testimonials (optional captions)
- Artist attribution (which staff member)
- Filter by service type
- Infinite scroll or pagination

---

### 8. USER AUTHENTICATION

**Features** (via Supabase Auth):
- Email/password signup & login
- Optional social login (Google, Apple)
- Persistent user sessions
- User profile management
- Saved preferences
- Booking history tied to account

---

### 9. HEADER / NAVIGATION

**Header Elements**:
- Lash Mama logo
- Navigation menu with routes:
  - Home
  - Book
  - Services
  - VIP
  - Shop
  - Courses
  - Gallery (new)
- User account icon (if logged in)
- Mobile menu (hamburger for mobile)
- Responsive design

---

### 10. STAFF PROFILES (ENHANCEMENT)

**Profile Display**:
- Beautiful round profile photos
- Name & tier badge
- Experience level
- Specialties
- Bio/description
- Availability status
- Price adjustment indicator
- View full profile / Book with this artist

---

### 11. AFTERPAY INTEGRATION

**Implementation**:
- "Pay in 4" badge on booking confirmation
- Tooltip explaining Afterpay option
- Split payment display:
  - 4 equal payments
  - Payment schedule
  - No interest option
- Seamless Stripe + Afterpay integration

---

### 12. WAITING LIST / AVAILABILITY

**"View Next Available Slots with Purni" Feature**:
- Quick view of Purni's next available appointments
- Easy booking option
- Signup modal for waiting list
- Notification when slot opens up
- SMS/email notification (Supabase + Twilio)

---

## RESPONSIVE DESIGN

**Breakpoints**:
- Mobile: 0-640px (primary focus)
- Tablet: 641-1024px
- Desktop: 1025px+

**Requirements**:
- Mobile-first design approach
- Smooth responsiveness across all sizes
- Touch-friendly buttons & interactive elements
- Readable text at all sizes
- Proper spacing & hierarchy on mobile

---

## PERFORMANCE & ACCESSIBILITY

**Performance**:
- Fast load times
- Smooth 60fps animations
- Optimized images
- Lazy loading for galleries
- Caching strategy for offline functionality

**Accessibility**:
- WCAG 2.1 AA compliance
- Clear contrast ratios
- Keyboard navigation
- Screen reader support
- Alt text for all images
- Semantic HTML structure

---

## BACKEND REQUIREMENTS (Supabase)

### Database Tables Needed
```
users (id, email, phone, name, avatar, role, vip_tier, points, created_at)
services (id, name, category, duration, base_price, description)
staff (id, name, tier_level, specialty, avatar, bio, price_multiplier)
appointments (id, user_id, staff_id, service_id, datetime, status, notes)
payments (id, appointment_id, amount, stripe_id, afterpay_id, status)
vip_profiles (id, user_id, tier, points, bookings_count, achievements)
courses (id, name, level, price, instructor_id, description, duration)
reviews (id, appointment_id, rating, comment, photos)
gallery_items (id, before_image, after_image, service_category, artist_id, description)
referrals (id, referrer_id, referred_user_id, status, reward_amount)
```

### Auth Implementation
- Supabase Auth (email/password, social logins)
- JWT tokens for API calls
- Session management
- Role-based access (admin, staff, client)

### Storage
- Profile pictures (Supabase Storage)
- Service images
- Gallery images (before/afters)
- Course materials

### Edge Functions (if needed)
- Appointment reminders (24h before)
- Payment processing webhooks
- Referral tracking
- Notification triggers

---

## FUTURE ENHANCEMENTS (Phase 2)

- Admin dashboard for staff management
- Salon owner portal (bookings, analytics, revenue)
- Advanced analytics & reporting
- SMS reminders via Twilio
- Email notifications via SendGrid
- Push notifications (React Native)
- Appointment rescheduling
- Cancellation with penalty/refund handling
- Staff scheduling optimization
- Multi-location support (if expanding)
- Client reviews & ratings
- Gift cards / vouchers
- Seasonal promotions

---

## USER JOURNEYS

### Journey 1: New User Books First Appointment
1. Land on home page
2. Click "Book Your Appointment"
3. Sign up / Login
4. Select service (expandable categories)
5. Select artist
6. Choose date/time
7. Review and pay deposit
8. Confirmation sent

### Journey 2: Regular Client Checks VIP Status
1. Log in
2. Click "VIP Clients"
3. View VIP dashboard
4. Check points, tier, achievements
5. View booking history
6. Redeem reward
7. View available perks

### Journey 3: Client Enrolls in Course
1. Click "Courses" button
2. Browse course options
3. Select course
4. View details (instructor, duration, price)
5. Click "Enroll"
6. Process payment
7. Get course access

### Journey 4: Exploring Before & Afters
1. Click navigation or link to Gallery
2. View grid of transformations
3. Click on image to expand in lightbox
4. Read artist attribution & testimonial
5. Book with that artist
6. Or continue browsing

---

## DELIVERABLES CHECKLIST

### Phase 1: MVP (Current/Immediate)
- [x] Home page with 5 navigation buttons
- [x] Booking flow (4 steps: service, artist, date/time, confirm)
- [x] Services page with categories
- [x] VIP section with gamification
- [x] VIP profile examples with diamond badges
- [x] Shop page with product preview
- [x] Courses page with 6 course offerings
- [x] Gallery page with before/after lightbox
- [x] Staff profiles with pictures & tier badges
- [x] Afterpay badge/integration indicator
- [x] Notes section in VIP portal
- [x] Elegant design system (no emojis, gold gradients)
- [x] Mobile responsive design
- [ ] Full Supabase integration
- [ ] Authentication (signup/login)
- [ ] Payment processing (Stripe)
- [ ] Database persistence

### Phase 2: Enhancement
- [ ] Admin dashboard
- [ ] Staff management portal
- [ ] Advanced analytics
- [ ] SMS/Email notifications
- [ ] Push notifications
- [ ] Appointment rescheduling
- [ ] Advanced referral system
- [ ] Gift card system
- [ ] Seasonal promotions
- [ ] Multi-salon support

---

## SUCCESS METRICS

- **User Adoption**: 50+ active users in first month
- **Booking Rate**: 60%+ of users complete a booking
- **VIP Engagement**: 30%+ of regular clients enrolled in VIP
- **Repeat Bookings**: 40%+ of users book a second appointment
- **Course Enrollment**: 20+ course participants
- **App Rating**: 4.5+ stars on app stores
- **Performance**: <2 second load time, 60fps animations

---

## NOTES

- All styling must feel LUXURIOUS, FEMININE, ELEGANT
- No budget emojis or cheap design elements
- Golden gradients enhance, don't overwhelm
- Focus on elegant simplicity, not complexity
- Every micro-interaction should feel intentional
- Mobile-first, responsive across all devices
- High-end beauty boutique aesthetic (Glossier/Goop/Sephora style)

---

**Status**: Requirements finalized & ready for development
**Next Step**: Backend setup + UI implementation with me