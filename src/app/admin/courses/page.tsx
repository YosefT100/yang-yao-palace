import { createClient } from "@/lib/supabase/server";
import { updateCourseAction, createMaterialAction } from "@/app/admin/actions";
import type { Course } from "@/types/database";
import { getLocale } from "@/lib/i18n-server";
import { t } from "@/lib/i18n";

export default async function AdminCoursesPage() {
  const tr = t(getLocale()).pages;
  const supabase = createClient();
  const { data: courses } = await supabase.from("courses").select("*").order("sort_order");
  const { data: materials } = await supabase
    .from("materials")
    .select("*, course:courses(level)")
    .is("teacher_id", null)
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="mb-1 font-serif text-2xl font-bold text-palace-dark">{tr.courses}</h1>
      <p className="mb-6 text-sm text-palace-dark/60">
        Define the weekly cadence and price for each level. Standard rules: HSK1 & HSK2
        run twice a week plus a bonus lesson, HSK3 runs twice a week, HSK4+ runs once a week —
        but every value below is editable.
      </p>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {(courses as Course[] | null)?.map((course) => (
          <form key={course.id} action={updateCourseAction} className="card space-y-3">
            <input type="hidden" name="id" value={course.id} />
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-palace-red">{course.level}</h2>
              <label className="flex items-center gap-2 text-sm text-palace-dark/60">
                <input type="checkbox" name="is_active" defaultChecked={course.is_active} />
                Active
              </label>
            </div>

            <div>
              <label className="label">Display name</label>
              <input className="input" name="name" defaultValue={course.name} />
            </div>

            <div>
              <label className="label">Description</label>
              <textarea className="input" name="description" defaultValue={course.description ?? ""} rows={2} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Lessons / week</label>
                <input
                  className="input"
                  type="number"
                  name="sessions_per_week"
                  min={1}
                  max={7}
                  defaultValue={course.sessions_per_week}
                />
              </div>
              <div>
                <label className="label">Lesson length (min)</label>
                <input
                  className="input"
                  type="number"
                  name="lesson_duration_minutes"
                  min={15}
                  step={15}
                  defaultValue={course.lesson_duration_minutes}
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="has_bonus_lesson" defaultChecked={course.has_bonus_lesson} />
              Includes weekly bonus lesson
            </label>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Price</label>
                <input
                  className="input"
                  type="number"
                  step="0.01"
                  name="price_amount"
                  defaultValue={(course.price_amount / 100).toFixed(2)}
                />
              </div>
              <div>
                <label className="label">Currency</label>
                <select className="input" name="price_currency" defaultValue={course.price_currency}>
                  <option value="ILS">ILS (₪)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn-primary">Save</button>
          </form>
        ))}
      </div>

      <div className="mt-10 card">
        <h2 className="mb-3 text-lg font-semibold">Shared lesson materials</h2>
        <p className="mb-4 text-sm text-palace-dark/60">
          Upload shared presentations/links per level. Teachers can pick these — or their own —
          when preparing a lesson.
        </p>
        <form action={createMaterialAction} className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <select className="input" name="course_id" required>
            <option value="">Level…</option>
            {(courses as Course[] | null)?.map((c) => (
              <option key={c.id} value={c.id}>{c.level}</option>
            ))}
          </select>
          <input className="input" name="title" placeholder="Title (e.g. Lesson 1 - Greetings)" required />
          <input className="input" name="file_url" placeholder="Link (Google Slides, PDF, etc.)" />
          <select className="input" name="file_type" defaultValue="presentation">
            <option value="presentation">Presentation</option>
            <option value="pdf">PDF</option>
            <option value="doc">Document</option>
            <option value="video">Video</option>
            <option value="link">Link</option>
          </select>
          <button type="submit" className="btn-secondary">Add material</button>
        </form>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/5 text-left text-palace-dark/50">
              <th className="py-2">Level</th>
              <th className="py-2">Title</th>
              <th className="py-2">Type</th>
              <th className="py-2">Link</th>
            </tr>
          </thead>
          <tbody>
            {materials?.map((m: any) => (
              <tr key={m.id} className="border-b border-black/5">
                <td className="py-2 font-medium">{m.course?.level ?? "—"}</td>
                <td className="py-2">{m.title}</td>
                <td className="py-2 capitalize">{m.file_type}</td>
                <td className="py-2">
                  {m.file_url ? (
                    <a href={m.file_url} target="_blank" className="text-palace-red hover:underline">
                      Open
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
