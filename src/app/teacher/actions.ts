"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { notifyLessonEvent } from "@/lib/lesson-notifications";

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
