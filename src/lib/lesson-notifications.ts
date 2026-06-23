/**
 * lesson-notifications.ts
 * Sends teacher email (Resend) + logs to Google Sheets (Make.com webhook)
 * on every lesson lifecycle event.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export type LessonEvent = "created" | "rescheduled" | "cancelled" | "completed";

const MAKE_WEBHOOK_URL =
  "https://hook.us2.make.com/2z7rkjx310rvqkhfkt42pvvft4y76jmi";

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

interface LessonDetails {
  id: string;
  title: string | null;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  lesson_type: string;
  notes: string | null;
  group: {
    id: string;
    name: string;
    course: { level: string; name: string } | null;
    teacher: { id: string; email: string; full_name: string } | null;
  } | null;
  students: { full_name: string; email: string }[];
}

async function fetchLessonDetails(
  lessonId: string,
  supabase: SupabaseClient
): Promise<LessonDetails | null> {
  const { data: raw } = await supabase
    .from("lessons")
    .select(
      `id, title, scheduled_at, duration_minutes, status, lesson_type, notes,
       group:groups(
         id, name,
         course:courses(level, name),
         teacher:profiles!groups_teacher_id_fkey(id, email, full_name)
       )`
    )
    .eq("id", lessonId)
    .single();

  if (!raw) {
    console.warn("[lesson-email] fetchLessonDetails: no row returned for lesson", lessonId);
    return null;
  }

  // Supabase returns FK joins as single objects at runtime; cast via unknown
  const lesson = raw as unknown as LessonDetails;
  console.log(
    "[lesson-email] fetched lesson", lessonId,
    "| teacher_name:", lesson.group?.teacher?.full_name ?? "NONE",
    "| teacher_email:", lesson.group?.teacher?.email ?? "NONE"
  );

  const groupId: string | undefined = lesson.group?.id;
  let students: { full_name: string; email: string }[] = [];

  if (groupId) {
    const { data: members } = await supabase
      .from("group_members")
      .select("student:profiles!group_members_student_id_fkey(full_name, email)")
      .eq("group_id", groupId)
      .eq("status", "active");

    if (members) {
      students = (members as unknown as { student: { full_name: string; email: string } | null }[])
        .map((m) => m.student)
        .filter(Boolean) as { full_name: string; email: string }[];
    }
  }

  return {
    id: lesson.id,
    title: lesson.title ?? null,
    scheduled_at: lesson.scheduled_at,
    duration_minutes: lesson.duration_minutes,
    status: lesson.status,
    lesson_type: lesson.lesson_type,
    notes: lesson.notes ?? null,
    group: lesson.group
      ? {
          id: lesson.group.id,
          name: lesson.group.name,
          course: lesson.group.course ?? null,
          teacher: lesson.group.teacher ?? null,
        }
      : null,
    students,
  };
}

function formatDateTime(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const time = d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return { date, time };
}

function eventLabel(event: LessonEvent): string {
  const labels: Record<LessonEvent, string> = {
    created: "📅 New Lesson Scheduled",
    rescheduled: "🔄 Lesson Rescheduled",
    cancelled: "❌ Lesson Cancelled",
    completed: "✅ Lesson Completed",
  };
  return labels[event];
}

function eventColor(event: LessonEvent): string {
  return {
    created: "#2563eb",
    rescheduled: "#d97706",
    cancelled: "#dc2626",
    completed: "#16a34a",
  }[event];
}

// ---------------------------------------------------------------------------
// Resend — teacher email
// ---------------------------------------------------------------------------

async function sendTeacherEmail(
  event: LessonEvent,
  lesson: LessonDetails
): Promise<void> {
  const teacher = lesson.group?.teacher;
  if (!teacher?.email) return;

  const { date, time } = formatDateTime(lesson.scheduled_at);
  const level = lesson.group?.course?.level ?? "—";
  const groupName = lesson.group?.name ?? "—";
  const studentList =
    lesson.students.length > 0
      ? lesson.students.map((s) => s.full_name).join(", ")
      : "No students assigned";

  const label = eventLabel(event);
  const color = eventColor(event);

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9f5ef;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f5ef;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr><td style="background:#8B0000;padding:28px 40px;text-align:center;">
          <h1 style="margin:0;color:#D4AF37;font-size:24px;letter-spacing:4px;">YANG YAO PALACE</h1>
          <p style="margin:6px 0 0;color:rgba(212,175,55,0.7);font-size:12px;letter-spacing:2px;">CHINESE LANGUAGE ACADEMY</p>
        </td></tr>

        <!-- Event Banner -->
        <tr><td style="background:${color};padding:14px 40px;text-align:center;">
          <p style="margin:0;color:#fff;font-size:18px;font-weight:bold;">${label}</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:36px 40px;">
          <p style="background:#fff3cd;border:1px solid #ffc107;border-radius:6px;padding:8px 12px;font-size:13px;margin:0 0 20px;"><strong>For teacher:</strong> ${teacher.email} | ${teacher.full_name}</p>
          <p style="color:#3a1a00;font-size:15px;margin:0 0 24px;">Dear ${teacher.full_name},</p>

          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #f0e8d0;border-radius:8px;overflow:hidden;">
            ${row("📅 Date", date)}
            ${row("🕐 Time", time)}
            ${row("⏱ Duration", `${lesson.duration_minutes} minutes`)}
            ${row("📚 HSK Level", level)}
            ${row("👥 Group", groupName)}
            ${row("🎓 Students", studentList)}
            ${row("📝 Status", lesson.status.toUpperCase())}
            ${lesson.notes ? row("📌 Notes", lesson.notes) : ""}
          </table>

          <div style="text-align:center;margin:32px 0;">
            <a href="https://yang-yao-palace.vercel.app/teacher/schedule"
               style="background:#8B0000;color:#ffffff;padding:14px 36px;border-radius:8px;text-decoration:none;font-size:15px;font-weight:bold;letter-spacing:1px;display:inline-block;">
              View Schedule →
            </a>
          </div>

          <p style="color:#999;font-size:13px;text-align:center;margin:0;">
            This is an automated notification from Yang Yao Palace.
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#1a0a00;padding:16px 40px;text-align:center;">
          <p style="color:rgba(255,255,255,0.35);font-size:12px;margin:0;">© 2026 Yang Yao Palace. All rights reserved.</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const subjects: Record<LessonEvent, string> = {
    created: `📅 New Lesson: ${level} — ${date}`,
    rescheduled: `🔄 Lesson Rescheduled: ${level} — ${date}`,
    cancelled: `❌ Lesson Cancelled: ${level} — ${date}`,
    completed: `✅ Lesson Completed: ${level} — ${date}`,
  };

  const subject = subjects[event];
  console.log("[lesson-email] Sending to:", teacher.email, "| subject:", subject);

  let res: Response;
  try {
    res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Yang Yao Palace <onboarding@resend.dev>",
        to: "yaseft32@gmail.com",
        subject,
        html,
      }),
    });
  } catch (err) {
    console.error("[lesson-email] fetch threw:", err);
    return;
  }

  if (!res.ok) {
    console.error("[lesson-email] Resend error:", res.status, await res.text());
  } else {
    console.log("[lesson-email] Resend accepted — status:", res.status);
  }
}

function row(label: string, value: string): string {
  return `
    <tr>
      <td style="padding:12px 16px;background:#faf8f4;color:#666;font-size:13px;width:140px;border-bottom:1px solid #f0e8d0;">${label}</td>
      <td style="padding:12px 16px;color:#3a1a00;font-size:14px;border-bottom:1px solid #f0e8d0;">${value}</td>
    </tr>`;
}

// ---------------------------------------------------------------------------
// Make.com webhook — Google Sheets logging
// ---------------------------------------------------------------------------

async function logToSheets(event: LessonEvent, lesson: LessonDetails): Promise<void> {
  const { date, time } = formatDateTime(lesson.scheduled_at);

  const payload = {
    event,
    lesson_id: lesson.id,
    date,
    time,
    hsk_level: lesson.group?.course?.level ?? "",
    group_name: lesson.group?.name ?? "",
    teacher_name: lesson.group?.teacher?.full_name ?? "",
    teacher_email: lesson.group?.teacher?.email ?? "",
    students_present: lesson.students.map((s) => s.full_name).join(", "),
    student_count: lesson.students.length,
    duration_minutes: lesson.duration_minutes,
    lesson_type: lesson.lesson_type,
    status: lesson.status,
    notes: lesson.notes ?? "",
    timestamp: new Date().toISOString(),
  };

  const res = await fetch(MAKE_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    console.error("[lesson-notifications] Make.com webhook error:", res.status);
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Notify on a single lesson event (teacher email + Sheets log).
 * Fire-and-forget — errors are logged but never thrown.
 */
export async function notifyLessonEvent(
  event: LessonEvent,
  lessonId: string,
  supabase: SupabaseClient
): Promise<void> {
  try {
    const lesson = await fetchLessonDetails(lessonId, supabase);
    if (!lesson) {
      console.warn("[lesson-notifications] Lesson not found:", lessonId);
      return;
    }
    await Promise.all([
      sendTeacherEmail(event, lesson),
      logToSheets(event, lesson),
    ]);
  } catch (err) {
    console.error("[lesson-notifications] Error:", err);
  }
}

/**
 * Notify for bulk lesson creation (generateLessonsAction).
 * Sends one email per teacher summarising all new lessons,
 * and one webhook call per lesson for Sheets granularity.
 */
export async function notifyLessonsCreated(
  lessonIds: string[],
  supabase: SupabaseClient
): Promise<void> {
  if (lessonIds.length === 0) return;
  try {
    const details = await Promise.all(
      lessonIds.map((id) => fetchLessonDetails(id, supabase))
    );
    const lessons = details.filter(Boolean) as LessonDetails[];
    if (lessons.length === 0) return;

    // Group by teacher so one email per teacher
    const byTeacher = new Map<string, LessonDetails[]>();
    for (const l of lessons) {
      const key = l.group?.teacher?.email ?? "__no_teacher__";
      if (!byTeacher.has(key)) byTeacher.set(key, []);
      byTeacher.get(key)!.push(l);
    }

    await Promise.all([
      // One summary email per teacher
      ...[...byTeacher.entries()].map(([, tLessons]) =>
        sendBulkTeacherEmail(tLessons)
      ),
      // One webhook call per lesson
      ...lessons.map((l) => logToSheets("created", l)),
    ]);
  } catch (err) {
    console.error("[lesson-notifications] notifyLessonsCreated error:", err);
  }
}

async function sendBulkTeacherEmail(lessons: LessonDetails[]): Promise<void> {
  const teacher = lessons[0]?.group?.teacher;
  if (!teacher?.email) return;

  const level = lessons[0]?.group?.course?.level ?? "—";
  const groupName = lessons[0]?.group?.name ?? "—";

  const rowsHtml = lessons
    .map((l) => {
      const { date, time } = formatDateTime(l.scheduled_at);
      return `<tr>
        <td style="padding:10px 14px;border-bottom:1px solid #f0e8d0;color:#3a1a00;font-size:14px;">${date}</td>
        <td style="padding:10px 14px;border-bottom:1px solid #f0e8d0;color:#3a1a00;font-size:14px;">${time}</td>
        <td style="padding:10px 14px;border-bottom:1px solid #f0e8d0;color:#3a1a00;font-size:14px;">${l.duration_minutes} min</td>
      </tr>`;
    })
    .join("");

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9f5ef;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f5ef;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.08);">
        <tr><td style="background:#8B0000;padding:28px 40px;text-align:center;">
          <h1 style="margin:0;color:#D4AF37;font-size:24px;letter-spacing:4px;">YANG YAO PALACE</h1>
          <p style="margin:6px 0 0;color:rgba(212,175,55,0.7);font-size:12px;letter-spacing:2px;">CHINESE LANGUAGE ACADEMY</p>
        </td></tr>
        <tr><td style="background:#2563eb;padding:14px 40px;text-align:center;">
          <p style="margin:0;color:#fff;font-size:18px;font-weight:bold;">📅 ${lessons.length} New Lessons Scheduled</p>
        </td></tr>
        <tr><td style="padding:36px 40px;">
          <p style="background:#fff3cd;border:1px solid #ffc107;border-radius:6px;padding:8px 12px;font-size:13px;margin:0 0 16px;"><strong>For teacher:</strong> ${teacher.email} | ${teacher.full_name}</p>
          <p style="color:#3a1a00;font-size:15px;margin:0 0 8px;">Dear ${teacher.full_name},</p>
          <p style="color:#666;font-size:14px;margin:0 0 24px;">
            ${lessons.length} new lessons have been scheduled for <strong>${groupName} (${level})</strong>.
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #f0e8d0;border-radius:8px;overflow:hidden;">
            <tr style="background:#faf8f4;">
              <th style="padding:10px 14px;text-align:left;color:#8B0000;font-size:13px;border-bottom:1px solid #f0e8d0;">Date</th>
              <th style="padding:10px 14px;text-align:left;color:#8B0000;font-size:13px;border-bottom:1px solid #f0e8d0;">Time</th>
              <th style="padding:10px 14px;text-align:left;color:#8B0000;font-size:13px;border-bottom:1px solid #f0e8d0;">Duration</th>
            </tr>
            ${rowsHtml}
          </table>
          <div style="text-align:center;margin:32px 0;">
            <a href="https://yang-yao-palace.vercel.app/teacher/schedule"
               style="background:#8B0000;color:#ffffff;padding:14px 36px;border-radius:8px;text-decoration:none;font-size:15px;font-weight:bold;letter-spacing:1px;display:inline-block;">
              View Schedule →
            </a>
          </div>
        </td></tr>
        <tr><td style="background:#1a0a00;padding:16px 40px;text-align:center;">
          <p style="color:rgba(255,255,255,0.35);font-size:12px;margin:0;">© 2026 Yang Yao Palace. All rights reserved.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const subject = `📅 ${lessons.length} New Lessons Scheduled — ${level} (${groupName})`;
  console.log("[lesson-email] Sending bulk to:", teacher.email, "| subject:", subject);

  let res: Response;
  try {
    res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Yang Yao Palace <onboarding@resend.dev>",
        to: "yaseft32@gmail.com",
        subject,
        html,
      }),
    });
  } catch (err) {
    console.error("[lesson-email] bulk fetch threw:", err);
    return;
  }

  if (!res.ok) {
    console.error("[lesson-email] Resend bulk error:", res.status, await res.text());
  } else {
    console.log("[lesson-email] Resend bulk accepted — status:", res.status);
  }
}
