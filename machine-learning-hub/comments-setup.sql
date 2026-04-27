-- Create comments table for Facebook-style comments under articles
create table comments (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references articles(id) on delete cascade,
  author text not null,
  body text not null,
  created_at timestamp with time zone default now()
);

-- Create index for faster lookups by article
create index comments_article_id_idx on comments(article_id);

-- Enable Row Level Security
alter table comments enable row level security;

-- Everyone can read comments
create policy "Comments are viewable by everyone" on comments
  for select using (true);

-- Everyone can insert comments (simple system, no auth tie)
create policy "Anyone can insert comments" on comments
  for insert with check (true);

-- Only comment authors can update their own comments
create policy "Users can update own comments" on comments
  for update using (auth.uid()::text = author);

-- Only comment authors can delete their own comments  
create policy "Users can delete own comments" on comments
  for delete using (auth.uid()::text = author);
