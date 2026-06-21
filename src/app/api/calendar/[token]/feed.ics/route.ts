import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function escapeICS(str: string): string {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function toICSDate(isoString: string): string {
  return new Date(isoString).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function foldLine(line: string): string {
  if (line.length <= 75) return line;
  const chunks: string[] = [line.slice(0, 75)];
  let i = 75;
  while (i < line.length) {
    chunks.push(" " + line.slice(i, i + 74));
    i += 74;
  }
  return chunks.join("\r\n");
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { token: string } }
) {
  const supabase = createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("calendar_token", params.token)
    .single();

  if (!profile) {
    return new NextResponse("Not found", { status: 404 });
  }

  const { data: groups } = await supabase
    .from("groups")
    .select("id")
    .eq("teacher_id", profile.id);

  const groupIds = (groups ?? []).map((g: { id: string }) => g.id);

  const lessons =
    groupIds.length > 0
      ? (
          await supabase
            .from("lessons")
            .select("*, group:groups(name, course:courses(level))")
            .in("group_id", groupIds)
            .order("scheduled_at")
        ).data ?? []
      : [];

  const dtstamp = toICSDate(new Date().toISOString());

  const vevents = lessons.map((l: any) => {
    const start = new Date(l.scheduled_at);
    const durationMs = (l.duration_minutes ?? 60) * 60 * 1000;
    const end = new Date(start.getTime() + durationMs);

    const level = l.group?.course?.level ?? "";
    const groupName = l.group?.name ?? "";
    const lessonKind = l.lesson_type === "bonus" ? "Bonus" : "Regular";
    const status = l.status === "cancelled" ? "CANCELLED" : "CONFIRMED";

    const descParts = [`${lessonKind} lesson`];
    if (l.notes) descParts.push(`Notes: ${l.notes}`);

    const lines = [
      "BEGIN:VEVENT",
      foldLine(`UID:lesson-${l.id}@yang-yao-palace.vercel.app`),
      `DTSTAMP:${dtstamp}`,
      `DTSTART:${toICSDate(start.toISOString())}`,
      `DTEND:${toICSDate(end.toISOString())}`,
      foldLine(`SUMMARY:${escapeICS(`${level} · ${groupName} — Yang Yao Palace`)}`),
      foldLine(`DESCRIPTION:${escapeICS(descParts.join("\\n"))}`),
      `STATUS:${status}`,
      "END:VEVENT",
    ];

    return lines.join("\r\n");
  });

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Yang Yao Palace//Schedule//EN",
    "CALSCALE:GREGORIAN",
    "X-WR-CALNAME:Yang Yao Palace Schedule",
    "X-WR-CALDESC:Your teaching schedule from Yang Yao Palace",
    "METHOD:PUBLISH",
    ...vevents,
    "END:VCALENDAR",
  ].join("\r\n");

  return new NextResponse(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="schedule.ics"',
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}
