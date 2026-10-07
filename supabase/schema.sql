-- Unified Message Tracker - Supabase schema
-- Run this whole file in Supabase Dashboard > SQL Editor > New query.

create extension if not exists pgcrypto;

-- ---------- Profiles ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  avatar_url text not null default '',
  bio text not null default '',
  phone text not null default '',
  location text not null default '',
  timezone text not null default 'Asia/Kolkata',
  email_notifications boolean not null default true,
  push_notifications boolean not null default true,
  reminder_time_offset integer not null default 30,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Messages ----------
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  platform text not null default 'other' check (platform in ('whatsapp','telegram','instagram','email','wechat','other')),
  sender text not null,
  sender_contact text not null default '',
  content text not null,
  priority text not null default 'medium' check (priority in ('low','medium','high','urgent')),
  category text not null default 'General',
  status text not null default 'pending' check (status in ('pending','completed','postponed')),
  message_date timestamptz not null default now(),
  due_date timestamptz,
  reminder_time timestamptz,
  notes text not null default '',
  is_starred boolean not null default false,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Reminders ----------
create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  message_id uuid references public.messages(id) on delete cascade,
  title text not null,
  description text not null default '',
  due_date timestamptz not null,
  status text not null default 'pending' check (status in ('pending','completed','snoozed')),
  priority text not null default 'medium' check (priority in ('low','medium','high','urgent')),
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Notifications ----------
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  type text not null default 'info' check (type in ('info','reminder','warning','success')),
  title text not null,
  body text not null default '',
  message_id uuid references public.messages(id) on delete cascade,
  is_read boolean not null default false,
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists messages_user_id_idx on public.messages(user_id);
create index if not exists messages_created_at_idx on public.messages(created_at desc);
create index if not exists reminders_user_id_idx on public.reminders(user_id);
create index if not exists reminders_due_date_idx on public.reminders(due_date);
create index if not exists notifications_user_id_idx on public.notifications(user_id);
create index if not exists notifications_created_at_idx on public.notifications(created_at desc);

-- updated_at helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists messages_set_updated_at on public.messages;
create trigger messages_set_updated_at before update on public.messages
for each row execute function public.set_updated_at();

drop trigger if exists reminders_set_updated_at on public.reminders;
create trigger reminders_set_updated_at before update on public.reminders
for each row execute function public.set_updated_at();

-- Auto-create profile for every new Supabase Auth user
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ---------- Row Level Security ----------
alter table public.profiles enable row level security;
alter table public.messages enable row level security;
alter table public.reminders enable row level security;
alter table public.notifications enable row level security;

-- profiles policies
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- messages policies
drop policy if exists "messages_select_own" on public.messages;
create policy "messages_select_own" on public.messages for select using (auth.uid() = user_id);
drop policy if exists "messages_insert_own" on public.messages;
create policy "messages_insert_own" on public.messages for insert with check (auth.uid() = user_id);
drop policy if exists "messages_update_own" on public.messages;
create policy "messages_update_own" on public.messages for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "messages_delete_own" on public.messages;
create policy "messages_delete_own" on public.messages for delete using (auth.uid() = user_id);

-- reminders policies
drop policy if exists "reminders_select_own" on public.reminders;
create policy "reminders_select_own" on public.reminders for select using (auth.uid() = user_id);
drop policy if exists "reminders_insert_own" on public.reminders;
create policy "reminders_insert_own" on public.reminders for insert with check (auth.uid() = user_id);
drop policy if exists "reminders_update_own" on public.reminders;
create policy "reminders_update_own" on public.reminders for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "reminders_delete_own" on public.reminders;
create policy "reminders_delete_own" on public.reminders for delete using (auth.uid() = user_id);

-- notifications policies
drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own" on public.notifications for select using (auth.uid() = user_id);
drop policy if exists "notifications_insert_own" on public.notifications;
create policy "notifications_insert_own" on public.notifications for insert with check (auth.uid() = user_id);
drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own" on public.notifications for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "notifications_delete_own" on public.notifications;
create policy "notifications_delete_own" on public.notifications for delete using (auth.uid() = user_id);
