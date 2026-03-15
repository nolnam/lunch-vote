-- Lunch Vote 앱 데이터베이스 스키마
-- Supabase SQL Editor에서 실행하세요

-- 메뉴 제안 테이블
create table if not exists menus (
  id uuid default gen_random_uuid() primary key,
  proposer_name text not null,
  menu_name text not null,
  comment text not null default '',
  created_at timestamptz default now()
);

-- 투표 테이블
create table if not exists votes (
  id uuid default gen_random_uuid() primary key,
  menu_id uuid not null references menus(id) on delete cascade,
  voter_name text not null,
  created_at timestamptz default now(),
  -- 1인 1표: 같은 이름으로 한 번만 투표 가능
  unique(voter_name)
);

-- 인덱스
create index if not exists idx_votes_menu_id on votes(menu_id);
create index if not exists idx_votes_voter_name on votes(voter_name);

-- RLS (Row Level Security) 비활성화 - 인증 없는 앱
alter table menus enable row level security;
alter table votes enable row level security;

-- 모든 사용자에게 읽기/쓰기 허용
create policy "Anyone can read menus" on menus for select using (true);
create policy "Anyone can insert menus" on menus for insert with check (true);

create policy "Anyone can read votes" on votes for select using (true);
create policy "Anyone can insert votes" on votes for insert with check (true);
create policy "Anyone can delete own votes" on votes for delete using (true);
