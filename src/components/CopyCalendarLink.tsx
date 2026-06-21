"use client";

import { useState } from "react";

export function CopyCalendarLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="whitespace-nowrap rounded bg-palace-red px-3 py-2 text-sm font-semibold text-white hover:bg-palace-red/90"
    >
      {copied ? "Copied!" : "Copy Link"}
    </button>
  );
}
