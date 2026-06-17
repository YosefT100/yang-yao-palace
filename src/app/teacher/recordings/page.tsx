import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatDateTime } from "@/lib/utils";

export default async function TeacherRecordingsPage() {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();

  const { data: lessons } = await supabase
    .from("lessons")
    .select("id, title, scheduled_at, status, group:groups!inner(name, teacher_id, course:courses(level))")
    .eq("groups.teacher_id", auth.user!.id)
    .eq("status", "completed")
    .order("scheduled_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-palace-dark">Recordings</h1>
        <p className="mt-1 text-sm text-palace-dark/60">All completed lessons with available recordings.</p>
      </div>

      <div className="card">
        {!lessons?.length ? (
          <p className="text-sm text-palace-dark/50">No completed lessons yet.</p>
        ) : (
          <ul className="divide-y divide-black/5 text-sm">
            {(lessons as any[]).map((l) => (
              <li key={l.id} className="flex items-center justify-between py-3">
                <div>
                  <span className="font-medium text-palace-dark">
                    {l.group.course.level} · {l.group.name}
                  </span>
                  <span className="ml-2 text-palace-dark/50">— {l.title}</span>
                  <p className="mt-0.5 text-xs text-palace-dark/40">{formatDateTime(l.scheduled_at)}</p>
                </div>
                <Link href={`/teacher/lessons/${l.id}`} className="btn-secondary text-xs">
                  View &amp; Recordings →
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
