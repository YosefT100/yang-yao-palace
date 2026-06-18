# Yang Yao Palace — Project Context for Claude

## What is this?
An online Chinese language school (yang-yao-palace.vercel.app) built with Next.js 14, TypeScript, Tailwind CSS, Supabase, Stripe, and Cloudflare R2.

## Stack
- Frontend: Next.js 14 + TypeScript + Tailwind CSS
- Database: Supabase (PostgreSQL)
- Auth: Supabase Auth (email + Google OAuth)
- Payments: Stripe (one-time payments + installments)
- Storage: Cloudflare R2 (HSK PDF books)
- Email: Resend
- Video: VooV meeting links (teacher pastes link per lesson)
- Deployment: Vercel
- Repo: https://github.com/YosefT100/yang-yao-palace

## Users & Roles
- Admin (yaseft32@gmail.com) — full control
- Teacher — manages groups, lessons, meeting links, recordings
- Student — views courses, enrolls, joins lessons

## Courses
HSK1-6 with A/B variants for HSK4-6.
Prices: HSK1-2: $460, HSK3-4: $800, HSK5: $1800, HSK6: $2000
1-on-1: Beginner $765, Intermediate $1320, Advanced $3360 (or 4 installments)

## Key Features Built
- Homepage with hero, HSK courses, free trial form, 1-on-1 section
- Multi-language: EN, 中文, עברית (i18n via cookies)
- Teacher dashboard: groups, schedule, lessons, meeting links, recordings library, profile (WhatsApp/WeChat/Telegram)
- Student dashboard: courses, groups, lessons, join lesson button
- Admin dashboard: full management
- Stripe payments with welcome email via Resend after purchase
- HSK PDF books (Textbook + Workbook) served from Cloudflare R2
- Google OAuth + email/password auth
- Make.com webhook → Google Sheets for new registrations
- Daily.co API keys exist but replaced by VooV manual links

## Owner's Vision
- Teachers in China, students worldwide (Israel, USA, China)
- VooV Meeting for video lessons (works in China without VPN)
- WhatsApp/WeChat groups per HSK level managed by teacher + admin
- Professional, premium feel — luxury Chinese education brand
- Everything should be practical and efficient for teachers

## What Still Needs Work
- Testimonials/reviews section on homepage
- Admin dashboard improvements
- Full end-to-end testing with real teacher and student
- Custom domain (currently yang-yao-palace.vercel.app)
- Stripe live mode (currently test mode)

## Important Files
- src/app/page.tsx — homepage
- src/app/teacher/ — teacher dashboard
- src/app/student/ — student dashboard
- src/app/admin/ — admin dashboard
- src/lib/i18n.ts — all translations
- src/lib/hsk-books.ts — R2 book URLs
- src/lib/email.ts — Resend welcome email
- src/components/EnrollButton.tsx — Stripe checkout trigger

## Notes
- Always git add . && git commit && git push after changes
- Vercel auto-deploys on push to main
- Never hardcode strings — use i18n.ts for all text
- בס״ד appears in top right corner (translated per locale)
