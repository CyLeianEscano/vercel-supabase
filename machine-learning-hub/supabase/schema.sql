-- supabase/schema.sql
-- Complete database schema for ML Hub application
-- Run this once in Supabase SQL Editor when maintenance is over

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- PROFILES table
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  bio text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ARTICLES table  
create table if not exists articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  content text not null,
  views integer not null default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- COMMENTS table
create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references articles(id) on delete cascade,
  author text not null,
  body text not null,
  created_at timestamp with time zone default now()
);

-- Indexes for performance
create index if not exists profiles_id_idx on profiles(id);
create index if not exists articles_slug_idx on articles(slug);
create index if not exists articles_created_at_idx on articles(created_at desc);
create index if not exists comments_article_id_idx on comments(article_id);
create index if not exists comments_created_at_idx on comments(created_at desc);

-- Enable Row Level Security
alter table profiles enable row level security;
alter table articles enable row level security;
alter table comments enable row level security;

-- PROFILES RLS policies
create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on profiles
  for insert with check (auth.uid() = id);

-- ARTICLES RLS policies  
create policy "Articles are viewable by everyone" on articles
  for select using (true);

create policy "Authenticated users can create articles" on articles
  for insert with check (auth.role() = 'authenticated');

create policy "Users can update own articles" on articles
  for update using (auth.uid() = id);

create policy "Users can delete own articles" on articles
  for delete using (auth.uid() = id);

-- COMMENTS RLS policies
create policy "Comments are viewable by everyone" on comments
  for select using (true);

create policy "Anyone can insert comments" on comments
  for insert with check (true);

create policy "Users can update own comments" on comments
  for update using (auth.uid()::text = author);

create policy "Users can delete own comments" on comments
  for delete using (auth.uid()::text = author);

-- Function to automatically update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger update_profiles_updated_at 
  before update on profiles 
  for each row execute function update_updated_at_column();

create trigger update_articles_updated_at 
  before update on articles 
  for each row execute function update_updated_at_column();

-- Function to handle new user profile creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, bio)
  values (new.id, null, null);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
