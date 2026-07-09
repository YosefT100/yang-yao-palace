import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { courseSlotPlan } from "@/lib/utils";
import { getLocale } from "@/lib/i18n-server";
import { t } from "@/lib/i18n";
import { HSK_BOOKS } from "@/lib/hsk-books";
import { HskBookButtons } from "@/components/HskBookButtons";
import { LessonStatusBadge } from "@/components/LessonStatusBadge";

function getBookLevel(level: string, groupName: string): string {
  const isB = groupName.includes("4B") || groupName.includes("5B") || groupName.includes("6B");
  if (level === "HSK4") return isB ? "HSK4B" : "HSK4A";
  if (level === "HSK5") return isB ? "HSK5B" : "HSK5A";
  if (level === "HSK6") return isB ? "HSK6B" : "HSK6A";
  return level;
}

function formatTimeOnly(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function dayLabel(dateKey: string, todayKey: string, tomorrowKey: string) {
  if (dateKey === todayKey) return "Today";
  if (dateKey === tomorrowKey) return "Tomorrow";
  return new Date(dateKey).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
}

export default async function TeacherHomePage() {
  const tr = t(getLocale()).pages;
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfWeek = new Date(startOfToday.getTime() + 7 * 24 * 3600 * 1000);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [{ data: groups }, { data: weekLessons }, { count: completedThisMonth }] = await Promise.all([
    supabase
      .from("groups")
      .select("*, course:courses(*), group_members(count)")
      .eq("teacher_id", auth.user!.id)
      .order("name"),
    supabase
      .from("lessons")
      .select("*, group:groups!inner(name, teacher_id, course:courses(level))")
      .eq("group.teacher_id", auth.user!.id)
      .gte("scheduled_at", startOfToday.toISOString())
      .lt("scheduled_at", endOfWeek.toISOString())
      .order("scheduled_at"),
    supabase
      .from("lessons")
      .select("id, group:groups!inner(teacher_id)", { count: "exact", head: true })
      .eq("group.teacher_id", auth.user!.id)
      .eq("status", "completed")
      .gte("scheduled_at", startOfMonth.toISOString())
      .lt("scheduled_at", endOfMonth.toISOString()),
  ]);

  const lessons = (weekLessons as any[] | null) ?? [];
  const todayKey = startOfToday.toDateString();
  const tomorrowKey = new Date(startOfToday.getTime() + 24 * 3600 * 1000).toDateString();

  const todaysLessons = lessons.filter((l) => new Date(l.scheduled_at).toDateString() === todayKey);

  const lessonsByDay = new Map<string, any[]>();
  for (const l of lessons) {
    const key = new Date(l.scheduled_at).toDateString();
    if (!lessonsByDay.has(key)) lessonsByDay.set(key, []);
    lessonsByDay.get(key)!.push(l);
  }

  const studentsCount = (groups as any[] | null)?.reduce((sum, g) => sum + (g.group_members?.[0]?.count ?? 0), 0) ?? 0;

  const stats = [
    { label: "Groups", value: groups?.length ?? 0, accent: "#9a1f2b" },
    { label: "Students", value: studentsCount, accent: "#9a1f2b" },
    { label: "Lessons this week", value: lessons.length, accent: "#D4AF37" },
    { label: "Completed this month", value: completedThisMonth ?? 0, accent: "#D4AF37" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-title">Teacher Dashboard</h1>
        <p className="mt-1 text-sm text-palace-dark/60">Everything you need for today's lessons, this week, and your groups.</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="stat-card" style={{ borderTop: `3px solid ${s.accent}` }}>
            <p className="text-xs font-semibold tracking-wide text-palace-dark/45 uppercase">{s.label}</p>
            <p className="mt-2 text-3xl font-bold text-palace-dark">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Today's lessons */}
      <div className="card">
        <h2 className="mb-4 text-base font-semibold text-palace-dark">Today's Lessons</h2>
        {!todaysLessons.length && (
          <p className="py-4 text-center text-sm text-palace-dark/45">No lessons scheduled for today.</p>
        )}
        <ul className="divide-y divide-black/[0.05]">
          {todaysLessons.map((l) => (
            <li key={l.id} className="py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-palace-cream px-3 py-1 text-xs font-semibold text-palace-dark/70">
                    {formatTimeOnly(l.scheduled_at)}
                  </span>
                  <p className="font-semibold text-palace-dark">
                    {l.group?.course?.level}
                    <span className="font-normal text-palace-dark/50"> · {l.group?.name}</span>
                  </p>
                  <LessonStatusBadge status={l.status} />
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Link href={`/teacher/lessons/${l.id}`} className="text-palace-red hover:underline">
                    Open lesson →
                  </Link>
                  {l.meeting_link && (
                    <a href={l.meeting_link} target="_blank" rel="noopener noreferrer" className="text-palace-gold hover:underline">
                      Join meeting →
                    </a>
                  )}
                </div>
              </div>
              {!l.meeting_link && (
                <p className="mt-2 rounded-lg bg-yellow-50 px-3 py-1.5 text-xs font-medium text-yellow-800">
                  ⚠️ No meeting link set —{" "}
                  <Link href={`/teacher/lessons/${l.id}`} className="underline">
                    add one
                  </Link>
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* This week */}
      <div className="card">
        <h2 className="mb-4 text-base font-semibold text-palace-dark">This Week</h2>
        {!lessonsByDay.size && (
          <p className="py-4 text-center text-sm text-palace-dark/45">No lessons scheduled in the next 7 days.</p>
        )}
        <div className="space-y-5">
          {Array.from(lessonsByDay.entries()).map(([dateKey, dayLessons]) => (
            <div key={dateKey}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-palace-gold">
                {dayLabel(dateKey, todayKey, tomorrowKey)}
              </p>
              <ul className="divide-y divide-black/[0.05]">
                {dayLessons.map((l) => (
                  <li key={l.id} className="flex items-center justify-between py-2 text-sm">
                    <div>
                      <span className="font-medium text-palace-dark">{formatTimeOnly(l.scheduled_at)}</span>
                      <span className="ml-2 text-palace-dark/60">
                        {l.group?.course?.level} · {l.group?.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <LessonStatusBadge status={l.status} />
                      <Link href={`/teacher/lessons/${l.id}`} className="text-palace-red hover:underline">
                        Open →
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/teacher/schedule" className="card cursor-pointer group text-center" style={{ borderTop: "2px solid rgba(212,175,55,0.3)" }}>
          <p className="font-semibold text-palace-red group-hover:text-[#7a1820] transition-colors duration-150">My Schedule</p>
          <p className="mt-1.5 text-sm text-palace-dark/45">All upcoming lessons</p>
        </Link>
        <Link href="/teacher/availability" className="card cursor-pointer group text-center" style={{ borderTop: "2px solid rgba(212,175,55,0.3)" }}>
          <p className="font-semibold text-palace-red group-hover:text-[#7a1820] transition-colors duration-150">My Availability</p>
          <p className="mt-1.5 text-sm text-palace-dark/45">Set your free time slots</p>
        </Link>
        <Link href="/teacher/recordings" className="card cursor-pointer group text-center" style={{ borderTop: "2px solid rgba(212,175,55,0.3)" }}>
          <p className="font-semibold text-palace-red group-hover:text-[#7a1820] transition-colors duration-150">Recordings</p>
          <p className="mt-1.5 text-sm text-palace-dark/45">Browse lesson recordings</p>
        </Link>
        <Link href="/teacher/profile" className="card cursor-pointer group text-center" style={{ borderTop: "2px solid rgba(212,175,55,0.3)" }}>
          <p className="font-semibold text-palace-red group-hover:text-[#7a1820] transition-colors duration-150">My Profile</p>
          <p className="mt-1.5 text-sm text-palace-dark/45">WhatsApp / WeChat / Telegram</p>
        </Link>
      </div>

      {/* My groups */}
      <div>
        <h2 className="mb-1 font-serif text-2xl font-bold text-palace-dark">{tr.myGroups}</h2>
        <p className="mb-6 text-sm text-palace-dark/60">
          Each group is a fixed weekly class at a specific HSK level. Open a group's schedule
          to pick the presentation for an upcoming lesson.
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(groups as any[] | null)?.map((g) => {
            const slots = courseSlotPlan(g.course.sessions_per_week, g.course.has_bonus_lesson);
            const level = g.course.level as string;
            const bookLevel = getBookLevel(level, g.name);
            const books = HSK_BOOKS[bookLevel] ?? {};
            return (
              <div key={g.id} className="card">
                <span className="rounded-full bg-palace-red/10 px-2.5 py-1 text-xs font-bold text-palace-red">
                  {level}
                </span>
                <h3 className="mt-2 font-semibold">{g.name}</h3>
                <p className="mt-1 text-sm text-palace-dark/60">
                  {g.group_members?.[0]?.count ?? 0} / {g.capacity} students
                </p>
                <p className="mt-1 text-sm text-palace-dark/50">
                  Cadence: {slots.map((s: any) => s.label).join(", ")}
                </p>
                <Link href="/teacher/schedule" className="btn-secondary mt-3 inline-flex">
                  View schedule
                </Link>
                <HskBookButtons level={bookLevel} hasTextbook={!!books.textbook} hasWorkbook={!!books.workbook} />
              </div>
            );
          })}
          {!groups?.length && (
            <p className="text-sm text-palace-dark/50">
              No groups assigned yet. Ask an admin to assign you to a group.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
