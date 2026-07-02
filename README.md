# D365 Warehouse Digitalisation Roadmap

Interactive project dashboard for the D365 warehouse digitalisation programme. Track phases, deliverables, kanban status, success metrics, MoSCoW scope, and critical dependencies — with local persistence, JSON import/export, and light/dark mode.

## Features

- **Roadmap overview** — five phases with goals, milestones, and completion stats
- **Interactive kanban** — move deliverables across Backlog → Done
- **Metrics & scope** — MoSCoW groupings, editable KPIs, dependency checklist
- **Persistence** — auto-saves to `localStorage`
- **Import / export** — download or restore full project JSON

## Stack

- **Next.js 16** (App Router)
- **Tailwind CSS**
- **lucide-react**
- **next-themes** (light / dark mode)

## Run locally

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

### v1.0.0 (Current)

- D365 warehouse digitalisation roadmap dashboard
- Roadmap, kanban, and metrics views with editable deliverables
- Light/dark theme toggle with `next-themes`
- JSON import, export, and reset to demo data
