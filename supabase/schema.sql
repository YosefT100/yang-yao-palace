-- ============================================================================
-- YANG YAO PALACE — database schema (Supabase / Postgres)
-- Run this in the Supabase SQL editor (Project -> SQL Editor -> New query)
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type user_role as enum ('admin', 'teacher', 'student');
create type member_status as enum ('active', 'paused', 'completed', 'cancelled');
create type lesson_type as enum ('regular', 'bonus');
create type lesson_status as enum ('scheduled', 'completed', 'cancelled');
create type enrollment_status as enum ('pending', 'active', 'cancelled');
create type payment_status as enum ('pending', 'paid', 'failed', 'refunded');

-- ---------------------------------------------------------------------------
-- profiles — one row per authenticated user (admin / teacher / student)
-- ---------------------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null default '',
  role user_role not null default 'student',
  phone text,
  avatar_url text,
  timezone text not null default 'Asia/Jerusalem',
  bio text,
  created_at timestamptz not null default now()
);

-- Auto-create a profile row whenever a new auth user signs up.
-- New users default to 'student'; promote to 'teacher'/'admin' manually
-- from the admin dashboard (or directly in the table).
create function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ---------------------------------------------------------------------------
-- courses — one row per HSK level (defines weekly cadence + price)
-- ---------------------------------------------------------------------------
create table courses (
  id uuid primary key default gen_random_uuid(),
  level text not null unique,              -- e.g. 'HSK1', 'HSK2', ...
  name text not null,                      -- e.g. 'HSK 1 - Beginner'
  description text,
  sessions_per_week int not null default 1,
  has_bonus_lesson boolean not null default false,
  lesson_duration_minutes int not null default 60,
  price_amount int not null default 0,     -- in smallest currency unit (e.g. cents/agorot)
  price_currency text not null default 'ILS',
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Seed the default HSK ladder (edit prices/cadence anytime from the admin UI)
insert into courses (level, name, sessions_per_week, has_bonus_lesson, sort_order) values
  ('HSK1', 'HSK 1 - Beginner',      2, true,  1),
  ('HSK2', 'HSK 2 - Elementary',    2, true,  2),
  ('HSK3', 'HSK 3 - Intermediate',  2, false, 3),
  ('HSK4', 'HSK 4 - Upper Intermediate', 1, false, 4),
  ('HSK5', 'HSK 5 - Advanced',      1, false, 5),
  ('HSK6', 'HSK 6 - Mastery',       1, false, 6);

-- ---------------------------------------------------------------------------
-- groups — a teacher's class for a given course/level
-- ---------------------------------------------------------------------------
create table groups (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete restrict,
  teacher_id uuid references profiles(id) on delete set null,
  name text not null,                      -- e.g. 'HSK1 - Monday/Wednesday Evening'
  capacity int not null default 8,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- group_members — students enrolled in a group
-- ---------------------------------------------------------------------------
create table group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  student_id uuid not null references profiles(id) on delete cascade,
  status member_status not null default 'active',
  joined_at timestamptz not null default now(),
  unique (group_id, student_id)
);

-- ---------------------------------------------------------------------------
-- availability — teacher's fixed weekly recurring time slots
-- ---------------------------------------------------------------------------
create table availability (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references profiles(id) on delete cascade,
  group_id uuid references groups(id) on delete set null, -- optional: tie a slot to a specific group
  day_of_week int not null check (day_of_week between 0 and 6), -- 0=Sunday .. 6=Saturday
  start_time time not null,
  end_time time not null,
  slot_type lesson_type not null default 'regular',
  label text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- materials — lesson content library (presentations, PDFs, links, etc.)
-- ---------------------------------------------------------------------------
create table materials (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references courses(id) on delete set null,
  teacher_id uuid references profiles(id) on delete set null, -- null = shared/admin material
  title text not null,
  description text,
  file_url text,           -- Supabase Storage URL or external link (e.g. Google Slides)
  file_type text default 'presentation', -- presentation | pdf | doc | link | video
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- lessons — individual scheduled sessions for a group
-- ---------------------------------------------------------------------------
create table lessons (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  lesson_type lesson_type not null default 'regular',
  title text,
  scheduled_at timestamptz not null,
  duration_minutes int not null default 60,
  status lesson_status not null default 'scheduled',
  material_id uuid references materials(id) on delete set null,
  notes text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- enrollments — a student's paid/pending registration in a group
-- ---------------------------------------------------------------------------
create table enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references profiles(id) on delete cascade,
  group_id uuid not null references groups(id) on delete cascade,
  course_id uuid not null references courses(id) on delete restrict,
  status enrollment_status not null default 'pending',
  price_amount int not null,
  price_currency text not null default 'ILS',
  stripe_customer_id text,
  stripe_checkout_session_id text,
  stripe_subscription_id text,
  created_at timestamptz not null default now(),
  unique (student_id, group_id)
);

-- ---------------------------------------------------------------------------
-- payments — payment history tied to an enrollment
-- ---------------------------------------------------------------------------
create table payments (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references enrollments(id) on delete cascade,
  stripe_payment_intent_id text,
  amount int not null,
  currency text not null default 'ILS',
  status payment_status not null default 'pending',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Helper: current user's role (used in RLS policies)
-- ---------------------------------------------------------------------------
create function current_role_is(target_role user_role)
returns boolean as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = target_role
  );
$$ language sql security definer stable;

create function is_admin() returns boolean as $$
  select current_role_is('admin');
$$ language sql security definer stable;

create function is_teacher() returns boolean as $$
  select current_role_is('teacher');
$$ language sql security definer stable;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table profiles enable row level security;
alter table courses enable row level security;
alter table groups enable row level security;
alter table group_members enable row level security;
alter table availability enable row level security;
alter table materials enable row level security;
alter table lessons enable row level security;
alter table enrollments enable row level security;
alter table payments enable row level security;

-- profiles: everyone can read profiles (needed to show teacher/student names);
-- users can update their own profile; admins can update any profile.
create policy "profiles_select_all" on profiles for select using (true);
create policy "profiles_update_own" on profiles for update using (auth.uid() = id or is_admin());
create policy "profiles_admin_all" on profiles for all using (is_admin());

-- courses: everyone can read; only admins can write.
create policy "courses_select_all" on courses for select using (true);
create policy "courses_admin_write" on courses for all using (is_admin());

-- groups: everyone can read (for marketing/enrollment); teachers can read/update own groups; admins manage all.
create policy "groups_select_all" on groups for select using (true);
create policy "groups_admin_all" on groups for all using (is_admin());
create policy "groups_teacher_update_own" on groups for update using (teacher_id = auth.uid());

-- group_members: admins manage all; teachers see members of their groups; students see their own membership.
create policy "members_admin_all" on group_members for all using (is_admin());
create policy "members_teacher_select" on group_members for select using (
  exists (select 1 from groups g where g.id = group_id and g.teacher_id = auth.uid())
);
create policy "members_student_select_own" on group_members for select using (student_id = auth.uid());

-- availability: admins manage all; teachers manage their own; everyone can read (to show schedules).
create policy "availability_select_all" on availability for select using (true);
create policy "availability_admin_all" on availability for all using (is_admin());
create policy "availability_teacher_own" on availability for all using (teacher_id = auth.uid());

-- materials: admins manage all; teachers manage their own materials and read shared (teacher_id is null) materials.
create policy "materials_admin_all" on materials for all using (is_admin());
create policy "materials_teacher_select" on materials for select using (teacher_id = auth.uid() or teacher_id is null);
create policy "materials_teacher_write_own" on materials for insert with check (teacher_id = auth.uid());
create policy "materials_teacher_update_own" on materials for update using (teacher_id = auth.uid());
create policy "materials_teacher_delete_own" on materials for delete using (teacher_id = auth.uid());

-- lessons: admins manage all; teachers manage lessons of their own groups; students can read lessons of groups they belong to.
create policy "lessons_admin_all" on lessons for all using (is_admin());
create policy "lessons_teacher_all" on lessons for all using (
  exists (select 1 from groups g where g.id = group_id and g.teacher_id = auth.uid())
);
create policy "lessons_student_select" on lessons for select using (
  exists (select 1 from group_members gm where gm.group_id = lessons.group_id and gm.student_id = auth.uid())
);

-- enrollments: admins manage all; students manage their own; teachers can read enrollments for their groups.
create policy "enrollments_admin_all" on enrollments for all using (is_admin());
create policy "enrollments_student_own" on enrollments for select using (student_id = auth.uid());
create policy "enrollments_student_insert" on enrollments for insert with check (student_id = auth.uid());
create policy "enrollments_teacher_select" on enrollments for select using (
  exists (select 1 from groups g where g.id = group_id and g.teacher_id = auth.uid())
);

-- payments: admins manage all; students can read their own payment history.
create policy "payments_admin_all" on payments for all using (is_admin());
create policy "payments_student_select" on payments for select using (
  exists (select 1 from enrollments e where e.id = enrollment_id and e.student_id = auth.uid())
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
create index idx_groups_teacher on groups(teacher_id);
create index idx_groups_course on groups(course_id);
create index idx_members_group on group_members(group_id);
create index idx_members_student on group_members(student_id);
create index idx_availability_teacher on availability(teacher_id);
create index idx_lessons_group on lessons(group_id);
create index idx_lessons_scheduled_at on lessons(scheduled_at);
create index idx_enrollments_student on enrollments(student_id);
create index idx_enrollments_group on enrollments(group_id);
create index idx_materials_teacher on materials(teacher_id);

-- ---------------------------------------------------------------------------
-- To make the first user an admin, run (after they sign up):
--   update profiles set role = 'admin' where email = 'your-admin@email.com';
-- ---------------------------------------------------------------------------
