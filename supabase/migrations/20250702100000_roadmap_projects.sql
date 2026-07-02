create table roadmap_projects (
  slug text primary key,
  title text not null,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index roadmap_projects_updated_at_idx on roadmap_projects (updated_at desc);

alter table roadmap_projects enable row level security;

-- API routes use the service role key; no public client policies required.
