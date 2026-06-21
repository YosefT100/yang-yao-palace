"use client";

import { deleteLessonAction } from "@/app/admin/actions";

export function DeleteLessonButton({ lessonId }: { lessonId: string }) {
  const handleClick = async () => {
    if (!confirm("Delete this lesson? This cannot be undone.")) return;
    const fd = new FormData();
    fd.append("lesson_id", lessonId);
    await deleteLessonAction(fd);
  };

  return (
    <button
      onClick={handleClick}
      className="text-xs text-red-500 hover:text-red-700 hover:underline cursor-pointer"
    >
      Delete
    </button>
  );
}
