# Yang Yao Palace — Project Context for Claude

## What is this?
An online Chinese language school (yangyaopalace.com) built with Next.js 14, TypeScript, Tailwind CSS, Supabase, Stripe, and Cloudflare R2.

## Stack
- Frontend: Next.js 14 + TypeScript + Tailwind CSS
- Database: Supabase (PostgreSQL)
- Auth: Supabase Auth (email + Google OAuth)
- Payments: Stripe (one-time payments + installments)
- Storage: Cloudflare R2 (HSK PDF books + lesson file attachments)
- Email: Resend — all emails from no-reply@yangyaopalace.com (domain verified)
- Video: VooV meeting links (teacher pastes link per lesson)
- Icons: lucide-react
- Deployment: Vercel
- Repo: https://github.com/YosefT100/yang-yao-palace

## Domain
- Production: yangyaopalace.com (purchased on Cloudflare, connected to Vercel)
- Old URL: yang-yao-palace.vercel.app (still works)

## Users & Roles
- Admin (yaseft32@gmail.com) — full control
- Teacher — manages groups, lessons, meeting links, recordings, attachments
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
- Admin dashboard: full management with bulk-select delete (lessons + groups) and trash icon buttons
- Stripe payments with welcome email via Resend after purchase
- HSK PDF books (Textbook + Workbook) served from Cloudflare R2
- Google OAuth + email/password auth
- Make.com webhook → Google Sheets (Students, Teachers, Payments, Attendance, HSK1-6 Lessons sheets)
- Daily.co API keys exist but replaced by VooV manual links
- ICS calendar subscription feed for teachers: /api/calendar/[token]/feed.ics (works in Apple Calendar, Outlook, Google Calendar, etc.)
- Lesson status management: scheduled / completed / cancelled / incomplete — LessonStatusBar + LessonStatusBadge components, with Resend email + Google Sheets tracking on status change
- Lesson file attachments: teachers can paste links or upload files (PDF, image, video, doc) to R2 under lesson-files/{lessonId}/; stored in lesson_attachments table
- Teacher lesson notifications via Resend on lesson create / cancel / complete

## Owner's Vision
- Teachers in China, students worldwide (Israel, USA, China)
- VooV Meeting for video lessons (works in China without VPN)
- WhatsApp/WeChat groups per HSK level managed by teacher + admin
- Professional, premium feel — luxury Chinese education brand
- Everything should be practical and efficient for teachers

## What Still Needs Work
- Testimonials/reviews section on homepage
- Full end-to-end testing with real teacher and student
- Stripe live mode (currently test mode)

## Important Files
- src/app/page.tsx — homepage
- src/app/teacher/ — teacher dashboard
- src/app/student/ — student dashboard
- src/app/admin/ — admin dashboard
- src/lib/i18n.ts — all translations
- src/lib/hsk-books.ts — R2 book public URLs
- src/lib/r2.ts — R2 upload client (@aws-sdk/client-s3)
- src/lib/email.ts — Resend welcome email
- src/lib/lesson-notifications.ts — Resend lesson event emails + Make.com webhook
- src/lib/tracking.ts — Google Sheets tracking via Make.com webhook
- src/lib/calendar-token.ts — ICS calendar token generation
- src/components/EnrollButton.tsx — Stripe checkout trigger
- src/components/LessonStatusBar.tsx — lesson status action buttons (client)
- src/components/LessonStatusBadge.tsx — status badge (completed/cancelled/incomplete/scheduled)
- src/components/LessonAttachments.tsx — file/link attachment manager (client)
- src/components/BulkDeleteLessons.tsx — admin bulk delete lessons with Select All
- src/components/BulkDeleteGroups.tsx — admin bulk delete groups with Select All
- src/app/api/calendar/[token]/feed.ics/route.ts — ICS feed endpoint
- src/app/api/upload-lesson-file/route.ts — R2 file upload endpoint

## Vercel Environment Variables
- SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
- RESEND_API_KEY
- STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- CLOUDFLARE_R2_ACCOUNT_ID, CLOUDFLARE_R2_ACCESS_KEY_ID, CLOUDFLARE_R2_SECRET_ACCESS_KEY, CLOUDFLARE_R2_BUCKET (hsk-books)
- NEXT_PUBLIC_SITE_URL=https://yangyaopalace.com

## Notes
- Always git add . && git commit && git push after changes
- Vercel auto-deploys on push to main
- Never hardcode strings — use i18n.ts for all text
- בס״ד appears in top right corner (translated per locale)
