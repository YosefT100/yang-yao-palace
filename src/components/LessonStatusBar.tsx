"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateLessonStatusAction } from "@/app/teacher/actions";
import { LessonStatusBadge } from "./LessonStatusBadge";

export function LessonStatusBar({
  lessonId,
  currentStatus,
}: {
  lessonId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [showCancel, setShowCancel] = useState(false);
  const [reason, setReason] = useState("");

  function update(status: string, cancelReason?: string) {
    startTransition(async () => {
      await updateLessonStatusAction(lessonId, status, cancelReason);
      router.refresh();
    });
  }

  return (
    <div className="card flex flex-wrap items-start gap-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-palace-dark/60">Status:</span>
        <LessonStatusBadge status={currentStatus} />
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          disabled={pending || currentStatus === "completed"}
          onClick={() => { setShowCancel(false); update("completed"); }}
          className="rounded-lg bg-green-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          ✅ Mark Complete
        </button>

        {!showCancel ? (
          <button
            disabled={pending || currentStatus === "cancelled"}
            onClick={() => setShowCancel(true)}
            className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ❌ Cancel Lesson
          </button>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <input
              autoFocus
              className="input text-sm"
              placeholder="Reason for cancellation…"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <button
              disabled={pending}
              onClick={() => { update("cancelled", reason || undefined); setShowCancel(false); }}
              className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-40"
            >
              Confirm Cancel
            </button>
            <button
              onClick={() => { setShowCancel(false); setReason(""); }}
              className="rounded-lg bg-gray-200 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-300"
            >
              Back
            </button>
          </div>
        )}

        <button
          disabled={pending}
          onClick={() => {
            setShowCancel(false);
            update(currentStatus === "incomplete" ? "scheduled" : "incomplete");
          }}
          className="rounded-lg bg-yellow-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-yellow-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          🔄 Mark Incomplete / Resume
        </button>
      </div>
    </div>
  );
}
