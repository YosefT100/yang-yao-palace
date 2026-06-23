"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { notifyLessonEvent } from "@/lib/lesson-notifications";
import { trackAttendance, trackLesson } from "@/lib/tracking";

// ---------------------------------------------------------------------------
// Availability — a teacher's fixed weekly recurring time slots per group.
// Used by both the teacher dashboard and the admin group page.
// ---------------------------------------------------------------------------
export async function addAvailabilityAction(formData: FormData) {
  const supabase = createClient();
  const groupId = String(formData.get("group_id"));

  let teacherId = String(formData.get("teacher_id") || "");
  if (!teacherId) {
    const { data } = await supabase.auth.getUser();
    teacherId = data.user!.id;
  }

  await supabase.from("availability").insert({
    teacher_id: teacherId,
    group_id: groupId,
    day_of_week: Number(formData.get("day_of_week")),
    start_time: String(formData.get("start_time")),
    end_time: String(formData.get("end_time")),
    slot_type: String(formData.get("slot_type") || "regular"),
    label: String(formData.get("label") || ""),
  });

  revalidatePath(`/admin/groups/${groupId}`);
  revalidatePath("/teacher/availability");
  revalidatePath("/teacher/schedule");
}

export async function deleteAvailabilityAction(formData: FormData) {
  const supabase = createClient();
  const id = String(formData.get("id"));
  const groupId = String(formData.get("group_id") || "");

  await supabase.from("availability").delete().eq("id", id);

  revalidatePath(`/admin/groups/${groupId}`);
  revalidatePath("/teacher/availability");
  revalidatePath("/teacher/schedule");
}

// ---------------------------------------------------------------------------
// Lesson materials — teacher picks a presentation/material for a lesson.
// ---------------------------------------------------------------------------
export async function selectLessonMaterialAction(formData: FormData) {
  const supabase = createClient();
  const lessonId = String(formData.get("lesson_id"));
  const materialId = String(formData.get("material_id") || "");

  await supabase
    .from("lessons")
    .update({ material_id: materialId || null })
    .eq("id", lessonId);

  revalidatePath(`/teacher/lessons/${lessonId}`);
  revalidatePath("/teacher/schedule");
}

export async function updateLessonNotesAction(formData: FormData) {
  const supabase = createClient();
  const lessonId = String(formData.get("lesson_id"));
  const newStatus = String(formData.get("status") || "scheduled");

  // Fetch current status to detect changes
  const { data: current } = await supabase
    .from("lessons")
    .select("status")
    .eq("id", lessonId)
    .single();

  await supabase
    .from("lessons")
    .update({
      notes: String(formData.get("notes") || ""),
      status: newStatus,
    })
    .eq("id", lessonId);

  revalidatePath(`/teacher/lessons/${lessonId}`);
  revalidatePath("/teacher/schedule");

  // Notify only when status actually changes
  if (current && current.status !== newStatus) {
    const eventMap: Record<string, "rescheduled" | "cancelled" | "completed"> = {
      scheduled: "rescheduled",
      cancelled: "cancelled",
      completed: "completed",
    };
    const event = eventMap[newStatus];
    if (event) {
      void notifyLessonEvent(event, lessonId, supabase);
    }
  }
}

export async function updateMeetingLinkAction(formData: FormData) {
  const supabase = createClient();
  const lessonId = String(formData.get("lesson_id"));
  await supabase
    .from("lessons")
    .update({ meeting_link: String(formData.get("meeting_link") || "") })
    .eq("id", lessonId);
  revalidatePath(`/teacher/lessons/${lessonId}`);
}

// ---------------------------------------------------------------------------
// Teacher's own materials library
// ---------------------------------------------------------------------------

export async function markAttendanceAction(formData: FormData) {
  const supabase = createClient();
  const lessonId = String(formData.get("lesson_id"));
  const status = String(formData.get("status")) as "completed" | "cancelled";
  const cancelReason = String(formData.get("cancel_reason") || "");
  const studentsPresent = String(formData.get("students_present") || "");
  const absentStudents = String(formData.get("absent_students") || "");
  const absentReason = String(formData.get("absent_reason") || "");

  const { data: lesson } = await supabase
    .from("lessons")
    .select("*, group:groups(name, course:courses(level), teacher:profiles!groups_teacher_id_fkey(full_name))")
    .eq("id", lessonId)
    .single();

  await supabase
    .from("lessons")
    .update({
      status,
      ...(status === "cancelled" && cancelReason ? { notes: cancelReason } : {}),
    })
    .eq("id", lessonId);

  revalidatePath(`/teacher/lessons/${lessonId}`);
  revalidatePath("/teacher/schedule");
  revalidatePath("/admin/schedule");

  if (lesson) {
    const g = lesson.group as unknown as {
      name: string;
      course: { level: string };
      teacher: { full_name: string } | null;
    };
    const scheduledAt = new Date(lesson.scheduled_at);
    void trackAttendance({
      date: scheduledAt.toLocaleDateString("en-US"),
      hsk_level: g.course?.level ?? "",
      group_name: g.name ?? "",
      teacher_name: g.teacher?.full_name ?? "",
      students_present: studentsPresent,
      absent_students: absentStudents,
      absent_reason: absentReason || (status === "cancelled" ? cancelReason : ""),
      duration_minutes: lesson.duration_minutes,
      completed: status === "completed",
      ...(status === "cancelled" && cancelReason ? { cancelled_reason: cancelReason } : {}),
    });
    void trackLesson({
      date: scheduledAt.toLocaleDateString("en-US"),
      time: scheduledAt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      hsk_level: g.course?.level ?? "",
      group_name: g.name ?? "",
      teacher_name: g.teacher?.full_name ?? "",
      lesson_type: lesson.lesson_type ?? "regular",
      status,
      ...(status === "cancelled" && cancelReason ? { cancelled_reason: cancelReason } : {}),
    });
    void notifyLessonEvent(status === "completed" ? "completed" : "cancelled", lessonId, supabase);
  }
}

// ---------------------------------------------------------------------------
// Lesson status management (action bar — complete / cancel / incomplete)
// ---------------------------------------------------------------------------
export async function updateLessonStatusAction(
  lessonId: string,
  status: string,
  reason?: string
) {
  const supabase = createClient();

  const { data: lesson } = await supabase
    .from("lessons")
    .select(
      "*, group:groups(name, course:courses(level), teacher:profiles!groups_teacher_id_fkey(full_name, email))"
    )
    .eq("id", lessonId)
    .single();

  await supabase
    .from("lessons")
    .update({ status, ...(reason ? { notes: reason } : {}) })
    .eq("id", lessonId);

  revalidatePath(`/teacher/lessons/${lessonId}`);
  revalidatePath("/teacher/schedule");
  revalidatePath("/admin/schedule");

  if (lesson) {
    const g = lesson.group as unknown as {
      name: string;
      course: { level: string };
      teacher: { full_name: string; email: string } | null;
    };
    const scheduledAt = new Date(lesson.scheduled_at);
    void trackLesson({
      date: scheduledAt.toLocaleDateString("en-US"),
      time: scheduledAt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      hsk_level: g.course?.level ?? "",
      group_name: g.name ?? "",
      teacher_name: g.teacher?.full_name ?? "",
      lesson_type: lesson.lesson_type ?? "regular",
      status,
      ...(reason ? { cancelled_reason: reason } : {}),
    });

    const notifyEvent =
      status === "completed" ? "completed" : status === "cancelled" ? "cancelled" : null;
    if (notifyEvent) {
      void notifyLessonEvent(notifyEvent, lessonId, supabase);
    }
  }
}

export async function createTeacherMaterialAction(formData: FormData) {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();

  await supabase.from("materials").insert({
    teacher_id: data.user!.id,
    course_id: String(formData.get("course_id") || "") || null,
    title: String(formData.get("title")),
    description: String(formData.get("description") || ""),
    file_url: String(formData.get("file_url") || ""),
    file_type: String(formData.get("file_type") || "presentation"),
  });

  const lessonId = String(formData.get("lesson_id") || "");
  if (lessonId) revalidatePath(`/teacher/lessons/${lessonId}`);
}
