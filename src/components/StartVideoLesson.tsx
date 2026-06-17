"use client";

import { useState } from "react";
import VideoRoom from "@/components/VideoRoom";

export default function StartVideoLesson({ lessonId }: { lessonId: string }) {
  const [state, setState] = useState<{ roomUrl: string; token: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleStart() {
    setLoading(true);
    const [roomRes, tokenRes] = await Promise.all([
      fetch("/api/daily/create-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomName: lessonId }),
      }).then(r => r.json()),
      fetch("/api/daily/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomName: lessonId, isOwner: true }),
      }).then(r => r.json()),
    ]);
    setLoading(false);
    if (roomRes.url && tokenRes.token) {
      setState({ roomUrl: roomRes.url, token: tokenRes.token });
    }
  }

  if (state) return <VideoRoom roomUrl={state.roomUrl} token={state.token} />;

  return (
    <button onClick={handleStart} disabled={loading} className="btn-primary">
      {loading ? "Starting…" : "▶ Start Video Lesson"}
    </button>
  );
}
