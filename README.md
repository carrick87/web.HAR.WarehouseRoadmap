# D365 Warehouse Digitalisation Roadmap

Interactive project dashboard for the D365 warehouse digitalisation programme. Track phases, deliverables, kanban status, success metrics, MoSCoW scope, and critical dependencies — with local persistence, JSON import/export, and light/dark mode.

## Features

- **Roadmap overview** — five phases with goals, milestones, and completion stats
- **Interactive kanban** — move deliverables across Backlog → Done
- **Metrics & scope** — MoSCoW groupings, editable KPIs, dependency checklist
- **Persistence** — auto-saves to `localStorage`
- **Cloud save** — save and load progress to Supabase by project code
- **Import / export** — download or restore full project JSON

## Stack

- **Next.js 16** (App Router)
- **Supabase** (Postgres — roadmap project snapshots)
- **Tailwind CSS**
- **lucide-react**
- **next-themes** (light / dark mode)

## Setup

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the migration in `supabase/migrations/20250702100000_roadmap_projects.sql` via the SQL editor or CLI:

```bash
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

### 2. Environment variables

Copy `.env.local.example` to `.env.local` and fill in:

```bash
cp .env.local.example .env.local
```

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (reserved for future client use) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server API routes only) |

### 3. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy

Deploy to [Vercel](https://vercel.com) or any Node host that supports Next.js:

```bash
npm run build
npm start
```

## Version History

### v1.1.0 (Current)

- Supabase cloud save and load by project code
- Save progress button with unsaved-change indicator
- API route `PUT/GET /api/roadmap/[slug]`

### v1.0.0

- D365 warehouse digitalisation roadmap dashboard
- Roadmap, kanban, and metrics views with editable deliverables
- Light/dark theme toggle with `next-themes`
- JSON import, export, and reset to demo data
