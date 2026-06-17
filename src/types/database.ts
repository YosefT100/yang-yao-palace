// Hand-written types matching supabase/schema.sql.
// (Optionally regenerate with `supabase gen types typescript` once your
// project is linked, and replace this file.)

export type UserRole = "admin" | "teacher" | "student";
export type MemberStatus = "active" | "paused" | "completed" | "cancelled";
export type LessonType = "regular" | "bonus";
export type LessonStatus = "scheduled" | "completed" | "cancelled";
export type EnrollmentStatus = "pending" | "active" | "cancelled";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone: string | null;
  avatar_url: string | null;
  timezone: string;
  bio: string | null;
  created_at: string;
}

export interface Course {
  id: string;
  level: string;
  name: string;
  description: string | null;
  sessions_per_week: number;
  has_bonus_lesson: boolean;
  lesson_duration_minutes: number;
  price_amount: number;
  price_currency: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface Group {
  id: string;
  course_id: string;
  teacher_id: string | null;
  name: string;
  capacity: number;
  is_active: boolean;
  created_at: string;
  // joined
  course?: Course;
  teacher?: Profile;
  member_count?: number;
}

export interface GroupMember {
  id: string;
  group_id: string;
  student_id: string;
  status: MemberStatus;
  joined_at: string;
  student?: Profile;
}

export interface Availability {
  id: string;
  teacher_id: string;
  group_id: string | null;
  day_of_week: number; // 0 = Sunday .. 6 = Saturday
  start_time: string; // 'HH:MM:SS'
  end_time: string;
  slot_type: LessonType;
  label: string | null;
  created_at: string;
  group?: Group;
}

export interface Material {
  id: string;
  course_id: string | null;
  teacher_id: string | null;
  title: string;
  description: string | null;
  file_url: string | null;
  file_type: string;
  created_at: string;
}

export interface Lesson {
  id: string;
  group_id: string;
  lesson_type: LessonType;
  title: string | null;
  scheduled_at: string;
  duration_minutes: number;
  status: LessonStatus;
  material_id: string | null;
  notes: string | null;
  created_at: string;
  group?: Group;
  material?: Material;
}

export interface Enrollment {
  id: string;
  student_id: string;
  group_id: string;
  course_id: string;
  status: EnrollmentStatus;
  price_amount: number;
  price_currency: string;
  stripe_customer_id: string | null;
  stripe_checkout_session_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
  group?: Group;
  course?: Course;
  student?: Profile;
}

export interface Payment {
  id: string;
  enrollment_id: string;
  stripe_payment_intent_id: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  created_at: string;
}

export const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
