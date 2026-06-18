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
      <div style={{ position: "fixed", top: 4, right: 8, fontSize: 10, color: "#999", zIndex: 100, transform: "rotate(-12deg)" }}>בס״ד</div>
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
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/65 to-black/80" />

        <div className="relative z-10 flex flex-col items-center px-6 py-36">
          <h1
            className="font-serif font-bold tracking-[0.12em] drop-shadow-2xl text-7xl md:text-9xl"
            style={{
              color: "#D4AF37",
              textShadow: "0 2px 32px rgba(212,175,55,0.4), 0 1px 4px rgba(0,0,0,0.6)",
            }}
          >
            杨姚宫殿
          </h1>

          <div className="my-7 flex items-center gap-3">
            <div className="h-px w-16 bg-palace-gold/50" />
            <div className="h-1 w-1 rounded-full bg-palace-gold/70" />
            <div className="h-px w-16 bg-palace-gold/50" />
          </div>

          <p className="text-xl md:text-2xl font-light tracking-[0.45em] text-white/85 uppercase">
            Yang Yao Palace
          </p>

          <p
            className="mx-auto mt-6 max-w-lg text-base md:text-lg leading-loose text-white/60"
            style={{ hyphens: "none" }}
          >
            {tr.subtitle.replace(/HSK\s(\d)/g, "HSK $1")}
          </p>

          <div className="mt-10 flex flex-row gap-5">
            <Link
              href="/signup"
              className="btn-primary"
              style={{ padding: "0.8rem 2.2rem", letterSpacing: "0.06em" }}
            >
              {tr.startLearning}
            </Link>
            <Link
              href="/login"
              className="btn-secondary"
              style={{ padding: "0.8rem 2.2rem", letterSpacing: "0.06em" }}
            >
              {tr.signIn}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Courses ───────────────────────────────────────────────── */}
      <section className="bg-palace-cream py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <h2 className="font-serif text-3xl font-bold text-palace-dark">{tr.coursesTitle}</h2>
            <div className="mx-auto mt-3 h-0.5 w-16 bg-palace-gold" />
            <p className="mx-auto mt-4 max-w-2xl text-palace-dark/60">{tr.coursesSubtitle}</p>
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
              const liveLine =
                locale === "zh"
                  ? `${course.sessions_per_week} 节课/周 · ${course.lesson_duration_minutes} 分钟`
                  : locale === "he"
                  ? `${course.sessions_per_week} שיעורים/שבוע · ${course.lesson_duration_minutes} דקות`
                  : `${course.sessions_per_week} live lessons/week · ${course.lesson_duration_minutes} min`;
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
                <div key={course.id} className="card flex flex-col border-l-4 border-palace-gold">
                  <div className="mb-1 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-palace-red">{course.level}</h3>
                    <span className="text-sm font-semibold text-palace-gold">
                      {coursePrice ?? formatPrice(course.price_amount, course.price_currency, locale)}{" "}
                      {tr.perCourse}
                    </span>
                  </div>
                  <p className="mb-1 text-sm font-medium text-palace-dark/80">{course.name}</p>
                  {lessonCount && (
                    <p className="mb-3 text-xs text-palace-dark/50">
                      {lessonCount} {tr.examSessions}
                    </p>
                  )}
                  <div className="my-2 border-t border-gray-100" />
                  <ul className="mb-4 flex-1 space-y-1.5">
                    {feats.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-palace-dark/70">
                        <span className="mt-0.5 shrink-0 font-bold text-palace-gold">✓</span>
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
      <section className="bg-palace-cream py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-10 text-center">
            <h2 className="font-serif text-3xl font-bold text-palace-dark">{tr.trialTitle}</h2>
            <div className="mx-auto mt-3 h-0.5 w-16 bg-palace-gold" />
            <p className="mx-auto mt-4 max-w-xl text-palace-dark/60">{tr.trialSubtitle}</p>
          </div>
          <TrialForm />
        </div>
      </section>

      {/* ── 1:1 Private Lessons ───────────────────────────────────── */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <h2 className="font-serif text-3xl font-bold text-palace-dark">{tr.oneOnOneTitle}</h2>
            <div className="mx-auto mt-3 h-0.5 w-16 bg-palace-gold" />
            <p className="mx-auto mt-4 max-w-2xl text-palace-dark/60">{tr.oneOnOneSubtitle}</p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              { labelKey: "beginner" as const, range: "HSK 1-2", fullPrice: "$765", installment: "$192", levelKey: "HSK1_1ON1", instKey: "HSK1_1ON1_INST", nameEn: "Beginner 1-on-1 (HSK 1-2)" },
              { labelKey: "intermediate" as const, range: "HSK 3-4", fullPrice: "$1,320", installment: "$330", levelKey: "HSK3_1ON1", instKey: "HSK3_1ON1_INST", nameEn: "Intermediate 1-on-1 (HSK 3-4)" },
              { labelKey: "advanced" as const, range: "HSK 5-6", fullPrice: "$3,360", installment: "$840", levelKey: "HSK6_1ON1", instKey: "HSK6_1ON1_INST", nameEn: "Advanced 1-on-1 (HSK 5-6)" },
            ].map(({ labelKey, range, fullPrice, installment, levelKey, instKey, nameEn }) => (
              <div key={levelKey} className="card flex flex-col border-l-4 border-palace-gold">
                <div className="mb-1 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-palace-red">{tr[labelKey]}</h3>
                  <span className="text-sm font-semibold text-palace-gold">{fullPrice}</span>
                </div>
                <p className="mb-1 text-sm font-medium text-palace-dark/80">{range}</p>
                <p className="mb-1 text-xs text-palace-dark/50">{tr.orInstallments} {installment}</p>
                <p className="mb-3 text-xs italic text-palace-dark/40">{tr.includesEverything}</p>
                <div className="my-2 border-t border-gray-100" />
                <ul className="mb-4 flex-1 space-y-1.5">
                  {[tf.personalizedPace, tf.flexibleSchedule1on1, tf.nativeTeacher, tf.whatsappSupport, tf.flexibleConvenience].map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-palace-dark/70">
                      <span className="mt-0.5 shrink-0 font-bold text-palace-gold">✓</span>
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
      <footer className="border-t border-palace-gold/20 bg-palace-dark py-10 text-center">
        <p className="mt-2 text-sm text-white/45">
          {tr.confuciusQuote}
        </p>
        <div className="my-5 flex items-center justify-center gap-3">
          <div className="h-px w-24 bg-palace-gold/20" />
          <span className="text-palace-gold/40">🏮</span>
          <div className="h-px w-24 bg-palace-gold/20" />
        </div>
        <div className="flex items-center justify-center gap-4 text-xs text-white/35">
          <Link href="/terms" className="hover:text-white/60 hover:underline">{tr.termsOfService}</Link>
          <span className="text-white/20">·</span>
          <Link href="/terms#privacy" className="hover:text-white/60 hover:underline">{tr.privacyPolicy}</Link>
        </div>
        <p className="mt-3 text-xs text-white/25">
          {tr.copyright}
        </p>
      </footer>
    </main>
  );
}
