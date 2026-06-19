"use client";

import { useState } from "react";
import { markAttendanceAction } from "@/app/teacher/actions";

interface Student {
  id: string;
  full_name: string;
  email: string;
}

export function AttendanceForm({
  lessonId,
  students,
  currentStatus,
}: {
  lessonId: string;
  students: Student[];
  currentStatus: string;
}) {
  const [presentIds, setPresentIds] = useState<Set<string>>(
    new Set(students.map((s) => s.id))
  );
  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const toggle = (id: string) =>
    setPresentIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const submit = async (status: "completed" | "cancelled") => {
    setSubmitting(true);
    const fd = new FormData();
    fd.append("lesson_id", lessonId);
    fd.append("status", status);
    fd.append("cancel_reason", cancelReason);
    fd.append(
      "students_present",
      students
        .filter((s) => presentIds.has(s.id))
        .map((s) => s.full_name || s.email)
        .join(", ")
    );
    fd.append(
      "absent_students",
      students
        .filter((s) => !presentIds.has(s.id))
        .map((s) => s.full_name || s.email)
        .join(", ")
    );
    fd.append("absent_reason", status === "cancelled" ? cancelReason : "");
    await markAttendanceAction(fd);
    setSubmitting(false);
  };

  if (currentStatus === "completed" || currentStatus === "cancelled") {
    return (
      <p className="text-sm text-palace-dark/50">
        Lesson already marked as <strong className="capitalize">{currentStatus}</strong>.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {students.length === 0 ? (
        <p className="text-sm text-palace-dark/45">No students enrolled in this group.</p>
      ) : (
        <div>
          <p className="mb-3 text-sm font-medium text-palace-dark/70">Mark attendance:</p>
          <div className="space-y-2">
            {students.map((s) => {
              const present = presentIds.has(s.id);
              return (
                <label key={s.id} className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={present}
                    onChange={() => toggle(s.id)}
                    className="h-4 w-4 rounded border-gray-300 accent-palace-red"
                  />
                  <span className="text-sm text-palace-dark">{s.full_name || s.email}</span>
                  <span className={`text-xs font-medium ${present ? "text-green-600" : "text-red-500"}`}>
                    {present ? "Present" : "Absent"}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => submit("completed")}
          disabled={submitting}
          className="btn-primary disabled:opacity-60"
        >
          {submitting ? "Saving…" : "Mark as Completed"}
        </button>
        <button
          onClick={() => setShowCancel((v) => !v)}
          disabled={submitting}
          className="inline-flex items-center justify-center rounded-lg border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-600 cursor-pointer transition-all duration-150 hover:bg-red-50 disabled:opacity-60"
        >
          {showCancel ? "Hide" : "Mark as Cancelled"}
        </button>
      </div>

      {showCancel && (
        <div className="space-y-3 rounded-xl border border-red-100 bg-red-50/50 p-4">
          <input
            type="text"
            className="input"
            placeholder="Reason for cancellation…"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
          <button
            onClick={() => submit("cancelled")}
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white cursor-pointer transition-all duration-150 hover:bg-red-700 disabled:opacity-60"
          >
            {submitting ? "Saving…" : "Confirm Cancel Lesson"}
          </button>
        </div>
      )}
    </div>
  );
}
