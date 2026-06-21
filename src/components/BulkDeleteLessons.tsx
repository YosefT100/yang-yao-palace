"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteLessonsByIdsAction } from "@/app/admin/actions";
import { DeleteLessonButton } from "./DeleteLessonButton";
import { formatDateTime } from "@/lib/utils";

type Lesson = {
  id: string;
  scheduled_at: string;
  lesson_type: string;
  status: string;
  group?: { name?: string; course?: { level?: string }; teacher?: { full_name?: string; email?: string } };
  material?: { title?: string };
};

export function BulkDeleteLessons({ lessons }: { lessons: Lesson[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const allSelected = lessons.length > 0 && selected.size === lessons.length;

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(lessons.map((l) => l.id)));
  }

  async function handleBulkDelete() {
    const answer = window.prompt(
      `Type DELETE to confirm deleting ${selected.size} lesson(s). This cannot be undone.`
    );
    if (answer !== "DELETE") return;
    await deleteLessonsByIdsAction(Array.from(selected));
    setSelected(new Set());
    router.refresh();
  }

  return (
    <div>
      <div className="mb-3 flex items-center gap-3">
        <button
          onClick={handleBulkDelete}
          disabled={selected.size === 0}
          className="rounded bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {selected.size > 0 ? `Delete Selected (${selected.size})` : "Delete Selected"}
        </button>
      </div>

      <div className="card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/5 text-left text-palace-dark/50">
              <th className="py-2 pr-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  aria-label="Select all"
                />
              </th>
              <th className="py-2">When</th>
              <th className="py-2">Level / Group</th>
              <th className="py-2">Teacher</th>
              <th className="py-2">Type</th>
              <th className="py-2">Material</th>
              <th className="py-2">Status</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {lessons.map((l) => (
              <tr
                key={l.id}
                className={`border-b border-black/5 ${selected.has(l.id) ? "bg-red-50" : ""}`}
              >
                <td className="py-2 pr-3">
                  <input
                    type="checkbox"
                    checked={selected.has(l.id)}
                    onChange={() => toggle(l.id)}
                    aria-label="Select lesson"
                  />
                </td>
                <td className="whitespace-nowrap py-2">{formatDateTime(l.scheduled_at)}</td>
                <td className="py-2 font-medium">
                  {l.group?.course?.level} · {l.group?.name}
                </td>
                <td className="py-2">
                  {l.group?.teacher?.full_name || l.group?.teacher?.email || "—"}
                </td>
                <td className="py-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      l.lesson_type === "bonus"
                        ? "bg-palace-gold/20 text-palace-gold"
                        : "bg-palace-red/10 text-palace-red"
                    }`}
                  >
                    {l.lesson_type === "bonus" ? "Bonus" : "Regular"}
                  </span>
                </td>
                <td className="py-2 text-palace-dark/60">{l.material?.title || "—"}</td>
                <td className="py-2 capitalize text-palace-dark/60">{l.status}</td>
                <td className="py-2">
                  <DeleteLessonButton lessonId={l.id} />
                </td>
              </tr>
            ))}
            {lessons.length === 0 && (
              <tr>
                <td colSpan={8} className="py-4 text-center text-palace-dark/50">
                  No lessons scheduled yet. Generate a schedule from a group&apos;s page.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
