"use client";

import { useState } from "react";

export default function VideoRoom({ roomUrl, token }: { roomUrl: string; token: string }) {
  const [loaded, setLoaded] = useState(false);
  const src = `${roomUrl}?t=${token}`;

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-black/10" style={{ height: 600 }}>
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-palace-dark/5">
          <p className="text-sm text-palace-dark/50">Connecting to video room…</p>
        </div>
      )}
      <iframe
        src={src}
        allow="camera; microphone; fullscreen; speaker; display-capture"
        className="h-full w-full border-0"
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}
