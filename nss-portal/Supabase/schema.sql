-- NSS Certificate Portal — Supabase schema
-- Run this once in your Supabase project's SQL Editor (Dashboard > SQL Editor > New query).
-- It creates a table that ties one certificate record to one authenticated
-- user, and locks it down with Row Level Security so a user can only ever
-- see or write their own row — even though this app talks to Supabase
-- directly from the browser using the public "anon" key.

create table if not exists public.certificates (
  id uuid primary key references auth.users(id) on delete cascade,
  verified_name text not null,
  age int not null check (age > 0 and age < 130),
  class text not null,
  designation text not null,
  created_at timestamptz not null default now()
);

alter table public.certificates enable row level security;

-- A user may insert only a row whose id equals their own auth uid.
create policy "Users can insert their own certificate"
  on public.certificates
  for insert
  to authenticated
  with check (auth.uid() = id);

-- A user may read only their own row.
create policy "Users can view their own certificate"
  on public.certificates
  for select
  to authenticated
  using (auth.uid() = id);

-- A user may update only their own row (e.g. changing theme-relevant fields
-- later). Remove this policy if you want certificates to be immutable once
-- issued.
create policy "Users can update their own certificate"
  on public.certificates
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- No delete policy is defined on purpose: users cannot delete their record
-- from the client. Do that from the Supabase dashboard if ever needed.
