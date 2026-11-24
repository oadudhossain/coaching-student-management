-- schema.sql চালানোর পরে এই ফাইলটা SQL Editor-এ একবার Run করুন।
-- (বারবার চালালেও সমস্যা নেই)

-- ===== ১) students: অনলাইন আবেদন + অভিভাবক পোর্টালের গোপন লিংক =====
alter table students add column if not exists guardian_name text;
alter table students add column if not exists class_level text;
alter table students add column if not exists note text;
alter table students add column if not exists applied_batch_id uuid references batches(id) on delete set null;
alter table students add column if not exists source text not null default 'admin';
alter table students add column if not exists portal_token uuid not null default gen_random_uuid();
create unique index if not exists students_portal_token_key on students (portal_token);

alter table students drop constraint if exists students_status_check;
alter table students add constraint students_status_check
  check (status in ('active', 'inactive', 'pending'));

-- ===== ২) batches: ওয়েবসাইটে দেখানোর সেটিং =====
alter table batches add column if not exists description text;
alter table batches add column if not exists is_public boolean not null default true;
alter table batches add column if not exists show_fee boolean not null default false;

-- ===== ৩) নতুন টেবিল =====
create table if not exists site_settings (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null unique default auth.uid() references auth.users(id) on delete cascade,
  teacher_name text,
  teacher_title text,
  teacher_photo_url text,
  hero_headline text,
  hero_subtitle text,
  teacher_bio text,
  qualifications text,
  experience_years int,
  about text,
  admission_info text,
  email text,
  whatsapp text,
  facebook_url text,
  map_url text,
  office_hours text,
  updated_at timestamptz not null default now()
);

create table if not exists gallery_images (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  url text not null,
  caption text,
  created_at timestamptz not null default now()
);

create table if not exists featured_results (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  exam_id uuid not null references exams(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  rank_no int not null default 1,
  marks numeric not null,
  total_marks numeric not null default 100,
  photo_url text,
  created_at timestamptz not null default now(),
  unique (exam_id, student_id)
);

do $$
declare t text;
begin
  foreach t in array array['site_settings','gallery_images','featured_results']
  loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists "own rows" on %I', t);
    execute format(
      'create policy "own rows" on %I for all to authenticated using (teacher_id = auth.uid()) with check (teacher_id = auth.uid())',
      t
    );
  end loop;
end $$;

-- ===== ৪) ছবির জন্য পাবলিক Storage bucket =====
insert into storage.buckets (id, name, public) values ('site-images', 'site-images', true)
  on conflict (id) do nothing;

drop policy if exists "site images upload" on storage.objects;
create policy "site images upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'site-images' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "site images delete" on storage.objects;
create policy "site images delete" on storage.objects for delete to authenticated
  using (bucket_id = 'site-images' and (storage.foldername(name))[1] = auth.uid()::text);

-- ===== ৫) পাবলিক ফাংশন (টেবিল সরাসরি খোলা হয় না; শুধু নির্বাচিত তথ্য বের হয়) =====

-- হোম পেজের সব পাবলিক তথ্য
create or replace function public.get_public_site()
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
declare t uuid;
begin
  select teacher_id into t from center_settings order by updated_at desc limit 1;
  if t is null then
    select teacher_id into t from site_settings order by updated_at desc limit 1;
  end if;
  if t is null then
    return jsonb_build_object('configured', false);
  end if;

  return jsonb_build_object(
    'configured', true,
    'center', coalesce((select to_jsonb(c) - 'id' - 'teacher_id' from center_settings c where c.teacher_id = t), '{}'::jsonb),
    'site', coalesce((select to_jsonb(s) - 'id' - 'teacher_id' from site_settings s where s.teacher_id = t), '{}'::jsonb),
    'stats', jsonb_build_object(
      'students', (select count(*) from students where teacher_id = t and status = 'active'),
      'batches', (select count(*) from batches where teacher_id = t and is_public)
    ),
    'batches', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', b.id,
        'name', b.name,
        'subject', b.subject,
        'schedule', b.schedule,
        'description', b.description,
        'fee', case when b.show_fee then b.monthly_fee else null end,
        'students', (select count(*) from enrollments e where e.batch_id = b.id)
      ) order by b.created_at)
      from batches b
      where b.teacher_id = t and b.is_public
    ), '[]'::jsonb),
    'gallery', coalesce((
      select jsonb_agg(jsonb_build_object('id', g.id, 'url', g.url, 'caption', g.caption) order by g.created_at desc)
      from (select * from gallery_images where teacher_id = t order by created_at desc limit 24) g
    ), '[]'::jsonb),
    'toppers', coalesce((
      select jsonb_agg(q.j order by q.sort_date desc nulls last, q.rnk)
      from (
        select
          jsonb_build_object(
            'id', f.id,
            'student_name', st.name,
            'photo_url', f.photo_url,
            'marks', f.marks,
            'total_marks', f.total_marks,
            'rank_no', f.rank_no,
            'exam_title', x.title,
            'exam_date', x.exam_date,
            'batch_id', x.batch_id,
            'batch_name', b.name
          ) as j,
          x.exam_date as sort_date,
          f.rank_no as rnk
        from featured_results f
        join exams x on x.id = f.exam_id
        join students st on st.id = f.student_id
        join batches b on b.id = x.batch_id
        where f.teacher_id = t
        order by x.exam_date desc nulls last, f.rank_no
        limit 12
      ) q
    ), '[]'::jsonb)
  );
end $$;

-- অভিভাবক/শিক্ষার্থী পোর্টাল: গোপন টোকেন দিয়ে শুধু ঐ শিক্ষার্থীর তথ্য
create or replace function public.get_portal(p_token uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
declare s record;
begin
  select * into s from students where portal_token = p_token and status <> 'pending';
  if not found then
    return null;
  end if;

  return jsonb_build_object(
    'student', jsonb_build_object('name', s.name, 'status', s.status, 'joined_at', s.joined_at),
    'center', coalesce((select to_jsonb(c) - 'id' - 'teacher_id' from center_settings c where c.teacher_id = s.teacher_id), '{}'::jsonb),
    'batches', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', b.id, 'name', b.name, 'subject', b.subject,
        'schedule', b.schedule, 'monthly_fee', b.monthly_fee
      ) order by b.created_at)
      from enrollments e join batches b on b.id = e.batch_id
      where e.student_id = s.id
    ), '[]'::jsonb),
    'attendance', coalesce((
      select jsonb_agg(jsonb_build_object('batch_id', a.batch_id, 'date', a.date, 'status', a.status) order by a.date desc)
      from (select * from attendance where student_id = s.id order by date desc limit 120) a
    ), '[]'::jsonb),
    'payments', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', p.id, 'batch_id', p.batch_id, 'month', p.month,
        'amount', p.amount, 'paid_at', p.paid_at
      ) order by p.month desc)
      from payments p where p.student_id = s.id
    ), '[]'::jsonb),
    'results', coalesce((
      select jsonb_agg(jsonb_build_object(
        'exam_id', x.id, 'title', x.title, 'exam_date', x.exam_date,
        'total_marks', x.total_marks, 'marks', r.marks, 'batch_id', x.batch_id,
        'class_avg', (select round(avg(r2.marks), 1) from results r2 where r2.exam_id = x.id)
      ) order by x.exam_date desc nulls last)
      from results r join exams x on x.id = r.exam_id
      where r.student_id = s.id
    ), '[]'::jsonb)
  );
end $$;

-- অনলাইন ভর্তির আবেদন: "অপেক্ষমাণ" শিক্ষার্থী হিসেবে জমা হয়
create or replace function public.submit_application(
  p_name text,
  p_phone text,
  p_guardian_name text,
  p_guardian_phone text,
  p_class text,
  p_batch_id uuid,
  p_message text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare t uuid;
begin
  if coalesce(length(trim(p_name)), 0) < 2 or length(p_name) > 100 then
    raise exception 'invalid name';
  end if;
  if coalesce(length(trim(p_phone)), 0) < 6 or length(p_phone) > 20 then
    raise exception 'invalid phone';
  end if;

  if p_batch_id is not null then
    select teacher_id into t from batches where id = p_batch_id and is_public;
  end if;
  if t is null then
    select teacher_id into t from center_settings order by updated_at desc limit 1;
  end if;
  if t is null then
    select teacher_id into t from site_settings order by updated_at desc limit 1;
  end if;
  if t is null then
    raise exception 'not configured';
  end if;

  -- স্প্যাম ঠেকাতে: এক ঘণ্টায় ৩০টির বেশি আবেদন নয়
  if (select count(*) from students
        where teacher_id = t and status = 'pending' and source = 'online'
          and created_at > now() - interval '1 hour') >= 30 then
    raise exception 'too many applications';
  end if;

  insert into students (
    teacher_id, name, phone, guardian_name, guardian_phone,
    class_level, note, applied_batch_id, status, source
  ) values (
    t,
    trim(p_name),
    trim(p_phone),
    left(trim(coalesce(p_guardian_name, '')), 100),
    left(trim(coalesce(p_guardian_phone, '')), 20),
    left(trim(coalesce(p_class, '')), 50),
    left(trim(coalesce(p_message, '')), 500),
    (select id from batches where id = p_batch_id and teacher_id = t),
    'pending',
    'online'
  );
  return true;
end $$;

revoke all on function public.get_public_site() from public;
revoke all on function public.get_portal(uuid) from public;
revoke all on function public.submit_application(text, text, text, text, text, uuid, text) from public;
grant execute on function public.get_public_site() to anon, authenticated;
grant execute on function public.get_portal(uuid) to anon, authenticated;
grant execute on function public.submit_application(text, text, text, text, text, uuid, text) to anon, authenticated;
