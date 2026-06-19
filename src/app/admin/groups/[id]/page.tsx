import { createClient } from "@/lib/supabase/server";
import {
  updateGroupAction,
  addGroupMemberAction,
  removeGroupMemberAction,
} from "@/app/admin/actions";
import { addAvailabilityAction, deleteAvailabilityAction } from "@/app/teacher/actions";
import { dayName, formatTime, formatDateTime, courseSlotPlan } from "@/lib/utils";
import type { Profile } from "@/types/database";
import { GenerateScheduleForm } from "@/components/GenerateScheduleForm";

export default async function AdminGroupDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const groupId = params.id;

  const { data: group } = await supabase
    .from("groups")
    .select("*, course:courses(*), teacher:profiles(*)")
    .eq("id", groupId)
    .single();

  if (!group) {
    return <p>Group not found.</p>;
  }

  const [{ data: teachers }, { data: students }, { data: members }, { data: availability }, { data: lessons }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("role", "teacher").order("full_name"),
      supabase.from("profiles").select("*").eq("role", "student").order("full_name"),
      supabase.from("group_members").select("*, student:profiles(*)").eq("group_id", groupId),
      supabase.from("availability").select("*").eq("group_id", groupId).order("day_of_week"),
      supabase.from("lessons").select("*, material:materials(title)").eq("group_id", groupId).order("scheduled_at").limit(20),
    ]);

  const memberIds = new Set((members ?? []).map((m: any) => m.student_id));
  const availableStudents = (students as Profile[] | null)?.filter((s) => !memberIds.has(s.id));
  const slotPlan = courseSlotPlan(group.course.sessions_per_week, group.course.has_bonus_lesson);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-palace-dark/50">
          <a href="/admin/groups" className="hover:underline">← Groups</a>
        </p>
        <h1 className="font-serif text-2xl font-bold text-palace-dark">
          {group.course.level} · {group.name}
        </h1>
      </div>

      {/* Group settings */}
      <form action={updateGroupAction} className="card grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <input type="hidden" name="id" value={group.id} />
        <div className="sm:col-span-2">
          <label className="label">Group name</label>
          <input className="input" name="name" defaultValue={group.name} />
        </div>
        <div>
          <label className="label">Teacher</label>
          <select className="input" name="teacher_id" defaultValue={group.teacher_id ?? ""}>
            <option value="">Unassigned</option>
            {(teachers as Profile[] | null)?.map((t) => (
              <option key={t.id} value={t.id}>{t.full_name || t.email}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Capacity</label>
          <input className="input" type="number" name="capacity" defaultValue={group.capacity} min={1} />
        </div>
        <div className="flex items-end gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="is_active" defaultChecked={group.is_active} />
            Active
          </label>
          <button type="submit" className="btn-primary">Save</button>
        </div>
      </form>

      {/* Cadence + Availability */}
      <div className="card">
        <h2 className="mb-1 text-lg font-semibold">Weekly schedule (teacher's fixed time slots)</h2>
        <p className="mb-4 text-sm text-palace-dark/60">
          {group.course.level} requires: {slotPlan.map((s) => s.label).join(", ")}
          {" "}({group.course.lesson_duration_minutes} min each). Add one time slot per item below.
        </p>

        <ul className="mb-4 divide-y divide-black/5">
          {availability?.map((a: any) => (
            <li key={a.id} className="flex items-center justify-between py-2 text-sm">
              <span>
                <span className={`mr-2 rounded-full px-2 py-0.5 text-xs font-semibold ${a.slot_type === "bonus" ? "bg-palace-gold/20 text-palace-gold" : "bg-palace-red/10 text-palace-red"}`}>
                  {a.slot_type === "bonus" ? "Bonus" : "Regular"}
                </span>
                {dayName(a.day_of_week)} · {formatTime(a.start_time)}–{formatTime(a.end_time)}
                {a.label ? ` · ${a.label}` : ""}
              </span>
              <form action={deleteAvailabilityAction}>
                <input type="hidden" name="id" value={a.id} />
                <input type="hidden" name="group_id" value={groupId} />
                <button type="submit" className="text-palace-red hover:underline">Remove</button>
              </form>
            </li>
          ))}
          {!availability?.length && (
            <li className="py-2 text-sm text-palace-dark/50">No time slots set yet.</li>
          )}
        </ul>

        <form action={addAvailabilityAction} className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          <input type="hidden" name="group_id" value={groupId} />
          <input type="hidden" name="teacher_id" value={group.teacher_id ?? ""} />
          <select className="input" name="day_of_week" required>
            {["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"].map((d, i) => (
              <option key={d} value={i}>{d}</option>
            ))}
          </select>
          <input className="input" type="time" name="start_time" required />
          <input className="input" type="time" name="end_time" required />
          <select className="input" name="slot_type">
            <option value="regular">Regular</option>
            {group.course.has_bonus_lesson && <option value="bonus">Bonus</option>}
          </select>
          <button type="submit" className="btn-secondary">Add slot</button>
        </form>
      </div>

      {/* Lessons */}
      <div className="card">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Lessons</h2>
          <GenerateScheduleForm groupId={groupId} slotsPerWeek={availability?.length ?? 0} />
        </div>
        <ul className="divide-y divide-black/5 text-sm">
          {lessons?.map((l: any) => (
            <li key={l.id} className="flex items-center justify-between py-2">
              <span>
                <span className={`mr-2 rounded-full px-2 py-0.5 text-xs font-semibold ${l.lesson_type === "bonus" ? "bg-palace-gold/20 text-palace-gold" : "bg-palace-red/10 text-palace-red"}`}>
                  {l.lesson_type === "bonus" ? "Bonus" : "Regular"}
                </span>
                {formatDateTime(l.scheduled_at)} — {l.title}
              </span>
              <span className="text-palace-dark/50">{l.material?.title || "No material selected"}</span>
            </li>
          ))}
          {!lessons?.length && <li className="py-2 text-palace-dark/50">No lessons scheduled yet.</li>}
        </ul>
      </div>

      {/* Members */}
      <div className="card">
        <h2 className="mb-3 text-lg font-semibold">Students ({members?.length ?? 0} / {group.capacity})</h2>
        <ul className="mb-4 divide-y divide-black/5 text-sm">
          {members?.map((m: any) => (
            <li key={m.id} className="flex items-center justify-between py-2">
              <span>{m.student?.full_name || m.student?.email} <span className="text-palace-dark/40">· {m.status}</span></span>
              <form action={removeGroupMemberAction}>
                <input type="hidden" name="id" value={m.id} />
                <input type="hidden" name="group_id" value={groupId} />
                <button type="submit" className="text-palace-red hover:underline">Remove</button>
              </form>
            </li>
          ))}
          {!members?.length && <li className="py-2 text-palace-dark/50">No students yet.</li>}
        </ul>
        <form action={addGroupMemberAction} className="flex gap-2">
          <input type="hidden" name="group_id" value={groupId} />
          <select className="input" name="student_id" required>
            <option value="">Add a student…</option>
            {availableStudents?.map((s) => (
              <option key={s.id} value={s.id}>{s.full_name || s.email}</option>
            ))}
          </select>
          <button type="submit" className="btn-secondary whitespace-nowrap">Add</button>
        </form>
      </div>
    </div>
  );
}
