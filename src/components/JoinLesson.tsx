"use client";

import { useState } from "react";
import VideoRoom from "@/components/VideoRoom";

export default function JoinLesson({ roomName }: { roomName: string }) {
  const [state, setState] = useState<{ roomUrl: string; token: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleJoin() {
    setLoading(true);
    const data = await fetch("/api/daily/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomName, isOwner: false }),
    }).then(r => r.json());
    setLoading(false);
    if (data.token) {
      setState({ roomUrl: `https://yangYaoPalace.daily.co/${roomName}`, token: data.token });
    }
  }

  if (state) return <VideoRoom roomUrl={state.roomUrl} token={state.token} />;

  return (
    <button onClick={handleJoin} disabled={loading} className="btn-primary">
      {loading ? "Joining…" : "▶ Join Lesson"}
    </button>
  );
}
