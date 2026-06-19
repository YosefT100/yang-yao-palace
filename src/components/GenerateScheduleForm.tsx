"use client";

import { useState } from "react";
import { generateLessonsAction } from "@/app/admin/actions";

const WEEK_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 16, 20, 24];

export function GenerateScheduleForm({
  groupId,
  slotsPerWeek,
}: {
  groupId: string;
  slotsPerWeek: number;
}) {
  const [weeks, setWeeks] = useState(4);
  const expected = weeks * slotsPerWeek;

  return (
    <form action={generateLessonsAction} className="flex items-center gap-2 flex-wrap">
      <input type="hidden" name="group_id" value={groupId} />
      <input type="hidden" name="weeks" value={weeks} />
      <select
        className="input w-auto py-1.5"
        value={weeks}
        onChange={(e) => setWeeks(Number(e.target.value))}
      >
        {WEEK_OPTIONS.map((w) => (
          <option key={w} value={w}>{w} {w === 1 ? "week" : "weeks"}</option>
        ))}
      </select>
      <span className="text-sm text-palace-dark/50 whitespace-nowrap">
        {slotsPerWeek === 0
          ? "No time slots set"
          : `Will generate ${expected} lesson${expected !== 1 ? "s" : ""}`}
      </span>
      <button type="submit" className="btn-primary py-1.5">Generate schedule</button>
    </form>
  );
}
