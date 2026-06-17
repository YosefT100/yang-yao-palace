# Yang Yao Palace — Chinese Language Academy Platform

A full-stack platform for an online Chinese school: admins manage HSK-level
courses, groups and teachers; teachers manage their weekly schedule and pick
lesson materials; students enroll and pay per course.

Stack: **Next.js 14 (App Router) + TypeScript + Tailwind**, **Supabase**
(auth, database, RLS), **Stripe** (subscription payments).

---

## 1. How the platform works

- **Courses (HSK levels)** — `admin/courses`. Each level (HSK1–HSK6) has a
  weekly cadence, lesson length, and price. Defaults seeded by `schema.sql`:
  - HSK1 & HSK2: 2 regular lessons/week + 1 bonus lesson
  - HSK3: 2 regular lessons/week
  - HSK4–6: 1 regular lesson/week
  - All of this is editable per level.

- **Groups** — `admin/groups`. A group = one teacher's class for one level
  (e.g. "HSK1 — Monday/Wednesday Evening"). Admin creates groups, assigns a
  teacher, and adds students.

- **Availability / weekly schedule** — teachers (or admins, from the group
  page) set fixed recurring weekly time slots per group, matching the
  course's required cadence (regular + bonus slots).

- **Lesson generation** — from a group's page, admin clicks "Generate
  schedule" to create the next N weeks of lesson sessions from the teacher's
  weekly slots.

- **Lesson materials** — teachers open a lesson from `teacher/schedule` and
  pick a presentation/PDF/link for that lesson (their own library or shared
  materials uploaded by admin in `admin/courses`).

- **Enrollment & payment** — admin adds a student to a group; the student
  sees the group on `student` with a "Pay now" button that opens a Stripe
  Checkout subscription for that course's price. A webhook marks the
  enrollment "active" once paid.

- **Roles** — `admin`, `teacher`, `student`. New signups default to
  `student`. Promote users to `teacher`/`admin` from `admin/teachers` or
  `admin/students`.

---

## 2. Set up Supabase

1. Create a free project at https://supabase.com.
2. Go to **SQL Editor → New query**, paste the contents of
   `supabase/schema.sql`, and run it. This creates all tables, enums,
   row-level-security policies, and seeds the 6 HSK courses.
3. Go to **Project Settings → API** and copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret — server only)
4. Go to **Authentication → Providers** and make sure Email is enabled. For
   local testing you can disable "Confirm email" under
   **Authentication → Settings** so you can sign in immediately after sign-up.

### Create the first admin

1. Sign up normally at `/signup` (you'll get the `student` role by default).
2. In Supabase **Table editor → profiles**, find your row and change `role`
   to `admin`. You now have access to `/admin`.

---

## 3. Set up Stripe (real payments)

1. Create a Stripe account at https://dashboard.stripe.com (use **test
   mode** while developing).
2. **Developers → API keys**: copy the *Secret key* →
   `STRIPE_SECRET_KEY`, and the *Publishable key* →
   `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
3. **Developers → Webhooks → Add endpoint**:
   - URL: `https://YOUR-DOMAIN/api/stripe/webhook`
   - Events: `checkout.session.completed`, `invoice.payment_succeeded`,
     `customer.subscription.deleted`
   - Copy the signing secret → `STRIPE_WEBHOOK_SECRET`.
4. For local testing, use the Stripe CLI:
   ```
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
   It prints a `whsec_...` secret to use locally.

Prices are **not** pre-created in Stripe — the checkout route builds a price
on the fly from each course's `price_amount`/`price_currency`, so editing a
price in `admin/courses` immediately applies to new checkouts.

---

## 4. Run locally

```bash
cp .env.example .env.local   # fill in the values from steps 2-3
npm install
npm run dev
```

Open http://localhost:3000.

---

## 5. Deploy

Recommended: [Vercel](https://vercel.com).

1. Push this folder to a GitHub repo, import it in Vercel.
2. Add all variables from `.env.example` as Environment Variables
   (set `NEXT_PUBLIC_SITE_URL` to your production URL).
3. Update the Stripe webhook endpoint to your production URL.
4. Update Supabase **Authentication → URL Configuration** to allow your
   production domain (Site URL + Redirect URLs, e.g.
   `https://yourdomain.com/auth/callback`).

---

## 6. Project structure

```
src/
  app/
    page.tsx                 Landing page (public)
    login/, signup/          Auth pages
    auth/callback/            Supabase email-confirmation handler
    admin/                    Admin dashboard (teachers, courses, groups, students, schedule, payments)
    teacher/                  Teacher dashboard (groups, schedule, availability, lesson prep)
    student/                  Student dashboard (groups, lessons, payment)
    api/stripe/               Checkout + webhook routes
  components/                 Sidebar, CheckoutButton
  lib/                        Supabase clients, Stripe client, helpers
  middleware.ts               Auth + role-based route protection
  types/database.ts           TypeScript types matching schema.sql
supabase/schema.sql            Full DB schema, RLS policies, seed data
```

---

## 7. Next steps / ideas

- File uploads for materials via Supabase Storage instead of external links.
- Email/calendar invites (e.g. Google Calendar sync) for each generated lesson.
- Per-student attendance tracking on the lesson page.
- Teacher payout / commission reporting in `admin/payments`.
