import { createClient } from "@/lib/supabase/server";
import { setUserRoleAction } from "@/app/admin/actions";
import type { Profile } from "@/types/database";
import { getLocale } from "@/lib/i18n-server";
import { t } from "@/lib/i18n";

export default async function AdminStudentsPage() {
  const tr = t(getLocale()).pages;
  const supabase = createClient();
  const { data: students } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "student")
    .order("created_at", { ascending: false });

  const { data: memberships } = await supabase
    .from("group_members")
    .select("student_id, status, group:groups(name, course:courses(level))");

  const groupsByStudent = (memberships ?? []).reduce((acc: Record<string, string[]>, m: any) => {
    (acc[m.student_id] ||= []).push(`${m.group?.course?.level} - ${m.group?.name} (${m.status})`);
    return acc;
  }, {});

  return (
    <div>
      <h1 className="mb-1 font-serif text-2xl font-bold text-palace-dark">{tr.students}</h1>
      <p className="mb-6 text-sm text-palace-dark/60">
        All registered students. Add them to a group from the group's page.
      </p>

      <div className="card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/5 text-left text-palace-dark/50">
              <th className="py-2">Name</th>
              <th className="py-2">Email</th>
              <th className="py-2">Groups</th>
              <th className="py-2">Role</th>
            </tr>
          </thead>
          <tbody>
            {(students as Profile[] | null)?.map((s) => (
              <tr key={s.id} className="border-b border-black/5">
                <td className="py-2 font-medium">{s.full_name || "—"}</td>
                <td className="py-2">{s.email}</td>
                <td className="py-2 text-palace-dark/60">{groupsByStudent[s.id]?.join(", ") || "Not enrolled"}</td>
                <td className="py-2">
                  <form action={setUserRoleAction} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={s.id} />
                    <select name="role" defaultValue="student" className="input w-auto py-1">
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button type="submit" className="btn-secondary py-1">Update</button>
                  </form>
                </td>
              </tr>
            ))}
            {!students?.length && (
              <tr><td colSpan={4} className="py-4 text-center text-palace-dark/50">No students yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
