# Life RPG

Turn real life into an RPG. Add quests, finish them, earn XP and gold, level four
attributes, hold a streak, and spend what you earn buying the light back for a
world that starts almost entirely dark.

**Live app:** _add the deployed URL here before submitting_
**Walkthrough video:** _add the link here before submitting_

---

## The idea

Most gamified productivity apps sell you a hat for your character. Life RPG sells
you the lighting of the room you are standing in.

A new account starts at **Tier 0, Cold Start**: desaturated, one weak lamp, almost
no colour. Gold earned from real completed work unlocks tiers that progressively
warm and illuminate the entire interface, permanently. Progression is not a number
in a corner. It is the thing you are looking at.

| Tier | Name | Unlocks at | What changes |
| --- | --- | --- | --- |
| 0 | Cold Start | free | Near monochrome, one weak lamp |
| 1 | Lamplight | 400 gold, level 2 | Amber returns, the ink deepens |
| 2 | Bloom | 1,200 gold, level 5 | Sage and rose enter, embers drift |
| 3 | Ascendant | 3,000 gold, level 9 | Full warmth and gold leaf |

---

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16, App Router, React 19, TypeScript |
| Styling | Tailwind CSS v4, CSS custom properties for the tier system |
| Motion | GSAP + ScrollTrigger, Lenis, Canvas particles |
| Database | Supabase Postgres |
| Auth | Supabase Auth, email and password, cookie sessions via `@supabase/ssr` |
| Validation | Zod, on the server |
| Hosting | Vercel |

---

## Running it locally

### 1. Install

```bash
git clone https://github.com/lakshitasethia/tech_zephyr.git
cd tech_zephyr
npm install
```

### 2. Create a Supabase project

Go to [supabase.com/dashboard](https://supabase.com/dashboard), create a project,
then open **SQL Editor** and run the contents of:

```
supabase/migrations/0001_init.sql
```

That single file creates every table, every index, every row level security
policy, the progression functions and the seeded shop.

### 3. Environment variables

```bash
cp .env.example .env.local
```

Fill it in from **Project Settings → API** in the Supabase dashboard:

| Variable | Where to find it | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL | e.g. `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Project API keys → `anon` `public` | Safe in the browser. RLS is what protects the data, not this key. |
| `NEXT_PUBLIC_SITE_URL` | your own URL | `http://localhost:3000` locally |

There is no service role key anywhere in this project. The server never needs to
bypass RLS.

### 4. Run

```bash
npm run dev
```

Open <http://localhost:3000>.

---

## Deploying to Vercel

1. Push to GitHub.
2. Import the repository at [vercel.com/new](https://vercel.com/new).
3. Add the same three environment variables from `.env.example` under
   **Settings → Environment Variables**, with `NEXT_PUBLIC_SITE_URL` set to the
   production domain.
4. In Supabase, go to **Authentication → URL Configuration** and add the Vercel
   domain to **Site URL** and **Redirect URLs**, otherwise sign in will bounce.
5. Deploy.

---

## How cheating is prevented

The spec calls for "a secure backend to prevent users from easily cheating their
stats". Three layers do that, and they are independent of each other.

**1. The client cannot name a reward.**
`complete_quest(quest_id)` takes a quest id and nothing else. XP, gold, the
momentum multiplier, the streak and the new level are all derived inside the
database from the quest row's own stored difficulty and server-side constants in
`public.base_xp()` and `public.momentum()`. There is no request shape that
carries an XP number, so there is nothing to tamper with.

**2. The progression columns are not writable.**
```sql
grant update (display_name) on public.profiles to authenticated;
```
That is the only column of `profiles` the `authenticated` role may write.
`total_xp`, `gold` and `theme_tier` are unwritable at the privilege level, before
RLS is even consulted. `attributes`, `quest_completions`, `events` and `inventory`
are select-only for everyone. All writes happen inside `SECURITY DEFINER`
functions that re-check `auth.uid()` in their own bodies.

**3. Level is derived, never stored.**
`profiles` holds `total_xp` only. Level is computed by `public.level_from_xp()` on
read, so a stored level can never drift out of sync with the XP that earned it.

Two smaller guards: a partial unique index on `(quest_id, completed_on)` makes it
impossible to bank the same quest twice in one day, and the profile row is locked
with `for update` at the top of each RPC so two concurrent completions cannot both
read the same stale XP and double-apply a level up.

---

## Progression maths

XP required to **reach** level *L* is `50 × (L−1) × L`.

| Level | Total XP | Cost of that level |
| --- | --- | --- |
| 1 | 0 | — |
| 2 | 100 | 100 |
| 3 | 300 | 200 |
| 4 | 600 | 300 |
| 5 | 1,000 | 400 |
| 10 | 4,500 | 900 |

Every level costs 100 XP more than the one before it, so the curve is quadratic
and strictly non-linear, as the spec requires.

Base XP by difficulty is 10 / 25 / 50 / 90 / 150. That is multiplied by a
**momentum** multiplier of `1.00 + 0.05 × min(streak, 10)`, capping at `1.50x`.
Gold is a quarter of the XP awarded.

Momentum is deliberately a loss of *velocity* rather than a loss of *earned
progress*. Missing a day costs you the multiplier, which you can rebuild in days.
It never takes back a level you already worked for.

---

## Database schema

| Table | Purpose | Client access |
| --- | --- | --- |
| `profiles` | Character state: XP, gold, tier, streak | select, update `display_name` only |
| `attributes` | Per-user stat block, four rows per user | select only |
| `quests` | The user's tasks | full CRUD |
| `quest_completions` | Append-only history of every completion | select only |
| `events` | Append-only log: level ups, purchases, sign ups | select only |
| `shop_items` | Global catalogue | select only, readable by anyone |
| `inventory` | What the user owns | select only |

Row Level Security is **enabled and forced** on every user-scoped table. Every
policy scopes with `(select auth.uid()) = user_id`, wrapped in a scalar subquery
so Postgres evaluates it once per statement rather than once per row. Every
foreign key column carries an index.

`quest_completions` and `events` are never updated or deleted, which is what makes
the historical log the spec asks for genuinely historical.

---

## Accessibility

- Semantic landmarks and a single `h1` per page.
- Every control reachable by Tab, with a visible 2px amber focus ring, the only
  outline used anywhere in the design.
- The XP bar is a real `role="progressbar"` with live values.
- Toasts are in an `aria-live="polite"` region, the level up overlay is
  `aria-live="assertive"`.
- All animation, including the level up particle burst and the tier transition,
  is disabled under `prefers-reduced-motion`.
- Decorative canvases are `aria-hidden`.

---

## Project layout

```
app/
  page.tsx              landing page
  login/  signup/       auth screens
  play/                 the application, server rendered per request
components/
  auth/                 auth form
  play/                 dashboard, level up celebration, tier stylesheet
  sprites/              pixel characters, drawn as code
lib/
  supabase/             server, browser and middleware clients
  game/                 rules, types, queries
  actions/              server actions: quests, shop, auth
supabase/
  migrations/0001_init.sql   the entire database
middleware.ts           session refresh and route protection
```

---

## AI assistance disclosure

Parts of this project were built with AI coding assistants. The landing page UI
was generated with Gemini in Antigravity from a written design brief
(`gemini-ui-prompt.md`, kept in the repository). The database schema, security
model, server actions and application dashboard were built with Claude. Research
into the competitive landscape is documented in `research.md` with sources.
Commits carry co-author trailers where an assistant contributed.
