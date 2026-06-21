"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { deleteGroupsByIdsAction } from "@/app/admin/actions";
import { DeleteGroupButton } from "./DeleteGroupButton";

type Group = {
  id: string;
  name: string;
  is_active: boolean;
  capacity: number;
  course?: { level?: string };
  teacher?: { full_name?: string; email?: string };
  group_members?: { count: number }[];
};

export function BulkDeleteGroups({ groups }: { groups: Group[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const allSelected = groups.length > 0 && selected.size === groups.length;

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(groups.map((g) => g.id)));
  }

  async function handleBulkDelete() {
    const answer = window.prompt(
      `Type DELETE to confirm deleting ${selected.size} group(s) and ALL their lessons and members. This cannot be undone.`
    );
    if (answer !== "DELETE") return;
    await deleteGroupsByIdsAction(Array.from(selected));
    setSelected(new Set());
    router.refresh();
  }

  return (
    <div>
      <div className="mb-3 flex items-center gap-3">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-palace-dark/60">
          <input type="checkbox" checked={allSelected} onChange={toggleAll} />
          Select All
        </label>
        <button
          onClick={handleBulkDelete}
          disabled={selected.size === 0}
          className="rounded bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {selected.size > 0 ? `Delete Selected (${selected.size})` : "Delete Selected"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((g) => (
          <div
            key={g.id}
            className={`card relative hover:shadow-md ${selected.has(g.id) ? "ring-2 ring-red-400" : ""}`}
          >
            <div className="mb-2 flex items-center gap-2">
              <input
                type="checkbox"
                checked={selected.has(g.id)}
                onChange={() => toggle(g.id)}
                aria-label="Select group"
              />
            </div>
            <Link href={`/admin/groups/${g.id}`} className="block">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-palace-red/10 px-2.5 py-1 text-xs font-bold text-palace-red">
                  {g.course?.level}
                </span>
                {!g.is_active && (
                  <span className="rounded-full bg-black/5 px-2.5 py-1 text-xs text-palace-dark/50">
                    Inactive
                  </span>
                )}
              </div>
              <h2 className="mt-2 font-semibold">{g.name}</h2>
              <p className="mt-1 text-sm text-palace-dark/60">
                Teacher: {g.teacher?.full_name || g.teacher?.email || "Unassigned"}
              </p>
              <p className="mt-1 text-sm text-palace-dark/50">
                {g.group_members?.[0]?.count ?? 0} / {g.capacity} students
              </p>
            </Link>
            <div className="mt-2 flex justify-end">
              <DeleteGroupButton groupId={g.id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
