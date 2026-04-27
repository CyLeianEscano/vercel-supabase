-- Profile table (1-1 with auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  bio text,
  avatar_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table profiles
  enable row level security;

create policy "profiles_select_own"
  on profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Articles table
create table articles (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references auth.users(id) on delete set null,
  title text not null,
  content text not null,
  slug text unique not null,
  views integer not null default 0,
  created_at timestamp with time zone default now()
);

alter table articles enable row level security;

create policy "articles_select_all"
  on articles for select
  using (true);

create policy "articles_insert_auth"
  on articles for insert
  with check (auth.role() = 'authenticated');

create policy "articles_update_auth"
  on articles for update
  using (auth.role() = 'authenticated');
