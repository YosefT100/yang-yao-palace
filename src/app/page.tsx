import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";
import type { Course } from "@/types/database";
import { getLocale } from "@/lib/i18n-server";
import { t } from "@/lib/i18n";
import EnrollButton from "@/components/EnrollButton";
import PendingEnrollHandler from "@/components/PendingEnrollHandler";
import TrialForm from "@/components/TrialForm";

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
      <div style={{ position: "fixed", top: 4, right: 8, fontSize: 10, color: "#999", zIndex: 100, transform: "rotate(-12deg)" }}>{tr.bsd}</div>
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

          <p className="text-xl md:text-2xl font-light tracking-[0.45em] text-white/80 uppercase">
            Yang Yao Palace
          </p>

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

        {/* Subtle scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
          <div className="h-8 w-px bg-palace-gold/60" />
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
              const lessonCount = HSK_LESSONS[levelKey];
              const coursePrice = HSK_PRICES[levelKey];
              const liveLine = `${course.sessions_per_week} ${tr.lessonsPerWeek} · ${course.lesson_duration_minutes} ${tr.minutesPerLesson}`;
              const feats = [
                liveLine,
                tf.practice,
                tf.nativeTeacher,
                tf.whatsapp,
                tf.homework,
                tf.smallGroup,
                ...(course.has_bonus_lesson ? [tf.bonusLesson] : []),
                ...(hskNum >= 3 ? [tf.hskExam] : []),
                ...(hskNum >= 5 ? [tf.advanced] : []),
                tr.examPrepLesson,
                tr.finalExamSim,
              ];
              return (
                <div key={course.id} className="card flex flex-col" style={{ borderTop: "3px solid #D4AF37" }}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="inline-flex items-center rounded-full bg-palace-red/8 px-2.5 py-1 text-xs font-bold text-palace-red">
                      {course.level}
                    </span>
                    <span className="text-sm font-bold text-palace-gold">
                      {coursePrice ?? formatPrice(course.price_amount, course.price_currency, locale)}
                    </span>
                  </div>
                  <p className="mb-1 text-base font-semibold text-palace-dark">{course.name}</p>
                  {lessonCount && (
                    <p className="mb-1 text-xs text-palace-dark/45">
                      {lessonCount} {tr.examSessions}
                    </p>
                  )}
                  <p className="mb-4 text-xs text-palace-dark/40">{tr.perCourse}</p>
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
                  <EnrollButton level={course.level as string} name={course.name as string} label={tr.enroll} />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Free Trial ────────────────────────────────────────────── */}
      <section className="bg-white py-24" style={{ borderTop: "1px solid rgba(212,175,55,0.15)", borderBottom: "1px solid rgba(212,175,55,0.15)" }}>
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

      {/* ── 1:1 Private Lessons ───────────────────────────────────── */}
      <section className="bg-palace-cream py-24">
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

      {/* ── Testimonials ─────────────────────────────────────────── */}
      <section className="bg-white py-24" style={{ borderTop: "1px solid rgba(212,175,55,0.15)" }}>
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-14 text-center">
            <p className="mb-3 text-xs font-semibold tracking-[0.3em] text-palace-gold uppercase">Reviews</p>
            <h2 className="section-title">{tr.testimonialsTitle}</h2>
            <div className="gold-divider" />
            <p className="mx-auto mt-5 max-w-2xl text-palace-dark/55 leading-relaxed">{tr.testimonialsSubtitle}</p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {tr.testimonials.map((item, i) => (
              <div key={i} className="card flex flex-col gap-4" style={{ borderTop: "2px solid rgba(212,175,55,0.35)" }}>
                <p className="text-3xl font-serif leading-none text-palace-gold/30">&ldquo;</p>
                <p className="text-sm leading-relaxed text-palace-dark/70 italic flex-1 -mt-3">
                  {item.text}
                </p>
                <div className="h-px bg-palace-gold/12" />
                <div>
                  <p className="font-semibold text-palace-dark text-sm">{item.name}</p>
                  <p className="text-xs text-palace-gold mt-0.5">{item.level}</p>
                  <p className="text-xs text-palace-dark/40 mt-0.5">{item.country}</p>
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
