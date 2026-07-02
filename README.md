# Ice Breaker — Seminar Web App

A real-time ice breaker for seminars. The speaker creates an event and shares a QR code. Attendees join, get a random number, pick someone else's number, and send a creative greeting. Results are shown with AI-ranked top greetings.

## Stack

- **Next.js 16** (App Router)
- **Supabase** (Postgres + Realtime)
- **OpenAI** (creative greeting rankings via Vercel AI SDK)
- **Tailwind CSS** + **shadcn/ui**

## Setup

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the migration in `supabase/migrations/20250702000000_icebreaker.sql` via the SQL editor or CLI:

```bash
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

3. Enable Realtime for `events`, `participants`, and `claims` (included in migration)

### 2. Environment variables

Copy `.env.local.example` to `.env.local` and fill in:

```bash
cp .env.local.example .env.local
```

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server only) |
| `OPENAI_API_KEY` | OpenAI API key for greeting rankings |
| `NEXT_PUBLIC_APP_URL` | App URL for QR codes (e.g. `http://localhost:3000`) |

### 3. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## How it works

1. **Speaker** clicks "Start new event" → gets a host dashboard with QR code
2. **Attendees** scan QR → enter name → receive a random number
3. **Speaker** starts the event when ≥ 2 people have joined
4. **Attendees** see shuffled, color-coded number boxes (not their own) and tap one
5. They write a greeting; the box disappears for everyone else
6. **5-minute timer** — when time runs out or everyone has greeted, results appear
7. **AI ranks** the top 3 most creative greetings

## Routes

| Route | Purpose |
|-------|---------|
| `/` | Landing — create event |
| `/host/[code]` | Speaker dashboard |
| `/join/[code]` | Attendee flow |

## Deploy

Deploy to [Vercel](https://vercel.com) and set the same environment variables. Update `NEXT_PUBLIC_APP_URL` to your production domain so QR codes work correctly.

## Version History

### v0.2.0 (Current)

- Ice Breaker seminar app with host dashboard, QR join flow, and attendee greeting UI
- Supabase schema, Realtime updates, and API routes for events, participants, and claims
- OpenAI-powered ranking of top creative greetings
- shadcn/ui components, theming, and Tailwind styling

### v0.1.0

- Initial Next.js app scaffold
