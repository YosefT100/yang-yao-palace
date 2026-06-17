import { createClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/utils";
import JoinLesson from "@/components/JoinLesson";

export default async function StudentGroupPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: group } = await supabase
    .from("groups")
    .select("*, course:courses(*), teacher:profiles(full_name, email)")
    .eq("id", params.id)
    .single();

  const { data: lessons } = await supabase
    .from("lessons")
    .select("*, material:materials(title, file_url)")
    .eq("group_id", params.id)
    .order("scheduled_at");

  if (!group) return <p>Group not found.</p>;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-palace-dark/50">
          <a href="/student" className="hover:underline">← My courses</a>
        </p>
        <h1 className="font-serif text-2xl font-bold text-palace-dark">{group.course.level} · {group.name}</h1>
        <p className="text-sm text-palace-dark/60">Teacher: {group.teacher?.full_name || group.teacher?.email}</p>
      </div>

      <div className="card">
        <h2 className="mb-3 text-lg font-semibold">Lessons</h2>
        <ul className="divide-y divide-black/5 text-sm">
          {lessons?.map((l: any) => (
            <li key={l.id} className="flex items-center justify-between gap-4 py-2">
              <span>
                <span className={`mr-2 rounded-full px-2 py-0.5 text-xs font-semibold ${l.lesson_type === "bonus" ? "bg-palace-gold/20 text-palace-gold" : "bg-palace-red/10 text-palace-red"}`}>
                  {l.lesson_type === "bonus" ? "Bonus" : "Regular"}
                </span>
                {formatDateTime(l.scheduled_at)} — {l.title}
              </span>
              <div className="flex shrink-0 items-center gap-3">
                {l.status === "scheduled" && <JoinLesson roomName={l.id} />}
                {l.material?.file_url ? (
                  <a href={l.material.file_url} target="_blank" className="text-palace-red hover:underline">
                    {l.material.title}
                  </a>
                ) : (
                  <span className="text-palace-dark/40">Material TBA</span>
                )}
              </div>
            </li>
          ))}
          {!lessons?.length && <li className="py-2 text-palace-dark/50">No lessons scheduled yet.</li>}
        </ul>
      </div>
    </div>
  );
}
