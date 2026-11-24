-- Supabase SQL Editor-এ পুরোটা পেস্ট করে একবার Run করুন।

create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  phone text,
  guardian_phone text,
  joined_at date not null default current_date,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now()
);

create table if not exists batches (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  subject text,
  schedule text,
  monthly_fee numeric not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists enrollments (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  batch_id uuid not null references batches(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (student_id, batch_id)
);

create table if not exists attendance (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  batch_id uuid not null references batches(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  date date not null,
  status text not null check (status in ('present', 'absent')),
  unique (batch_id, student_id, date)
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  batch_id uuid not null references batches(id) on delete cascade,
  month text not null, -- যেমন 2026-11
  amount numeric not null default 0,
  method text not null default 'cash',
  paid_at timestamptz not null default now(),
  unique (student_id, batch_id, month)
);

create table if not exists exams (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  batch_id uuid not null references batches(id) on delete cascade,
  title text not null,
  exam_date date,
  total_marks numeric not null default 100,
  created_at timestamptz not null default now()
);

create table if not exists results (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  exam_id uuid not null references exams(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  marks numeric not null,
  unique (exam_id, student_id)
);

create index if not exists idx_attendance_batch_date on attendance (batch_id, date);
create index if not exists idx_payments_month on payments (month);
create index if not exists idx_enrollments_batch on enrollments (batch_id);

-- Row Level Security: প্রতিটি শিক্ষক শুধু নিজের ডেটা দেখতে ও বদলাতে পারবেন।
do $$
declare t text;
begin
  foreach t in array array['students','batches','enrollments','attendance','payments','exams','results']
  loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists "own rows" on %I', t);
    execute format(
      'create policy "own rows" on %I for all to authenticated using (teacher_id = auth.uid()) with check (teacher_id = auth.uid())',
      t
    );
  end loop;
end $$;

-- ===== কোচিং সেন্টারের তথ্য (নাম, ঠিকানা, ফোন, লোগো) =====
create table if not exists center_settings (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null unique default auth.uid() references auth.users(id) on delete cascade,
  name text not null default 'আমার কোচিং সেন্টার',
  address text,
  phone text,
  logo_url text,
  updated_at timestamptz not null default now()
);

alter table center_settings enable row level security;
drop policy if exists "own settings" on center_settings;
create policy "own settings" on center_settings for all to authenticated
  using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());
-- লগইন পেজে নাম/লোগো দেখানোর জন্য সবাই পড়তে পারবে (শুধু এই টেবিল, শুধু পড়া)
drop policy if exists "public read settings" on center_settings;
create policy "public read settings" on center_settings for select to anon using (true);

-- লোগো রাখার জন্য পাবলিক Storage bucket
insert into storage.buckets (id, name, public) values ('logos', 'logos', true)
  on conflict (id) do nothing;
drop policy if exists "logo upload" on storage.objects;
create policy "logo upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'logos');
