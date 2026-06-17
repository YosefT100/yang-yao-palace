import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";
import type { Course } from "@/types/database";
import { getLocale } from "@/lib/i18n-server";
import { t } from "@/lib/i18n";
import EnrollButton from "@/components/EnrollButton";

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
                "Exam preparation lesson",
                "Final HSK exam simulation",
              ];
              return (
                <div key={course.id} className="card flex flex-col border-l-4 border-palace-gold">
                  <div className="mb-1 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-palace-red">{course.level}</h3>
                    <span className="text-sm font-semibold text-palace-gold">
                      {coursePrice ?? formatPrice(course.price_amount, course.price_currency, locale)}{" "}
                      / course
                    </span>
                  </div>
                  <p className="mb-1 text-sm font-medium text-palace-dark/80">{course.name}</p>
                  {lessonCount && (
                    <p className="mb-3 text-xs text-palace-dark/50">
                      {lessonCount} lessons + 2 exam sessions
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

      {/* ── 1:1 Private Lessons ───────────────────────────────────── */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <h2 className="font-serif text-3xl font-bold text-palace-dark">1-on-1 Private Lessons</h2>
            <div className="mx-auto mt-3 h-0.5 w-16 bg-palace-gold" />
            <p className="mx-auto mt-4 max-w-2xl text-palace-dark/60">
              Personalized one-on-one sessions with a native Chinese teacher, at your own pace.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              { level: "Beginner", range: "HSK 1–2", price: "$45" },
              { level: "Intermediate", range: "HSK 3–4", price: "$60" },
              { level: "Advanced", range: "HSK 5–6", price: "$80" },
            ].map(({ level, range, price }) => (
              <div key={level} className="card flex flex-col border-l-4 border-palace-gold">
                <div className="mb-1 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-palace-red">{level}</h3>
                  <span className="text-sm font-semibold text-palace-gold">{price} / lesson</span>
                </div>
                <p className="mb-1 text-sm font-medium text-palace-dark/80">{range}</p>
                <p className="mb-3 text-xs italic text-palace-dark/40">Includes everything in group courses + more</p>
                <div className="my-2 border-t border-gray-100" />
                <ul className="mb-4 flex-1 space-y-1.5">
                  {["Personalized pace", "Flexible schedule", "Native Chinese teacher", "WhatsApp / WeChat support"].map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-palace-dark/70">
                      <span className="mt-0.5 shrink-0 font-bold text-palace-gold">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className="btn-primary w-full justify-center text-center">
                  {tr.enroll}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="border-t border-palace-gold/20 bg-palace-dark py-10 text-center">
        <p
          className="font-serif text-2xl text-palace-gold"
          style={{ textShadow: "0 1px 12px rgba(212,175,55,0.3)" }}
        >
          学而不思则罔
        </p>
        <p className="mt-2 text-sm text-white/45">
          ללמוד בלי להרהר — זה בזבוז · 孔子 Confucius
        </p>
        <div className="my-5 flex items-center justify-center gap-3">
          <div className="h-px w-24 bg-palace-gold/20" />
          <span className="text-palace-gold/40">🏮</span>
          <div className="h-px w-24 bg-palace-gold/20" />
        </div>
        <div className="flex items-center justify-center gap-4 text-xs text-white/35">
          <Link href="/terms" className="hover:text-white/60 hover:underline">Terms of Service</Link>
          <span className="text-white/20">·</span>
          <Link href="/terms#privacy" className="hover:text-white/60 hover:underline">Privacy Policy</Link>
        </div>
        <p className="mt-3 text-xs text-white/25">
          © 2026 Yang Yao Palace. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
