const statusMap: Record<string, { label: string; className: string }> = {
  completed:  { label: "✅ Completed",                  className: "bg-green-100 text-green-800" },
  cancelled:  { label: "❌ Cancelled",                  className: "bg-red-100 text-red-800" },
  incomplete: { label: "⚠️ Incomplete - Needs Resuming", className: "bg-yellow-100 text-yellow-800" },
  scheduled:  { label: "📅 Scheduled",                  className: "bg-gray-100 text-gray-700" },
};

export function LessonStatusBadge({ status }: { status: string }) {
  const { label, className } = statusMap[status] ?? statusMap.scheduled;
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}>
      {label}
    </span>
  );
}
