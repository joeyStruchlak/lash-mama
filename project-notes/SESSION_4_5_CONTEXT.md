# 🚀 LASH MAMA - NEW CHAT STARTER GUIDE
## Everything You Need to Continue Building

**Created:** December 31, 2025  
**Context Window:** Session 4 Complete → Starting Session 5  
**Progress:** 65% Complete  
**GitHub:** https://github.com/joeyStruchlak/lash-mama  
**Developer:** Joey Struchlak  

---

## 📋 HOW TO USE THIS DOCUMENT

### **When Starting New Chat:**

1. **Copy this ENTIRE document**
2. **Paste into new chat**
3. **Say:**
   ```
   I'm building Lash Mama app. Here's my complete project context.
   
   Current status: 65% complete, Phase 4 done.
   
   Continue building Phase 5. Work in small steps:
   - Make one change
   - Test it
   - Git commit
   - Move to next step
   
   Ready to continue?
   ```

4. **The AI will understand everything and continue exactly where we left off!**

---

## ✅ WHAT'S COMPLETE (65%)

### **Phase 1: Foundation** ✅
- Monorepo setup (Next.js, packages, config)
- GitHub repo: https://github.com/joeyStruchlak/lash-mama
- Supabase projects (dev + uat)
- Environment variables configured
- ESLint, Prettier, TypeScript

### **Phase 2: UI Pages** ✅
- Home page with VIP progress banner
- Header with login/logout, mobile menu
- Services page (11 services, 8 categories)
- Booking wizard (4-step flow)
- VIP dashboard (4 tabs: overview, history, rewards, notes)
- Gallery page (before/after transformations)
- Courses page (6 courses)
- Shop preview page
- Login page
- Signup page
- Success page (with confetti)

### **Phase 3: Backend** ✅
- 10 database tables created
- Seed data inserted (staff, services, courses, gallery)
- Supabase client configured
- All pages connected to database
- Row Level Security policies
- Database triggers for auto-profile creation

### **Phase 4: Core Features** ✅
- **Authentication:** Signup, login, logout working
- **Protected routes:** Booking requires login
- **Real bookings:** Save to database, update VIP streak
- **VIP tracking:** Streak counter, 10 bookings = VIP, 90-day gap check
- **VIP discounts:** $10-$30 off based on service type
- **VIP badges:** 💎 diamond for VIP users (in header)
- **Booking history:** Shows past appointments in VIP dashboard
- **Success page:** Confetti animation after booking

---

## 🗄️ DATABASE STRUCTURE

### **Tables (10 total):**

1. **users**
   - id, email, full_name, phone, avatar_url
   - role (user, vip, admin)
   - vip_streak, last_booking_date, birthday
   - notification_preferences

2. **staff** (3 artists)
   - Lash Mama (Purni): 1.25x price
   - Nikki & Beau: 1.0x price
   - Natali: 0.85x price

3. **services** (11 services)
   - Mega Volume (2), Volume (2), Natural/Hybrid (2)
   - Makeup (2), Hair (2), Packages (1)

4. **appointments**
   - Booking records with user_id, service_id, staff_id
   - appointment_date, appointment_time, total_price
   - status, discount_applied, discount_type
   - can_reschedule, rescheduled_at

5. **vip_profiles**
   - VIP tracking: vip_since, current_streak
   - bookings_count, total_spent
   - year_end_gift_sent, last_warning_sent

6. **courses** (6 courses)
   - VIP Vogue, Platinum, Silver, Gold, DIY Makeup, Masterclass

7. **gallery_items** (3 transformations)
   - Before/after images, category, artist, testimonial

8. **notifications** (for future)
   - User notifications system ready

9. **reminders** (for future)
   - Notes with calendar dates ready

10. **~~achievements~~** (deleted - not needed)

---

## 🎯 BUSINESS RULES (CRITICAL!)

### **VIP System:**
- **10 consecutive bookings** = VIP status
- **Max 90-day gap** between bookings
- If gap > 90 days → **streak resets to 0**, role downgraded to 'user'
- Automatic promotion when streak = 10

### **VIP Discounts:**
- 💰 **$10 off** all refills
- 🎂 **$20 off** birthday refills (if birthday = today)
- ✨ **$30 off** Mega Volume full sets
- ✨ **$30 off** Volume full sets
- ✨ **$20 off** Natural/Hybrid full sets

### **User Types:**
1. **Guest** → Can browse, cannot book
2. **User** → Can book, track progress to VIP
3. **VIP** → User + automatic discounts + 💎 badge
4. **Admin** → Full control (future: Lash Mama owner)

### **Booking Rules:**
- Must login to book
- Price = base_price × staff_multiplier - vip_discount
- VIP streak +1 after each booking
- Last booking date tracked

---

## 📂 PROJECT STRUCTURE

```
lash-mama/
├── apps/web/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx (Home)
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   ├── services/page.tsx
│   │   │   ├── book/page.tsx (protected)
│   │   │   ├── booking-success/page.tsx
│   │   │   ├── vip/page.tsx
│   │   │   ├── gallery/page.tsx
│   │   │   ├── courses/page.tsx
│   │   │   ├── shop/page.tsx
│   │   │   └── test/page.tsx
│   │   ├── components/
│   │   │   ├── Header.tsx (auth, badges)
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── BookingWizard.tsx (4 steps)
│   │   │   └── VIPProgressBanner.tsx
│   │   └── lib/
│   │       ├── supabase.ts (client)
│   │       └── auth.ts (helpers)
│   └── .env.local (env vars)
│
├── supabase/migrations/
│   ├── 20251231000001_initial_schema.sql
│   └── 20251231000002_update_schema_business_rules.sql
│
└── packages/ (shared code)
```

---

## 🔐 CREDENTIALS

### **Supabase Dev:**
```
URL: https://gcqthaivnyleflvmmxqv.supabase.co
ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjcXRoYWl2bnlsZWZsdm1teHF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwNzQ0NDUsImV4cCI6MjA4MjY1MDQ0NX0.dc-UDgHjcJZchLwRVeMqQ0ADmQBDAqu6Wxzgz_lTsE4
```

**File:** `apps/web/.env.local`
```
NEXT_PUBLIC_SUPABASE_URL=https://gcqthaivnyleflvmmxqv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjcXRoYWl2bnlsZWZsdm1teHF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwNzQ0NDUsImV4cCI6MjA4MjY1MDQ0NX0.dc-UDgHjcJZchLwRVeMqQ0ADmQBDAqu6Wxzgz_lTsE4
```

---

## 🧪 TESTING & DEBUGGING

### **Start Dev Server:**
```bash
cd lash-mama
npm run dev
```
App runs at: http://localhost:3000

### **Test Database Connection:**
http://localhost:3000/test → Should be green ✅

### **All Routes:**
- `/` - Home with VIP banner
- `/login` - Login page
- `/signup` - Signup page
- `/services` - 11 services from DB
- `/book` - 4-step wizard (requires login)
- `/booking-success` - Confetti page
- `/vip` - VIP dashboard (4 tabs)
- `/gallery` - Before/after photos
- `/courses` - 6 courses
- `/shop` - Product preview

### **Test VIP Flow:**
1. Signup → Login
2. Book appointment
3. Check home page → "9 more bookings to VIP"
4. Go to `/vip` → History tab → See booking
5. Book 9 more times → Auto-promoted to VIP
6. Book again → See discount applied!

### **Manually Promote to VIP (for testing):**
```sql
UPDATE public.users
SET role = 'vip', vip_streak = 10
WHERE email = 'your@email.com';
```

### **Cache Issues?**
- Hard refresh: `Ctrl + Shift + R`
- Restart server: `Ctrl + C` → `npm run dev`
- Clear Next.js cache: `rm -rf apps/web/.next`
- Use Chrome (Edge has issues)
- Enable "Disable cache" in DevTools (F12 → Network tab)

---

## 🚫 CURRENT ISSUES (KNOWN)

1. **Diamond badge** only shows for role='vip' (working as intended)
2. **Logout** working now (fixed with `window.location.href`)
3. **Cache issues** during rapid development (use Chrome + hard refresh)

---

## 🎯 WHAT'S NEXT (PHASE 5 - ~4 hours)

### **Priority 1: Notes & Reminders System** (1.5 hrs)
**Goal:** Let users create notes with calendar dates and get reminders

**Files to create/edit:**
- `apps/web/src/components/NotesManager.tsx` (new component)
- `apps/web/src/app/vip/page.tsx` (update Notes tab)

**Features:**
- Text area for note
- Calendar date picker
- Time picker
- Notification offset dropdown (15 min, 1 hour, 1 day, etc.)
- Save to `reminders` table
- Display saved reminders
- Delete reminder option

**Database:**
- Table `reminders` already exists ✅
- Fields: note_text, reminder_date, reminder_time, notification_offset

---

### **Priority 2: Profile Picture Upload** (1 hr)
**Goal:** Let users upload avatar, show in header with VIP badge overlay

**Files to create/edit:**
- `apps/web/src/components/Avatar.tsx` (new component)
- `apps/web/src/app/profile/page.tsx` (new profile settings page)
- `apps/web/src/components/Header.tsx` (show avatar)

**Features:**
- File upload button
- Image preview
- Upload to Supabase Storage
- Save URL to `users.avatar_url`
- Display circular avatar in header
- Add 💎 badge overlay for VIP users

**Supabase Storage:**
- Bucket: `avatars`
- Path: `{user_id}/avatar.jpg`

---

### **Priority 3: Refill Eligibility Check** (30 mins)
**Goal:** Prevent users from booking refills too soon

**Files to edit:**
- `apps/web/src/components/BookingWizard.tsx`

**Logic:**
- Check `users.last_booking_date`
- If service is "refill":
  - Must be at least 14 days since last booking
  - Show warning if too soon
  - Disable booking if not eligible

---

### **Priority 4: Reschedule Rules** (30 mins)
**Goal:** Enforce 48-hour reschedule restriction

**Files to create:**
- `apps/web/src/app/vip/page.tsx` (add reschedule button)

**Logic:**
- Check: appointment_date - today >= 2 days
- If < 48 hours: Show error "Contact salon directly"
- If >= 48 hours: Allow reschedule (update appointment record)

---

### **Priority 5: Refine VIP Dashboard** (1 hr)
**Goal:** Better stats, cleaner layout

**Improvements:**
- Show VIP benefits clearly
- Add "Days until VIP expires" (90 - days_since_last_booking)
- Better progress visualization
- Add empty states with CTAs
- Show next appointment upcoming

---

## 💾 GIT WORKFLOW

### **After Each Feature:**
```bash
git add .
git commit -m "Feature: Description of what you built"
git push origin main
```

### **Current Commits (6 total):**
1. Initial monorepo setup
2. Add packages/config and packages/types
3. Build Phase 2 UI - All pages
4. Phase 3: Connect backend - Database working
5. Phase 3: Add authentication - Login/Signup
6. Phase 4: VIP tracking, discounts, badges

---

## 🎓 HOW I'VE BEEN WORKING

### **My Development Style:**

1. **Small Steps**
   - One feature at a time
   - Never build multiple things at once
   - Test after each change

2. **Always Test**
   - Test in browser after every change
   - Check database after data operations
   - Hard refresh if cache issues

3. **Git After Each Feature**
   - Commit after each working feature
   - Clear commit messages
   - Push to GitHub regularly

4. **Ask for Confirmation**
   - "Tell me ✅ when saved"
   - "Tell me ✅ when working"
   - "Screenshot when you see X"
   - Wait for confirmation before moving on

5. **Debug Systematically**
   - Check browser console (F12)
   - Check terminal for errors
   - Restart server if needed
   - Clear cache if weird behavior

6. **Code Quality**
   - TypeScript for type safety
   - Clean, readable code
   - Comments for complex logic
   - Consistent naming conventions

---

## 💬 HOW TO WORK WITH ME (THE AI)

### **Effective Commands:**

**Good:**
- "Add a notes feature to the VIP dashboard"
- "Show me exactly where to paste this code"
- "This isn't working, here's the error: [paste error]"
- "Let's test this before moving on"

**Not as Good:**
- "Make it better" (too vague)
- "Add everything at once" (too much, too fast)
- "Fix all issues" (need specifics)

### **When Things Break:**

**Always tell me:**
1. What you tried to do
2. What error you see (screenshot or copy-paste)
3. Which file you were editing
4. Did you save the file?
5. Did you restart the server?

### **My Response Pattern:**

1. I explain what we're building
2. I give you EXACT code with line numbers
3. I tell you WHERE to paste it
4. I explain what it does
5. I tell you how to test it
6. I wait for your ✅ confirmation
7. Then we move to next step

---

## 🔥 QUICK COMMANDS REFERENCE

### **Dev Server:**
```bash
npm run dev          # Start dev server
Ctrl + C             # Stop server
rm -rf apps/web/.next   # Clear cache
```

### **Git:**
```bash
git add .
git commit -m "Message"
git push origin main
git status           # Check what changed
```

### **Testing:**
- Home: http://localhost:3000
- Test DB: http://localhost:3000/test
- Login: http://localhost:3000/login
- Book: http://localhost:3000/book

### **Supabase:**
- Dashboard: https://supabase.com/dashboard
- SQL Editor: Run queries directly
- Table Editor: View data
- Auth → Users: Manage users

---

## 🎯 SUCCESS METRICS

**What's Working:**
- ✅ 65% complete overall
- ✅ All UI pages functional
- ✅ Database connected
- ✅ Authentication working
- ✅ VIP system tracking correctly
- ✅ Discounts applying automatically
- ✅ Real bookings saving
- ✅ Booking history displaying

**What's Next:**
- ⏳ Notes & reminders (Phase 5)
- ⏳ Profile pictures (Phase 5)
- ⏳ Admin dashboard (Phase 6)
- ⏳ Mobile app (Phase 7)

---

## 📱 MOBILE APP (FUTURE - PHASE 7)

**Reminder:** This is a **WEB + MOBILE APP**!

**Mobile Features (React Native + Expo):**
- All web features ported
- Push notifications for reminders
- Camera for profile pictures
- Native iOS/Android experience
- Same Supabase backend
- ~10 hours estimated

**Not started yet** - focus on web first!

---

## 🎉 FINAL NOTES

### **You've Built Something Amazing:**
- Production-quality code
- Sophisticated VIP system
- Real database with business logic
- Beautiful, polished UI
- Secure authentication
- This could launch today!

### **Keep Going:**
- Phase 5 will add user delight features
- Phase 6 will add admin power
- Phase 7 will add mobile reach
- Then you have a complete product!

### **Remember:**
- Small steps
- Test everything
- Git commit often
- Use Chrome browser
- Hard refresh when needed
- Check database after changes

---

## ✅ READY TO START NEW CHAT

**Paste this entire document into new chat and say:**

```
Continue building Lash Mama. Here's my complete project context.

I'm at 65% complete (Phase 4 done).

Next: Build Phase 5 (Notes & Reminders, Profile Pictures).

Work in small steps like before:
1. One change at a time
2. Test after each step  
3. Git commit after each feature
4. Wait for my ✅ before moving on

GitHub: https://github.com/joeyStruchlak/lash-mama
Local: http://localhost:3000

Ready to continue? Let's start with the Notes & Reminders feature!
```

---

**You're doing AMAZING! Keep building! 🚀**

*Created: December 31, 2025*  
*Session 4 Complete → Ready for Session 5*  
*65% Complete - Halfway There!*



Continue building Lash Mama. Here's my complete project context above.

I'm at 65% complete (Phase 4 done).

Next: Build Phase 5 (Notes & Reminders, Profile Pictures).

Work in small steps like before:
- One change at a time
- Test after each step  
- Git commit after each feature
- Wait for my ✅ before moving on

GitHub: https://github.com/joeyStruchlak/lash-mama
Local: http://localhost:3000

Ready to continue?