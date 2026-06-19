const WEBHOOK_URL = "https://hook.us2.make.com/2z7rkjx310rvqkhfkt42pvvft4y76jmi";

async function sendToSheet(sheet: string, data: Record<string, unknown>) {
  try {
    await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sheet, ...data }),
    });
  } catch (e) {
    console.error("[tracking] sendToSheet error:", e);
  }
}

export function trackStudent(data: { name: string; email: string; registered_at: string }) {
  return sendToSheet("Students", data);
}

export function trackTeacher(data: { name: string; email: string; promoted_at: string }) {
  return sendToSheet("Teachers", data);
}

export function trackPayment(data: {
  student_name: string;
  student_email: string;
  amount: number;
  hsk_level: string;
  group_name: string;
  paid_at: string;
}) {
  return sendToSheet("Payments", data);
}

export function trackLesson(data: {
  date: string;
  time: string;
  hsk_level: string;
  group_name: string;
  teacher_name: string;
  lesson_type: string;
  status: string;
}) {
  const levelNum = data.hsk_level.replace(/\D/g, "").charAt(0);
  const sheet = `HSK${levelNum} Lessons`;
  return sendToSheet(sheet, data);
}

export function trackAttendance(data: {
  date: string;
  hsk_level: string;
  group_name: string;
  teacher_name: string;
  students_present: string;
  absent_students: string;
  absent_reason: string;
  duration_minutes: number;
  completed: boolean;
}) {
  return sendToSheet("Attendance", data);
}
