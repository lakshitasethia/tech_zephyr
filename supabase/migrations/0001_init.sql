-- ============================================================================
-- Life RPG — initial schema
--
-- Design principles driven by the hackathon spec:
--   1. "a secure backend to prevent users from easily cheating their stats"
--      -> the client can NEVER write xp, gold, level or attribute values.
--         Those columns are unwritable by the `authenticated` role. All
--         progression happens inside SECURITY DEFINER functions below, which
--         derive rewards from server-side constants.
--   2. "complex historical logs of completed tasks and inventory"
--      -> quest_completions and events are append-only history, never mutated.
--   3. "a non-linear leveling system"
--      -> cumulative xp to reach level L is 50 * (L-1) * L, so each level
--         costs 100 more xp than the previous one (100, 200, 300, 400 ...).
--   4. "A user should only see and modify their own tasks and character data"
--      -> RLS is enabled and FORCED on every user-scoped table.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.attribute_code as enum ('intellect', 'strength', 'discipline', 'spirit');
create type public.quest_difficulty as enum ('trivial', 'easy', 'normal', 'hard', 'epic');
create type public.quest_status as enum ('active', 'done', 'archived');
create type public.quest_cadence as enum ('once', 'daily', 'weekly');
create type public.completion_source as enum ('manual', 'timer');
create type public.shop_kind as enum ('theme', 'badge', 'trinket');

-- ---------------------------------------------------------------------------
-- profiles — one row per auth user, holds all character state
-- ---------------------------------------------------------------------------
create table public.profiles (
  id              uuid primary key references auth.users (id) on delete cascade,
  display_name    text not null default 'Wanderer',
  total_xp        bigint not null default 0 check (total_xp >= 0),
  gold            bigint not null default 0 check (gold >= 0),
  theme_tier      smallint not null default 0 check (theme_tier between 0 and 3),
  streak_current  integer not null default 0 check (streak_current >= 0),
  streak_longest  integer not null default 0 check (streak_longest >= 0),
  last_active_on  date,
  created_at      timestamptz not null default now()
);

comment on column public.profiles.total_xp is
  'Source of truth for progression. Level is DERIVED via public.level_from_xp(), never stored, so the two can never disagree.';

-- ---------------------------------------------------------------------------
-- attributes — per-user stat block. One row per attribute per user.
-- ---------------------------------------------------------------------------
create table public.attributes (
  user_id   uuid not null references public.profiles (id) on delete cascade,
  code      public.attribute_code not null,
  xp        bigint not null default 0 check (xp >= 0),
  primary key (user_id, code)
);

-- ---------------------------------------------------------------------------
-- quests — the user's tasks. Full CRUD surface.
-- ---------------------------------------------------------------------------
create table public.quests (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles (id) on delete cascade,
  title         text not null check (length(btrim(title)) between 1 and 140),
  notes         text check (length(notes) <= 2000),
  attribute     public.attribute_code not null default 'discipline',
  difficulty    public.quest_difficulty not null default 'normal',
  status        public.quest_status not null default 'active',
  cadence       public.quest_cadence not null default 'once',
  due_at        timestamptz,
  last_done_on  date,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- FK columns must be indexed or JOINs and cascade deletes do full table scans.
create index quests_user_id_idx on public.quests (user_id);
-- The dashboard's primary read: "my active quests, newest first".
create index quests_user_active_idx on public.quests (user_id, created_at desc)
  where status = 'active';

-- ---------------------------------------------------------------------------
-- quest_completions — append-only history. Never updated, never deleted.
-- ---------------------------------------------------------------------------
create table public.quest_completions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles (id) on delete cascade,
  quest_id      uuid references public.quests (id) on delete set null,
  title_at_time text not null,
  attribute     public.attribute_code not null,
  difficulty    public.quest_difficulty not null,
  xp_awarded    integer not null check (xp_awarded >= 0),
  gold_awarded  integer not null check (gold_awarded >= 0),
  multiplier    numeric(4,2) not null default 1.00,
  source        public.completion_source not null default 'manual',
  completed_on  date not null,
  completed_at  timestamptz not null default now()
);

create index quest_completions_user_id_idx on public.quest_completions (user_id);
create index quest_completions_quest_id_idx on public.quest_completions (quest_id);
-- Powers the history view and the streak calculation.
create index quest_completions_user_time_idx on public.quest_completions (user_id, completed_at desc);
-- One completion per quest per day: makes repeat-spamming a daily quest impossible.
create unique index quest_completions_daily_unique
  on public.quest_completions (quest_id, completed_on)
  where quest_id is not null;

-- ---------------------------------------------------------------------------
-- events — append-only narrative log (level ups, purchases, streaks)
-- ---------------------------------------------------------------------------
create table public.events (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  kind        text not null,
  payload     jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

create index events_user_id_idx on public.events (user_id);
create index events_user_time_idx on public.events (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- shop_items — global catalogue, not user scoped. Readable by everyone.
-- ---------------------------------------------------------------------------
create table public.shop_items (
  code        text primary key,
  name        text not null,
  description text not null,
  kind        public.shop_kind not null,
  cost_gold   integer not null check (cost_gold >= 0),
  grants_tier smallint check (grants_tier between 0 and 3),
  min_level   integer not null default 1 check (min_level >= 1),
  sort_order  integer not null default 0
);

-- ---------------------------------------------------------------------------
-- inventory — what the user owns
-- ---------------------------------------------------------------------------
create table public.inventory (
  user_id     uuid not null references public.profiles (id) on delete cascade,
  item_code   text not null references public.shop_items (code) on delete cascade,
  acquired_at timestamptz not null default now(),
  primary key (user_id, item_code)
);

create index inventory_item_code_idx on public.inventory (item_code);

-- ============================================================================
-- Progression maths. Pure functions, safe to call from anywhere.
-- ============================================================================

-- Cumulative XP required to REACH level L = 50 * (L-1) * L
--   L1 = 0, L2 = 100, L3 = 300, L4 = 600, L5 = 1000 ...
-- Each level therefore costs 100 more than the one before it: non-linear.
create or replace function public.xp_for_level(p_level integer)
returns bigint
language sql
immutable
parallel safe
set search_path = ''
as $$
  select (50 * greatest(p_level - 1, 0)::bigint * greatest(p_level, 1)::bigint);
$$;

-- Inverse of the above, solved with the quadratic formula.
create or replace function public.level_from_xp(p_xp bigint)
returns integer
language sql
immutable
parallel safe
set search_path = ''
as $$
  select greatest(1, floor((50 + sqrt(2500 + 200 * greatest(p_xp, 0)::numeric)) / 100)::integer);
$$;

-- Base XP per difficulty. Server-side constant: the client never sends a value.
create or replace function public.base_xp(p_difficulty public.quest_difficulty)
returns integer
language sql
immutable
parallel safe
set search_path = ''
as $$
  select case p_difficulty
    when 'trivial' then 10
    when 'easy'    then 25
    when 'normal'  then 50
    when 'hard'    then 90
    when 'epic'    then 150
  end;
$$;

-- Momentum multiplier grows with the streak and caps at 1.50x.
create or replace function public.momentum(p_streak integer)
returns numeric
language sql
immutable
parallel safe
set search_path = ''
as $$
  select round(1.00 + (least(greatest(p_streak, 0), 10) * 0.05), 2);
$$;

-- ============================================================================
-- New user bootstrap: profile + full attribute block, atomically.
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(nullif(btrim(new.raw_user_meta_data ->> 'display_name'), ''), 'Wanderer')
  )
  on conflict (id) do nothing;

  insert into public.attributes (user_id, code)
  select new.id, c
  from unnest(enum_range(null::public.attribute_code)) as c
  on conflict do nothing;

  insert into public.events (user_id, kind, payload)
  values (new.id, 'account_created', jsonb_build_object('tier', 0));

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- complete_quest — THE anti-cheat boundary.
--
-- The client sends only a quest id. Everything else (xp, gold, multiplier,
-- streak, level) is computed here from server-side constants and the row's
-- own stored difficulty. There is no code path by which a user can submit
-- an xp value.
-- ============================================================================
create or replace function public.complete_quest(
  p_quest_id uuid,
  p_source public.completion_source default 'manual'
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid         uuid := (select auth.uid());
  v_quest       public.quests;
  v_profile     public.profiles;
  v_today       date;
  v_streak      integer;
  v_mult        numeric(4,2);
  v_xp          integer;
  v_gold        integer;
  v_level_before integer;
  v_level_after  integer;
begin
  if v_uid is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

  -- Lock the profile row first: two concurrent completions cannot both read
  -- the same stale xp and double-apply a level up.
  select * into v_profile from public.profiles where id = v_uid for update;
  if not found then
    raise exception 'profile_missing' using errcode = 'P0002';
  end if;

  -- Ownership is re-checked here, not trusted from the caller.
  select * into v_quest
  from public.quests
  where id = p_quest_id and user_id = v_uid
  for update;

  if not found then
    raise exception 'quest_not_found' using errcode = 'P0002';
  end if;

  if v_quest.status = 'archived' then
    raise exception 'quest_archived' using errcode = '22023';
  end if;

  v_today := current_date;

  -- A one-off quest can only ever be completed once.
  if v_quest.cadence = 'once' and v_quest.status = 'done' then
    raise exception 'already_completed' using errcode = '23505';
  end if;

  -- A repeating quest can only be completed once per calendar day.
  if v_quest.last_done_on = v_today then
    raise exception 'already_completed_today' using errcode = '23505';
  end if;

  -- Streak: consecutive calendar days with at least one completion.
  if v_profile.last_active_on = v_today then
    v_streak := greatest(v_profile.streak_current, 1);
  elsif v_profile.last_active_on = v_today - 1 then
    v_streak := v_profile.streak_current + 1;
  else
    v_streak := 1;
  end if;

  v_mult := public.momentum(v_streak);
  v_xp   := floor(public.base_xp(v_quest.difficulty) * v_mult);
  v_gold := greatest(1, floor(v_xp / 4.0));

  v_level_before := public.level_from_xp(v_profile.total_xp);

  update public.profiles
  set total_xp       = total_xp + v_xp,
      gold           = gold + v_gold,
      streak_current = v_streak,
      streak_longest = greatest(streak_longest, v_streak),
      last_active_on = v_today
  where id = v_uid
  returning * into v_profile;

  v_level_after := public.level_from_xp(v_profile.total_xp);

  update public.attributes
  set xp = xp + v_xp
  where user_id = v_uid and code = v_quest.attribute;

  update public.quests
  set status       = case when cadence = 'once' then 'done'::public.quest_status else status end,
      last_done_on = v_today,
      updated_at   = now()
  where id = p_quest_id;

  insert into public.quest_completions (
    user_id, quest_id, title_at_time, attribute, difficulty,
    xp_awarded, gold_awarded, multiplier, source, completed_on
  )
  values (
    v_uid, p_quest_id, v_quest.title, v_quest.attribute, v_quest.difficulty,
    v_xp, v_gold, v_mult, p_source, v_today
  );

  insert into public.events (user_id, kind, payload)
  values (v_uid, 'quest_completed', jsonb_build_object(
    'quest_id', p_quest_id, 'title', v_quest.title, 'xp', v_xp,
    'gold', v_gold, 'multiplier', v_mult, 'attribute', v_quest.attribute
  ));

  if v_level_after > v_level_before then
    insert into public.events (user_id, kind, payload)
    values (v_uid, 'level_up', jsonb_build_object('from', v_level_before, 'to', v_level_after));
  end if;

  return jsonb_build_object(
    'xp_awarded',   v_xp,
    'gold_awarded', v_gold,
    'multiplier',   v_mult,
    'total_xp',     v_profile.total_xp,
    'gold',         v_profile.gold,
    'level_before', v_level_before,
    'level_after',  v_level_after,
    'levelled_up',  v_level_after > v_level_before,
    'streak',       v_streak,
    'attribute',    v_quest.attribute
  );
end;
$$;

-- ============================================================================
-- purchase_item — the economy. Gold is checked and deducted server side.
-- ============================================================================
create or replace function public.purchase_item(p_item_code text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid     uuid := (select auth.uid());
  v_item    public.shop_items;
  v_profile public.profiles;
  v_level   integer;
begin
  if v_uid is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

  select * into v_item from public.shop_items where code = p_item_code;
  if not found then
    raise exception 'item_not_found' using errcode = 'P0002';
  end if;

  select * into v_profile from public.profiles where id = v_uid for update;
  if not found then
    raise exception 'profile_missing' using errcode = 'P0002';
  end if;

  if exists (select 1 from public.inventory where user_id = v_uid and item_code = p_item_code) then
    raise exception 'already_owned' using errcode = '23505';
  end if;

  v_level := public.level_from_xp(v_profile.total_xp);
  if v_level < v_item.min_level then
    raise exception 'level_too_low' using errcode = '22023';
  end if;

  if v_profile.gold < v_item.cost_gold then
    raise exception 'insufficient_gold' using errcode = '22023';
  end if;

  update public.profiles
  set gold       = gold - v_item.cost_gold,
      theme_tier = case
                     when v_item.grants_tier is not null
                     then greatest(theme_tier, v_item.grants_tier)
                     else theme_tier
                   end
  where id = v_uid
  returning * into v_profile;

  insert into public.inventory (user_id, item_code) values (v_uid, p_item_code);

  insert into public.events (user_id, kind, payload)
  values (v_uid, 'item_purchased', jsonb_build_object(
    'item', p_item_code, 'name', v_item.name,
    'cost', v_item.cost_gold, 'tier', v_profile.theme_tier
  ));

  return jsonb_build_object(
    'item', p_item_code,
    'name', v_item.name,
    'gold', v_profile.gold,
    'theme_tier', v_profile.theme_tier
  );
end;
$$;

-- ============================================================================
-- Row Level Security. Enabled AND forced on every user-scoped table.
-- auth.uid() is wrapped in a scalar subquery so Postgres evaluates it once
-- per statement rather than once per row.
-- ============================================================================
alter table public.profiles          enable row level security;
alter table public.attributes        enable row level security;
alter table public.quests            enable row level security;
alter table public.quest_completions enable row level security;
alter table public.events            enable row level security;
alter table public.inventory         enable row level security;
alter table public.shop_items        enable row level security;

alter table public.profiles          force row level security;
alter table public.attributes        force row level security;
alter table public.quests            force row level security;
alter table public.quest_completions force row level security;
alter table public.events            force row level security;
alter table public.inventory         force row level security;

-- profiles: read and update own row only. No insert (the trigger owns that),
-- no delete (cascades from auth.users).
create policy profiles_select_own on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
create policy profiles_update_own on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- attributes / completions / events / inventory: read only for the owner.
-- Writes happen exclusively inside the SECURITY DEFINER functions above,
-- which is what makes the stats un-forgeable from the client.
create policy attributes_select_own on public.attributes
  for select to authenticated using ((select auth.uid()) = user_id);

create policy completions_select_own on public.quest_completions
  for select to authenticated using ((select auth.uid()) = user_id);

create policy events_select_own on public.events
  for select to authenticated using ((select auth.uid()) = user_id);

create policy inventory_select_own on public.inventory
  for select to authenticated using ((select auth.uid()) = user_id);

-- quests: full CRUD for the owner. This is the only table the client writes
-- directly, and it holds no progression values.
create policy quests_select_own on public.quests
  for select to authenticated using ((select auth.uid()) = user_id);
create policy quests_insert_own on public.quests
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy quests_update_own on public.quests
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy quests_delete_own on public.quests
  for delete to authenticated using ((select auth.uid()) = user_id);

-- shop_items: a public catalogue. Readable by anyone, writable by no one.
create policy shop_items_select_all on public.shop_items
  for select to anon, authenticated using (true);

-- ============================================================================
-- Column-level privileges.
--
-- Even though quests is the only client-writable table, we revoke the
-- progression columns explicitly. Belt and braces: if a policy were ever
-- loosened by mistake, the grant still blocks the write.
-- ============================================================================
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (display_name) on public.profiles to authenticated;

revoke all on public.attributes, public.quest_completions, public.events, public.inventory
  from anon, authenticated;
grant select on public.attributes, public.quest_completions, public.events, public.inventory
  to authenticated;

revoke all on public.quests from anon, authenticated;
grant select, insert, update, delete on public.quests to authenticated;

revoke all on public.shop_items from anon, authenticated;
grant select on public.shop_items to anon, authenticated;

-- The RPCs are the only sanctioned write path for progression.
grant execute on function public.complete_quest(uuid, public.completion_source) to authenticated;
grant execute on function public.purchase_item(text) to authenticated;
grant execute on function public.level_from_xp(bigint) to anon, authenticated;
grant execute on function public.xp_for_level(integer) to anon, authenticated;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- ============================================================================
-- Seed the shop. Tier-granting items are the progression spine:
-- the world's lighting is what you are buying.
-- ============================================================================
insert into public.shop_items (code, name, description, kind, cost_gold, grants_tier, min_level, sort_order) values
  ('tier_lamplight', 'Lamplight',  'Amber returns to the world. The ink deepens and the desk finds its warmth.', 'theme',   400, 1, 2,  10),
  ('tier_bloom',     'Bloom',      'Sage and rose enter the palette. Embers begin to drift at the edges.',        'theme',  1200, 2, 5,  20),
  ('tier_ascendant', 'Ascendant',  'Full warmth, gold leaf and volumetric light. The dark is fully bought back.', 'theme',  3000, 3, 9,  30),
  ('badge_firstblood','First Light','Awarded for the very first quest you ever finish.',                          'badge',    50, null, 1, 40),
  ('badge_ironweek', 'Iron Week',  'Seven consecutive days. The hardest stretch there is.',                       'badge',   250, null, 3, 50),
  ('trinket_moth',   'The Moth',   'A small companion that circles your lantern for as long as your streak holds.','trinket', 150, null, 2, 60),
  ('trinket_quill',  'Ledger Quill','Your chronicle is written in a finer hand.',                                 'trinket', 300, null, 4, 70)
on conflict (code) do nothing;

-- ---------------------------------------------------------------------------
-- Postgres grants EXECUTE on new functions to PUBLIC by default, so `anon`
-- inherits the right to call the progression RPCs over /rest/v1/rpc/.
-- Both functions already refuse an unauthenticated caller, but the endpoint
-- should not be reachable at all.
-- ---------------------------------------------------------------------------
revoke execute on function public.complete_quest(uuid, public.completion_source) from public, anon;
revoke execute on function public.purchase_item(text) from public, anon;
revoke execute on function public.base_xp(public.quest_difficulty) from public, anon;
revoke execute on function public.momentum(integer) from public, anon;

grant execute on function public.complete_quest(uuid, public.completion_source) to authenticated;
grant execute on function public.purchase_item(text) to authenticated;
grant execute on function public.base_xp(public.quest_difficulty) to authenticated;
grant execute on function public.momentum(integer) to authenticated;

-- ---------------------------------------------------------------------------
-- Repricing. The tiers were originally priced so high that nobody reached one
-- in a normal session: a few quests earn roughly 40 to 160 gold while tier 1
-- cost 400, so the signature mechanic was never actually seen. Tier 1 now
-- lands after about three quests.
-- ---------------------------------------------------------------------------
update public.shop_items set cost_gold = 120, min_level = 1 where code = 'tier_lamplight';
update public.shop_items set cost_gold = 400, min_level = 3 where code = 'tier_bloom';
update public.shop_items set cost_gold = 900, min_level = 6 where code = 'tier_ascendant';
update public.shop_items set cost_gold =  40, min_level = 1 where code = 'badge_firstblood';
update public.shop_items set cost_gold = 150, min_level = 2 where code = 'badge_ironweek';
update public.shop_items set cost_gold =  80, min_level = 1 where code = 'trinket_moth';
update public.shop_items set cost_gold = 200, min_level = 3 where code = 'trinket_quill';

-- ---------------------------------------------------------------------------
-- Demo friendly pricing. One epic quest yields about 39 gold, so tier 1 lands
-- after a single completion and all three tiers inside a short session. Level
-- gates lowered to match, so nothing is blocked behind grinding that a three
-- minute walkthrough cannot show. Everything sits between 1 and 300 gold.
-- ---------------------------------------------------------------------------
update public.shop_items set cost_gold =  25, min_level = 1 where code = 'tier_lamplight';
update public.shop_items set cost_gold =  75, min_level = 2 where code = 'tier_bloom';
update public.shop_items set cost_gold = 150, min_level = 3 where code = 'tier_ascendant';
update public.shop_items set cost_gold =  10, min_level = 1 where code = 'badge_firstblood';
update public.shop_items set cost_gold =  60, min_level = 2 where code = 'badge_ironweek';
update public.shop_items set cost_gold =  30, min_level = 1 where code = 'trinket_moth';
update public.shop_items set cost_gold = 100, min_level = 2 where code = 'trinket_quill';
