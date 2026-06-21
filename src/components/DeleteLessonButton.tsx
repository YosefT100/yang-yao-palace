"use client";

import { Trash2 } from "lucide-react";
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
      aria-label="Delete"
      className="cursor-pointer text-red-600 hover:text-red-700"
    >
      <Trash2 size={16} />
    </button>
  );
}
