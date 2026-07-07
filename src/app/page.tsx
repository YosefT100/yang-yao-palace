import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";
import type { Course } from "@/types/database";
import { getLocale } from "@/lib/i18n-server";
import { t } from "@/lib/i18n";
import EnrollButton from "@/components/EnrollButton";
import PendingEnrollHandler from "@/components/PendingEnrollHandler";
import TrialForm from "@/components/TrialForm";
import { FAQAccordion } from "@/components/FAQAccordion";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams?: { lang?: string };
}) {
  const locale = getLocale();
  const tr = t(locale).landing;
  const tf = t(locale).features;

  const supabase = createClient();
  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  return (
    <main>
      <div style={{ position: "fixed", top: 8, right: 12, fontSize: 9, color: "#999", zIndex: 100, opacity: 0.4 }}>{tr.bsd}</div>
      <PendingEnrollHandler />

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section
        className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden text-center text-white"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=1920&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/85" />

        <div className="relative z-10 flex flex-col items-center px-6 py-36">
          <div className="mb-8 flex items-center gap-4">
            <div className="h-px w-12 bg-palace-gold/40" />
            <span className="text-xs tracking-[0.4em] text-palace-gold/60 font-medium uppercase">Chinese Language Academy</span>
            <div className="h-px w-12 bg-palace-gold/40" />
          </div>

          <h1
            className="font-serif font-bold tracking-[0.10em] drop-shadow-2xl text-7xl md:text-9xl"
            style={{
              color: "#D4AF37",
              textShadow: "0 2px 40px rgba(212,175,55,0.35), 0 1px 4px rgba(0,0,0,0.7)",
            }}
          >
            杨姚宫殿
          </h1>

          <div className="my-7 flex items-center gap-3">
            <div className="h-px w-20 bg-palace-gold/40" />
            <div className="h-1.5 w-1.5 rounded-full bg-palace-gold/60" />
            <div className="h-px w-20 bg-palace-gold/40" />
          </div>

          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="" className="h-8 w-8 rounded-full object-cover border border-palace-gold/30" />
            <p className="text-xl md:text-2xl font-light tracking-[0.45em] text-white/80 uppercase">
              Yang Yao Palace
            </p>
          </div>

          <p
            className="mx-auto mt-6 max-w-lg text-base md:text-lg leading-loose text-white/55"
            style={{ hyphens: "none" }}
          >
            {tr.subtitle.replace(/HSK\s(\d)/g, "HSK $1")}
          </p>

          <div className="mt-12 flex flex-row gap-4">
            <Link
              href="/signup"
              className="btn-primary"
              style={{ padding: "0.85rem 2.4rem", letterSpacing: "0.07em", fontSize: "0.9rem" }}
            >
              {tr.startLearning}
            </Link>
            <Link
              href="/login"
              className="btn-secondary"
              style={{ padding: "0.85rem 2.4rem", letterSpacing: "0.07em", fontSize: "0.9rem" }}
            >
              {tr.signIn}
            </Link>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
          <div className="h-8 w-px bg-palace-gold/60" />
        </div>
      </section>

      {/* ── Free Trial ────────────────────────────────────────────── */}
      <section className="bg-palace-cream py-24" style={{ borderTop: "1px solid rgba(212,175,55,0.15)" }}>
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <p className="mb-3 text-xs font-semibold tracking-[0.3em] text-palace-gold uppercase">Free</p>
            <h2 className="section-title">{tr.trialTitle}</h2>
            <div className="gold-divider" />
            <p className="mx-auto mt-5 max-w-xl text-palace-dark/55 leading-relaxed">{tr.trialSubtitle}</p>
          </div>
          <TrialForm />
        </div>
      </section>

      {/* ── Courses ───────────────────────────────────────────────── */}
      <section className="bg-palace-cream py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-14 text-center">
            <p className="mb-3 text-xs font-semibold tracking-[0.3em] text-palace-gold uppercase">HSK 1–6</p>
            <h2 className="section-title">{tr.coursesTitle}</h2>
            <div className="gold-divider" />
            <p className="mx-auto mt-5 max-w-2xl text-palace-dark/55 leading-relaxed">{tr.coursesSubtitle}</p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(courses as Course[] | null)?.map((course) => {
              const hskNum = parseInt((course.level as string)?.replace(/\D/g, "") || "0");
              const HSK_LESSONS: Record<string, number> = {
                HSK1: 17, HSK2: 17, HSK3: 22, HSK4: 22, HSK5: 38, HSK6: 42,
              };
              const HSK_PRICES: Record<string, string> = {
                HSK1: "$460", HSK2: "$460", HSK3: "$800", HSK4: "$800", HSK5: "$1,800", HSK6: "$2,000",
              };
              const levelKey = (course.level as string)?.replace(/\s/g, "") as string;
              const baseLevel = levelKey.replace(/[AB]$/, "");
              const lessonCount = HSK_LESSONS[levelKey];
              const coursePrice = HSK_PRICES[levelKey];
              const outcome = (tr.hskOutcomes as Record<string, string>)[baseLevel];
              const perWeekLabel = course.sessions_per_week === 1 ? tr.lessonPerWeek : tr.lessonsPerWeek;
              const liveLine = `${course.sessions_per_week} ${perWeekLabel} · ${course.lesson_duration_minutes} ${tr.minutesPerLesson}`;
              const feats = [
                liveLine,
                tf.practice,
                tf.nativeTeacher,
                tf.whatsapp,
                tf.homework,
                tf.smallGroup,
                ...(course.has_bonus_lesson ? [tf.bonusLesson] : []),
                ...(hskNum >= 5 ? [tr.intensivePace] : []),
                ...(hskNum >= 3 ? [tf.hskExam] : []),
                ...(hskNum >= 5 ? [tf.advanced] : []),
                tr.examPrepLesson,
                tr.finalExamSim,
              ];
              return (
                <div key={course.id} className="card flex flex-col" style={{ borderTop: "3px solid #D4AF37" }}>
                  <div className="mb-2">
                    <span className="inline-flex items-center rounded-full bg-palace-red/8 px-2.5 py-1 text-xs font-bold text-palace-red">
                      {course.level}
                    </span>
                  </div>
                  <p className="mb-1 text-base font-semibold text-palace-dark">{course.name}</p>
                  {lessonCount && (
                    <p className="mb-1 text-xs text-palace-dark/45">
                      {lessonCount} {tr.examSessions}
                    </p>
                  )}
                  <p className="mb-3 text-xs text-palace-dark/40">{tr.perCourse}</p>
                  {outcome && (
                    <p className="mb-3 text-xs italic text-palace-gold/80">{outcome}</p>
                  )}
                  <div className="mb-4 h-px bg-palace-gold/15" />
                  <ul className="mb-5 flex-1 space-y-2">
                    {feats.map((f, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-palace-dark/65">
                        <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-palace-gold" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={`https://api.whatsapp.com/send?phone=972528847770&text=${encodeURIComponent(`Hi! I'm interested in learning Mandarin Chinese at Yang Yao Palace.\n\nCourse: ${course.name}\n\nA few quick questions:\n1. What is your name?\n2. Where are you from?\n3. How old are you?\n4. Why do you want to learn Chinese?\n\nFeel free to answer and we'll get back to you shortly! 😊`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-lg py-2 px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: "#25D366" }}
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 fill-white" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    WhatsApp
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── About Us ──────────────────────────────────────────────── */}
      <section className="bg-white py-24" style={{ borderTop: "1px solid rgba(212,175,55,0.15)" }}>
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="mb-3 text-xs font-semibold tracking-[0.3em] text-palace-gold uppercase">Our Story</p>
          <h2 className="section-title">{tr.aboutTitle}</h2>
          <div className="gold-divider" />
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-palace-dark/70">
            {tr.aboutText}
          </p>
        </div>
      </section>

      {/* ── Testimonials (video) ──────────────────────────────────── */}
      <section className="bg-white py-24" style={{ borderTop: "1px solid rgba(212,175,55,0.15)" }}>
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-14 text-center">
            <p className="mb-3 text-xs font-semibold tracking-[0.3em] text-palace-gold uppercase">Reviews</p>
            <h2 className="section-title">{tr.testimonialsTitle}</h2>
            <div className="gold-divider" />
          </div>
          <div className="flex flex-col items-center gap-6">
            <div className="w-full max-w-xs overflow-hidden rounded-xl shadow-lg">
              <div className="relative" style={{ paddingTop: "177.78%" }}>
                <iframe
                  src="https://www.youtube.com/embed/7mtXyxJcb2I?rel=0"
                  title="Yosef Trachtenberg testimonial"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full"
                />
              </div>
            </div>
            <div className="text-center">
              <p className="text-lg text-palace-gold">⭐⭐⭐⭐⭐</p>
              <p className="mt-2 max-w-md text-base italic text-palace-dark/70">
                &ldquo;{tr.testimonialVideoQuote}&rdquo;
              </p>
              <p className="mt-3 font-semibold text-palace-dark">Yosef Trachtenberg</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────── */}
      <section className="bg-palace-cream py-24" style={{ borderTop: "1px solid rgba(212,175,55,0.15)" }}>
        <div className="mx-auto max-w-3xl px-6">
          <div className="mb-12 text-center">
            <p className="mb-3 text-xs font-semibold tracking-[0.3em] text-palace-gold uppercase">FAQ</p>
            <h2 className="section-title">{tr.faqTitle}</h2>
            <div className="gold-divider" />
          </div>
          <FAQAccordion items={tr.faq as unknown as { q: string; a: string }[]} />
        </div>
      </section>

      {/* ── 1:1 Private Lessons ───────────────────────────────────── */}
      <section className="bg-white py-24" style={{ borderTop: "1px solid rgba(212,175,55,0.15)" }}>
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-14 text-center">
            <p className="mb-3 text-xs font-semibold tracking-[0.3em] text-palace-gold uppercase">Private</p>
            <h2 className="section-title">{tr.oneOnOneTitle}</h2>
            <div className="gold-divider" />
            <p className="mx-auto mt-5 max-w-2xl text-palace-dark/55 leading-relaxed">{tr.oneOnOneSubtitle}</p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              { labelKey: "beginner" as const, range: "HSK 1-2", fullPrice: "$765", installment: "$192", levelKey: "HSK1_1ON1", instKey: "HSK1_1ON1_INST", nameEn: "Beginner 1-on-1 (HSK 1-2)" },
              { labelKey: "intermediate" as const, range: "HSK 3-4", fullPrice: "$1,320", installment: "$330", levelKey: "HSK3_1ON1", instKey: "HSK3_1ON1_INST", nameEn: "Intermediate 1-on-1 (HSK 3-4)" },
              { labelKey: "advanced" as const, range: "HSK 5-6", fullPrice: "$3,360", installment: "$840", levelKey: "HSK6_1ON1", instKey: "HSK6_1ON1_INST", nameEn: "Advanced 1-on-1 (HSK 5-6)" },
            ].map(({ labelKey, range, fullPrice, installment, levelKey, instKey, nameEn }) => (
              <div key={levelKey} className="card flex flex-col" style={{ borderTop: "3px solid #D4AF37" }}>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-palace-dark">{tr[labelKey]}</h3>
                  <span className="text-lg font-bold text-palace-gold">{fullPrice}</span>
                </div>
                <p className="mb-1 text-sm font-medium text-palace-dark/60">{range}</p>
                <p className="mb-1 text-xs text-palace-dark/45">{tr.orInstallments} {installment}</p>
                <p className="mb-4 text-xs italic text-palace-dark/35">{tr.includesEverything}</p>
                <div className="mb-4 h-px bg-palace-gold/15" />
                <ul className="mb-5 flex-1 space-y-2">
                  {[tf.personalizedPace, tf.flexibleSchedule1on1, tf.nativeTeacher, tf.whatsappSupport, tf.flexibleConvenience].map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-palace-dark/65">
                      <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-palace-gold" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-col gap-2">
                  <EnrollButton level={levelKey} name={nameEn} label={tr.payInFull} />
                  <EnrollButton level={instKey} name={nameEn + " - Installment"} label={`${tr.payIn4} ${installment}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="bg-palace-dark py-12 text-center" style={{ borderTop: "1px solid rgba(212,175,55,0.15)" }}>
        <p className="font-serif text-sm tracking-[0.3em] text-palace-gold/60 mb-1">YANG YAO PALACE</p>
        <p className="font-serif text-lg text-palace-gold/30 mb-6">杨姚宫殿</p>
        <p className="text-sm text-white/35 max-w-md mx-auto leading-relaxed">
          {tr.confuciusQuote}
        </p>
        <div className="my-7 flex items-center justify-center gap-4">
          <div className="h-px w-20 bg-palace-gold/15" />
          <div className="h-1 w-1 rounded-full bg-palace-gold/30" />
          <div className="h-px w-20 bg-palace-gold/15" />
        </div>
        {/* Social links */}
        <div className="mb-7 flex items-center justify-center gap-5">
          <a href="https://www.instagram.com/yang.yao.palace?igsh=cG9laXpjNWtuYnRr" target="_blank" rel="noopener noreferrer"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/40 transition-colors hover:border-palace-gold/40 hover:text-palace-gold/70"
            aria-label="Instagram">
            <span className="text-sm">📸</span>
          </a>
          <a href="https://tiktok.com/@yangyaopalace" target="_blank" rel="noopener noreferrer"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/40 transition-colors hover:border-palace-gold/40 hover:text-palace-gold/70"
            aria-label="TikTok">
            <span className="text-sm">🎵</span>
          </a>
          <a href="https://facebook.com/yangyaopalace" target="_blank" rel="noopener noreferrer"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/40 transition-colors hover:border-palace-gold/40 hover:text-palace-gold/70"
            aria-label="Facebook">
            <span className="text-sm">👥</span>
          </a>
        </div>
        <div className="flex items-center justify-center gap-5 text-xs text-white/30">
          <Link href="/terms" className="transition-colors duration-150 hover:text-white/60">{tr.termsOfService}</Link>
          <span className="text-white/15">·</span>
          <Link href="/terms#privacy" className="transition-colors duration-150 hover:text-white/60">{tr.privacyPolicy}</Link>
        </div>
        <p className="mt-5 text-xs text-white/20">
          {tr.copyright}
        </p>
      </footer>
    </main>
  );
}
