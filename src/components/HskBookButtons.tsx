"use client";

export function HskBookButtons({
  level,
  hasTextbook,
  hasWorkbook,
}: {
  level: string;
  hasTextbook: boolean;
  hasWorkbook: boolean;
}) {
  async function open(type: "textbook" | "workbook") {
    const res = await fetch(`/api/hsk-book-url?level=${level}&type=${type}`);
    if (!res.ok) return;
    const { url } = await res.json();
    window.open(url, "_blank");
  }

  return (
    <div className="mt-3 flex gap-2">
      <button
        type="button"
        disabled={!hasTextbook}
        onClick={() => open("textbook")}
        className={`flex items-center gap-1 rounded border px-3 py-1 text-xs transition-all ${
          hasTextbook
            ? "border-palace-gold text-palace-gold hover:bg-palace-gold hover:text-white"
            : "cursor-not-allowed border-gray-200 text-gray-300 opacity-50"
        }`}
      >
        📖 Textbook
      </button>
      <button
        type="button"
        disabled={!hasWorkbook}
        onClick={() => open("workbook")}
        className={`flex items-center gap-1 rounded border px-3 py-1 text-xs transition-all ${
          hasWorkbook
            ? "border-palace-gold text-palace-gold hover:bg-palace-gold hover:text-white"
            : "cursor-not-allowed border-gray-200 text-gray-300 opacity-50"
        }`}
      >
        📝 Workbook
      </button>
    </div>
  );
}
