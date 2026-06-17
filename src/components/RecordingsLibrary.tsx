"use client";

import { useEffect, useState } from "react";

type Recording = { id: string; duration: number; download_link: string; created_at: string };

export default function RecordingsLibrary({ roomName }: { roomName: string }) {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/daily/recordings?roomName=${encodeURIComponent(roomName)}`)
      .then(r => r.json())
      .then(d => { setRecordings(d.recordings ?? []); setLoading(false); });
  }, [roomName]);

  if (loading) return <p className="text-sm text-palace-dark/50">Loading recordings…</p>;
  if (!recordings.length) return <p className="text-sm text-palace-dark/50">No recordings yet.</p>;

  return (
    <ul className="divide-y divide-black/5 text-sm">
      {recordings.map((r, i) => (
        <li key={r.id} className="flex items-center justify-between py-2">
          <span className="text-palace-dark/70">
            Recording {i + 1} · {Math.round(r.duration / 60)} min ·{" "}
            {new Date(r.created_at).toLocaleDateString()}
          </span>
          <a
            href={r.download_link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-palace-red hover:underline"
          >
            ▶ Play / Download
          </a>
        </li>
      ))}
    </ul>
  );
}
