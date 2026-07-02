create type event_status as enum ('waiting', 'active', 'results');

create table events (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  status event_status not null default 'waiting',
  timer_ends_at timestamptz,
  ai_rankings jsonb,
  created_at timestamptz not null default now()
);

create table participants (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  name text not null,
  number integer not null,
  token uuid not null default gen_random_uuid(),
  greeting_sent boolean not null default false,
  created_at timestamptz not null default now(),
  unique (event_id, number),
  unique (event_id, token)
);

create table claims (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  claimer_id uuid not null references participants(id) on delete cascade,
  target_number integer not null,
  target_participant_id uuid not null references participants(id) on delete cascade,
  greeting text not null,
  created_at timestamptz not null default now(),
  unique (event_id, target_number),
  unique (event_id, claimer_id)
);

create index participants_event_id_idx on participants(event_id);
create index claims_event_id_idx on claims(event_id);

alter table events enable row level security;
alter table participants enable row level security;
alter table claims enable row level security;

create policy "events_select" on events for select using (true);
create policy "events_insert" on events for insert with check (true);
create policy "events_update" on events for update using (true);

create policy "participants_select" on participants for select using (true);
create policy "participants_insert" on participants for insert with check (true);
create policy "participants_update" on participants for update using (true);

create policy "claims_select" on claims for select using (true);
create policy "claims_insert" on claims for insert with check (true);

alter publication supabase_realtime add table events;
alter publication supabase_realtime add table participants;
alter publication supabase_realtime add table claims;
