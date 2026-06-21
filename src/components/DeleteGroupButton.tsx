"use client";

import { Trash2 } from "lucide-react";
import { deleteGroupAction } from "@/app/admin/actions";

export function DeleteGroupButton({ groupId }: { groupId: string }) {
  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this group and ALL its lessons and members? This cannot be undone.")) return;
    const fd = new FormData();
    fd.append("group_id", groupId);
    await deleteGroupAction(fd);
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
