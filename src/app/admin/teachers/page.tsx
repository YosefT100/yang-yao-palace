import { createClient } from "@/lib/supabase/server";
import { setUserRoleAction } from "@/app/admin/actions";
import type { Profile, Group } from "@/types/database";
import { getLocale } from "@/lib/i18n-server";
import { t } from "@/lib/i18n";

export default async function AdminTeachersPage() {
  const tr = t(getLocale()).pages;
  const supabase = createClient();
  const { data: teachers } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "teacher")
    .order("full_name");

  const { data: groups } = await supabase
    .from("groups")
    .select("*, course:courses(level)")
    .order("name");

  const { data: others } = await supabase
    .from("profiles")
    .select("*")
    .neq("role", "teacher")
    .order("created_at", { ascending: false })
    .limit(50);

  const groupsByTeacher = (groups as (Group & { course: { level: string } })[] | null)?.reduce(
    (acc, g) => {
      if (!g.teacher_id) return acc;
      (acc[g.teacher_id] ||= []).push(g);
      return acc;
    },
    {} as Record<string, (Group & { course: { level: string } })[]>
  );

  return (
    <div>
      <h1 className="mb-1 font-serif text-2xl font-bold text-palace-dark">{tr.teachers}</h1>
      <p className="mb-6 text-sm text-palace-dark/60">
        Promote a registered user to "Teacher" below to give them access to the teacher
        dashboard (group schedule, availability, lesson materials).
      </p>

      <div className="card mb-8">
        <h2 className="mb-3 text-lg font-semibold">Current teachers</h2>
        {!teachers?.length && <p className="text-sm text-palace-dark/50">No teachers yet.</p>}
        <div className="space-y-3">
          {(teachers as Profile[] | null)?.map((t) => (
            <div key={t.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-black/5 p-3">
              <div>
                <p className="font-medium">{t.full_name || t.email}</p>
                <p className="text-sm text-palace-dark/50">{t.email}</p>
                <p className="mt-1 text-xs text-palace-dark/40">
                  Groups: {groupsByTeacher?.[t.id]?.map((g) => `${g.course.level} (${g.name})`).join(", ") || "none yet"}
                </p>
              </div>
              <form action={setUserRoleAction} className="flex items-center gap-2">
                <input type="hidden" name="id" value={t.id} />
                <select name="role" defaultValue="teacher" className="input w-auto py-1.5">
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                  <option value="student">Student</option>
                </select>
                <button type="submit" className="btn-secondary py-1.5">Update</button>
              </form>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h2 className="mb-3 text-lg font-semibold">Promote a user to teacher</h2>
        <p className="mb-3 text-sm text-palace-dark/50">
          Users appear here after they sign up at <code>/signup</code>.
        </p>
        <div className="space-y-2">
          {(others as Profile[] | null)?.map((u) => (
            <div key={u.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-black/5 p-3">
              <div>
                <p className="font-medium">{u.full_name || u.email}</p>
                <p className="text-sm text-palace-dark/50">{u.email} · role: {u.role}</p>
              </div>
              <form action={setUserRoleAction}>
                <input type="hidden" name="id" value={u.id} />
                <input type="hidden" name="role" value="teacher" />
                <button type="submit" className="btn-primary py-1.5">Make teacher</button>
              </form>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
