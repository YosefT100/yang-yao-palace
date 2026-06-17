import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { courseSlotPlan } from "@/lib/utils";
import { getLocale } from "@/lib/i18n-server";
import { t } from "@/lib/i18n";
import { HSK_BOOKS } from "@/lib/hsk-books";
import { HskBookButtons } from "@/components/HskBookButtons";

function getBookLevel(level: string, groupName: string): string {
  const isB = groupName.includes("4B") || groupName.includes("5B") || groupName.includes("6B");
  if (level === "HSK4") return isB ? "HSK4B" : "HSK4A";
  if (level === "HSK5") return isB ? "HSK5B" : "HSK5A";
  if (level === "HSK6") return isB ? "HSK6B" : "HSK6A";
  return level;
}

export default async function TeacherGroupsPage() {
  const tr = t(getLocale()).pages;
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();

  const { data: groups } = await supabase
    .from("groups")
    .select("*, course:courses(*), group_members(count)")
    .eq("teacher_id", auth.user!.id)
    .order("name");

  return (
    <div>
      <h1 className="mb-1 font-serif text-2xl font-bold text-palace-dark">{tr.myGroups}</h1>
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
              <h2 className="mt-2 font-semibold">{g.name}</h2>
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
  );
}
