import { createClient } from "@/lib/supabase/server";
import {
  selectLessonMaterialAction,
  updateLessonNotesAction,
  createTeacherMaterialAction,
} from "@/app/teacher/actions";
import { formatDateTime } from "@/lib/utils";
import { HSKCurriculum } from "@/components/HSKCurriculum";
import StartVideoLesson from "@/components/StartVideoLesson";
import RecordingsLibrary from "@/components/RecordingsLibrary";

export default async function TeacherLessonPage({ params }: { params: { lessonId: string } }) {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();

  const { data: lesson } = await supabase
    .from("lessons")
    .select("*, group:groups(*, course:courses(*))")
    .eq("id", params.lessonId)
    .single();

  if (!lesson) return <p>Lesson not found.</p>;

  // Parallel: lesson position + materials + enrolled students
  const [{ data: allLessons }, { data: materials }, { data: members }] = await Promise.all([
    supabase
      .from("lessons")
      .select("id")
      .eq("group_id", lesson.group_id)
      .order("scheduled_at"),
    supabase
      .from("materials")
      .select("*")
      .eq("course_id", lesson.group.course_id)
      .or(`teacher_id.eq.${auth.user!.id},teacher_id.is.null`)
      .order("created_at", { ascending: false }),
    supabase
      .from("group_members")
      .select("*, student:profiles(id, full_name, email)")
      .eq("group_id", lesson.group_id),
  ]);

  const lessonIndex = allLessons?.findIndex((l) => l.id === lesson.id) ?? -1;
  const lessonNumber = lessonIndex + 1;
  const totalLessons = allLessons?.length ?? 0;

  const level = lesson.group.course.level as string;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-sm text-palace-dark/50">
          <a href="/teacher/schedule" className="hover:underline">← Schedule</a>
        </p>
        <h1 className="font-serif text-2xl font-bold text-palace-dark">
          {level} · {lesson.title}
        </h1>
        <p className="text-sm text-palace-dark/60">
          {formatDateTime(lesson.scheduled_at)} · {lesson.duration_minutes} min
          {lessonNumber > 0 && (
            <span className="ml-3 rounded-full bg-palace-gold/15 px-2.5 py-0.5 text-xs font-semibold text-palace-gold">
              Lesson {lessonNumber} / {totalLessons}
            </span>
          )}
        </p>
      </div>

      {/* Video lesson */}
      <div className="card">
        <h2 className="mb-3 text-lg font-semibold">Video Lesson</h2>
        <StartVideoLesson lessonId={params.lessonId} />
      </div>

      {/* Recordings */}
      <div className="card">
        <h2 className="mb-3 text-lg font-semibold">Recordings</h2>
        <RecordingsLibrary roomName={params.lessonId} />
      </div>

      {/* Material selection */}
      <div className="card">
        <h2 className="mb-3 text-lg font-semibold">Choose presentation / material</h2>
        <form action={selectLessonMaterialAction} className="flex flex-wrap items-center gap-2">
          <input type="hidden" name="lesson_id" value={lesson.id} />
          <select className="input max-w-md" name="material_id" defaultValue={lesson.material_id ?? ""}>
            <option value="">— None selected —</option>
            {materials?.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title} {m.teacher_id ? "(mine)" : "(shared)"}
              </option>
            ))}
          </select>
          <button type="submit" className="btn-primary">Save</button>
        </form>
        {lesson.material_id && (
          <p className="mt-3 text-sm text-palace-dark/60">
            {materials?.find((m) => m.id === lesson.material_id)?.file_url && (
              <a
                href={materials!.find((m) => m.id === lesson.material_id)!.file_url!}
                target="_blank"
                className="text-palace-red hover:underline"
              >
                Open material →
              </a>
            )}
          </p>
        )}
      </div>

      {/* Add material */}
      <div className="card">
        <h2 className="mb-3 text-lg font-semibold">Add your own material</h2>
        <form action={createTeacherMaterialAction} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input type="hidden" name="course_id" value={lesson.group.course_id} />
          <input type="hidden" name="lesson_id" value={lesson.id} />
          <input className="input" name="title" placeholder="Title (e.g. Lesson 3 - Family vocab)" required />
          <input className="input" name="file_url" placeholder="Link (Google Slides, PDF, etc.)" />
          <select className="input" name="file_type" defaultValue="presentation">
            <option value="presentation">Presentation</option>
            <option value="pdf">PDF</option>
            <option value="doc">Document</option>
            <option value="video">Video</option>
            <option value="link">Link</option>
          </select>
          <button type="submit" className="btn-secondary">Add to my library</button>
        </form>
      </div>

      {/* HSK Curriculum */}
      <div className="card">
        <h2 className="mb-1 text-lg font-semibold">HSK Materials — {level}</h2>
        <p className="mb-3 text-xs text-palace-dark/50">
          Curriculum guide for this level. Highlighted week matches current lesson.
        </p>
        <HSKCurriculum level={level} currentLesson={lessonNumber || undefined} />
      </div>

      {/* Enrolled students */}
      <div className="card">
        <h2 className="mb-3 text-lg font-semibold">
          Enrolled students
          <span className="ml-2 text-sm font-normal text-palace-dark/50">({members?.length ?? 0})</span>
        </h2>
        {!members?.length ? (
          <p className="text-sm text-palace-dark/50">No students enrolled yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/5 text-left text-xs text-palace-dark/50">
                  <th className="pb-2 pr-4 font-medium">Name</th>
                  <th className="pb-2 pr-4 font-medium">Email</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {(members as any[]).map((m) => (
                  <tr key={m.id}>
                    <td className="py-2 pr-4 font-medium text-palace-dark">
                      {m.student?.full_name || "—"}
                    </td>
                    <td className="py-2 pr-4 text-palace-dark/60">
                      {m.student?.email || "—"}
                    </td>
                    <td className="py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          m.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {m.status ?? "pending"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Notes & status */}
      <div className="card">
        <h2 className="mb-3 text-lg font-semibold">Notes & status</h2>
        <form action={updateLessonNotesAction} className="space-y-3">
          <input type="hidden" name="lesson_id" value={lesson.id} />
          <div>
            <label className="label">Lesson notes</label>
            <textarea className="input" name="notes" rows={3} defaultValue={lesson.notes ?? ""} />
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input w-auto" name="status" defaultValue={lesson.status}>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <button type="submit" className="btn-primary">Save</button>
        </form>
      </div>
    </div>
  );
}
