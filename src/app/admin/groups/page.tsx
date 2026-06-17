import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createGroupAction } from "@/app/admin/actions";
import type { Course, Profile, Group } from "@/types/database";
import { getLocale } from "@/lib/i18n-server";
import { t } from "@/lib/i18n";

export default async function AdminGroupsPage() {
  const tr = t(getLocale()).pages;
  const supabase = createClient();
  const { data: groups } = await supabase
    .from("groups")
    .select("*, course:courses(level, name), teacher:profiles(full_name, email), group_members(count)")
    .order("created_at", { ascending: false });

  const { data: courses } = await supabase.from("courses").select("*").eq("is_active", true).order("sort_order");
  const { data: teachers } = await supabase.from("profiles").select("*").eq("role", "teacher").order("full_name");

  return (
    <div>
      <h1 className="mb-1 font-serif text-2xl font-bold text-palace-dark">{tr.groups}</h1>
      <p className="mb-6 text-sm text-palace-dark/60">
        A group is a teacher's class for a specific HSK level. Create a group, assign a
        teacher, then open it to set the teacher's weekly time slots, add students, and
        generate the lesson schedule.
      </p>

      <form action={createGroupAction} className="card mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <select className="input" name="course_id" required>
          <option value="">Level…</option>
          {(courses as Course[] | null)?.map((c) => (
            <option key={c.id} value={c.id}>{c.level} — {c.name}</option>
          ))}
        </select>
        <input className="input" name="name" placeholder="Group name (e.g. HSK1 - Evening A)" required />
        <select className="input" name="teacher_id">
          <option value="">Assign teacher later</option>
          {(teachers as Profile[] | null)?.map((t) => (
            <option key={t.id} value={t.id}>{t.full_name || t.email}</option>
          ))}
        </select>
        <div className="flex gap-2">
          <input className="input" type="number" name="capacity" placeholder="Capacity" defaultValue={8} min={1} />
          <button type="submit" className="btn-primary whitespace-nowrap">Create group</button>
        </div>
      </form>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(groups as any[] | null)?.map((g) => (
          <Link key={g.id} href={`/admin/groups/${g.id}`} className="card hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-palace-red/10 px-2.5 py-1 text-xs font-bold text-palace-red">
                {g.course?.level}
              </span>
              {!g.is_active && (
                <span className="rounded-full bg-black/5 px-2.5 py-1 text-xs text-palace-dark/50">Inactive</span>
              )}
            </div>
            <h2 className="mt-2 font-semibold">{g.name}</h2>
            <p className="mt-1 text-sm text-palace-dark/60">
              Teacher: {g.teacher?.full_name || g.teacher?.email || "Unassigned"}
            </p>
            <p className="mt-1 text-sm text-palace-dark/50">
              {g.group_members?.[0]?.count ?? 0} / {g.capacity} students
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
