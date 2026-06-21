"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/database";
import { notifyLessonsCreated } from "@/lib/lesson-notifications";
import { trackTeacher, trackLesson } from "@/lib/tracking";

// ---------------------------------------------------------------------------
// Courses (HSK levels)
// ---------------------------------------------------------------------------
export async function updateCourseAction(formData: FormData) {
  const supabase = createClient();
  const id = String(formData.get("id"));

  await supabase
    .from("courses")
    .update({
      name: String(formData.get("name")),
      description: String(formData.get("description") || ""),
      sessions_per_week: Number(formData.get("sessions_per_week")),
      has_bonus_lesson: formData.get("has_bonus_lesson") === "on",
      lesson_duration_minutes: Number(formData.get("lesson_duration_minutes")),
      price_amount: Math.round(Number(formData.get("price_amount")) * 100),
      price_currency: String(formData.get("price_currency")),
      is_active: formData.get("is_active") === "on",
    })
    .eq("id", id);

  revalidatePath("/admin/courses");
  revalidatePath("/");
}

// ---------------------------------------------------------------------------
// Teachers / Users
// ---------------------------------------------------------------------------
export async function setUserRoleAction(formData: FormData) {
  const supabase = createClient();
  const id = String(formData.get("id"));
  const role = String(formData.get("role")) as UserRole;

  if (role === "teacher") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", id)
      .single();
    if (profile) {
      void trackTeacher({
        name: profile.full_name ?? "",
        email: profile.email ?? "",
        promoted_at: new Date().toISOString(),
      });
    }
  }

  await supabase.from("profiles").update({ role }).eq("id", id);

  revalidatePath("/admin/teachers");
  revalidatePath("/admin/students");
}

// ---------------------------------------------------------------------------
// Groups
// ---------------------------------------------------------------------------
export async function createGroupAction(formData: FormData) {
  const supabase = createClient();

  await supabase.from("groups").insert({
    course_id: String(formData.get("course_id")),
    teacher_id: String(formData.get("teacher_id") || "") || null,
    name: String(formData.get("name")),
    capacity: Number(formData.get("capacity") || 8),
  });

  revalidatePath("/admin/groups");
}

export async function updateGroupAction(formData: FormData) {
  const supabase = createClient();
  const id = String(formData.get("id"));

  await supabase
    .from("groups")
    .update({
      name: String(formData.get("name")),
      teacher_id: String(formData.get("teacher_id") || "") || null,
      capacity: Number(formData.get("capacity") || 8),
      is_active: formData.get("is_active") === "on",
    })
    .eq("id", id);

  revalidatePath("/admin/groups");
  revalidatePath(`/admin/groups/${id}`);
}

export async function addGroupMemberAction(formData: FormData) {
  const supabase = createClient();
  const groupId = String(formData.get("group_id"));
  const studentId = String(formData.get("student_id"));

  await supabase
    .from("group_members")
    .upsert({ group_id: groupId, student_id: studentId, status: "active" }, {
      onConflict: "group_id,student_id",
    });

  revalidatePath(`/admin/groups/${groupId}`);
}

export async function removeGroupMemberAction(formData: FormData) {
  const supabase = createClient();
  const id = String(formData.get("id"));
  const groupId = String(formData.get("group_id"));

  await supabase.from("group_members").delete().eq("id", id);

  revalidatePath(`/admin/groups/${groupId}`);
}

// ---------------------------------------------------------------------------
// Lessons — generate the weekly schedule for a group from teacher availability
// ---------------------------------------------------------------------------
export async function generateLessonsAction(formData: FormData) {
  const supabase = createClient();
  const groupId = String(formData.get("group_id"));
  const weeks = Number(formData.get("weeks") || 4);

  const { data: group } = await supabase
    .from("groups")
    .select("*, course:courses(*), teacher:profiles(full_name)")
    .eq("id", groupId)
    .single();
  if (!group) return;

  const { data: slots } = await supabase
    .from("availability")
    .select("*")
    .eq("group_id", groupId);

  if (!slots || slots.length === 0) {
    revalidatePath(`/admin/groups/${groupId}`);
    return;
  }

  const now = new Date();

  // Fetch existing lessons for this group in the generation window to prevent duplicates
  const windowEnd = new Date(now);
  windowEnd.setDate(windowEnd.getDate() + weeks * 7 + 7);
  const { data: existingLessons } = await supabase
    .from("lessons")
    .select("scheduled_at")
    .eq("group_id", groupId)
    .gte("scheduled_at", now.toISOString())
    .lte("scheduled_at", windowEnd.toISOString());

  const existingTimes = new Set(
    (existingLessons ?? []).map((l: { scheduled_at: string }) =>
      new Date(l.scheduled_at).toISOString()
    )
  );

  const lessonsToInsert: Record<string, unknown>[] = [];

  for (let w = 0; w < weeks; w++) {
    for (const slot of slots) {
      const date = nextDateForDay(now, slot.day_of_week, w);
      const [h, m] = slot.start_time.split(":").map(Number);
      date.setHours(h, m, 0, 0);

      if (existingTimes.has(date.toISOString())) continue;

      lessonsToInsert.push({
        group_id: groupId,
        lesson_type: slot.slot_type,
        title:
          slot.slot_type === "bonus"
            ? `${group.course.level} Bonus Lesson`
            : `${group.course.level} Lesson`,
        scheduled_at: date.toISOString(),
        duration_minutes: group.course.lesson_duration_minutes,
        status: "scheduled",
      });
    }
  }

  if (lessonsToInsert.length === 0) {
    console.log("[generateLessons] No new lessons to insert — all slots already exist for group", groupId);
    revalidatePath(`/admin/groups/${groupId}`);
    revalidatePath("/admin/schedule");
    revalidatePath("/teacher/schedule");
    return;
  }

  const { data: inserted } = await supabase
    .from("lessons")
    .insert(lessonsToInsert)
    .select("id");

  revalidatePath(`/admin/groups/${groupId}`);
  revalidatePath("/admin/schedule");
  revalidatePath("/teacher/schedule");

  if (inserted && inserted.length > 0) {
    console.log("[generateLessons] Inserted", inserted.length, "lessons, calling notifyLessonsCreated for group", groupId);
    void notifyLessonsCreated(
      inserted.map((r: { id: string }) => r.id),
      supabase
    );

    const teacherName = (group as unknown as { teacher?: { full_name?: string } }).teacher?.full_name ?? "";
    for (const lesson of lessonsToInsert) {
      const scheduledAt = new Date(lesson.scheduled_at as string);
      void trackLesson({
        date: scheduledAt.toLocaleDateString("en-US"),
        time: scheduledAt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        hsk_level: group.course.level as string,
        group_name: group.name as string,
        teacher_name: teacherName,
        lesson_type: lesson.lesson_type as string,
        status: "scheduled",
      });
    }
  }
}

function nextDateForDay(from: Date, dayOfWeek: number, weekOffset: number) {
  const date = new Date(from);
  const diff = (dayOfWeek - date.getDay() + 7) % 7;
  date.setDate(date.getDate() + diff + weekOffset * 7);
  return date;
}

// ---------------------------------------------------------------------------
// Delete lesson
// ---------------------------------------------------------------------------
export async function deleteLessonAction(formData: FormData) {
  const supabase = createClient();
  await supabase.from("lessons").delete().eq("id", String(formData.get("lesson_id")));
  revalidatePath("/admin/schedule");
  revalidatePath("/teacher/schedule");
}

// ---------------------------------------------------------------------------
// Delete group (cascade: lessons, members, availability)
// ---------------------------------------------------------------------------
export async function deleteGroupAction(formData: FormData) {
  const supabase = createClient();
  const groupId = String(formData.get("group_id"));
  await supabase.from("lessons").delete().eq("group_id", groupId);
  await supabase.from("group_members").delete().eq("group_id", groupId);
  await supabase.from("availability").delete().eq("group_id", groupId);
  await supabase.from("groups").delete().eq("id", groupId);
  revalidatePath("/admin/groups");
  revalidatePath("/admin/schedule");
  revalidatePath("/teacher/schedule");
}

// ---------------------------------------------------------------------------
// Bulk delete lessons
// ---------------------------------------------------------------------------
export async function deleteLessonsByIdsAction(ids: string[]) {
  if (!ids.length) return;
  const supabase = createClient();
  await supabase.from("lessons").delete().in("id", ids);
  revalidatePath("/admin/schedule");
  revalidatePath("/teacher/schedule");
}

// ---------------------------------------------------------------------------
// Bulk delete groups (cascade: lessons, members, availability)
// ---------------------------------------------------------------------------
export async function deleteGroupsByIdsAction(ids: string[]) {
  if (!ids.length) return;
  const supabase = createClient();
  await supabase.from("lessons").delete().in("group_id", ids);
  await supabase.from("group_members").delete().in("group_id", ids);
  await supabase.from("availability").delete().in("group_id", ids);
  await supabase.from("groups").delete().in("id", ids);
  revalidatePath("/admin/groups");
  revalidatePath("/admin/schedule");
  revalidatePath("/teacher/schedule");
}

// ---------------------------------------------------------------------------
// Materials (shared library, admin-managed)
// ---------------------------------------------------------------------------
export async function createMaterialAction(formData: FormData) {
  const supabase = createClient();

  await supabase.from("materials").insert({
    course_id: String(formData.get("course_id") || "") || null,
    title: String(formData.get("title")),
    description: String(formData.get("description") || ""),
    file_url: String(formData.get("file_url") || ""),
    file_type: String(formData.get("file_type") || "presentation"),
    teacher_id: null,
  });

  revalidatePath("/admin/courses");
}