"use client";

import { useOptimistic, useRef, useState, useTransition } from "react";
import { completeQuest, createQuest, deleteQuest } from "@/lib/actions/quests";
import { purchaseItem } from "@/lib/actions/shop";
import {
  ATTRIBUTE_LABEL,
  ATTRIBUTES,
  BASE_XP,
  DIFFICULTIES,
  DIFFICULTY_LABEL,
  TIERS,
  levelFromXp,
  momentum,
  progress,
  type AttributeCode,
  type Difficulty,
} from "@/lib/game/rules";
import type {
  Attribute,
  Profile,
  Quest,
  QuestCompletion,
  ShopItem,
} from "@/lib/game/types";
import Celebration from "./Celebration";
import "./tiers.css";

interface Props {
  profile: Profile;
  attributes: Attribute[];
  quests: Quest[];
  completions: QuestCompletion[];
  owned: string[];
  shop: ShopItem[];
}

type Toast = { id: number; text: string; tone: "good" | "bad" };

export default function Dashboard(props: Props) {
  const [profile, setProfile] = useState(props.profile);
  const [attributes, setAttributes] = useState(props.attributes);
  const [quests, setQuests] = useState(props.quests);
  const [owned, setOwned] = useState(new Set(props.owned));
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [celebration, setCelebration] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();
  const toastId = useRef(0);

  // Optimistic quest list: a completed quest leaves the active list instantly,
  // long before the server confirms, so the checkmark never feels laggy.
  const [visibleQuests, removeOptimistic] = useOptimistic(
    quests,
    (current: Quest[], id: string) => current.filter((q) => q.id !== id),
  );

  const today = new Date().toISOString().slice(0, 10);
  const active = visibleQuests.filter(
    (q) => q.status === "active" && q.last_done_on !== today,
  );
  const doneToday = visibleQuests.filter(
    (q) => q.status === "done" || q.last_done_on === today,
  );

  const p = progress(profile.total_xp);
  const mult = momentum(profile.streak_current);
  const tier = profile.theme_tier;

  function toast(text: string, tone: "good" | "bad" = "good") {
    const id = ++toastId.current;
    setToasts((t) => [...t, { id, text, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }

  function onComplete(quest: Quest) {
    startTransition(async () => {
      removeOptimistic(quest.id);
      const res = await completeQuest(quest.id);

      if (!res.ok) {
        toast(res.error, "bad");
        return;
      }

      const d = res.data;
      setProfile((prev) => ({
        ...prev,
        total_xp: d.total_xp,
        gold: d.gold,
        streak_current: d.streak,
        streak_longest: Math.max(prev.streak_longest, d.streak),
        last_active_on: today,
      }));
      setAttributes((prev) =>
        prev.map((a) =>
          a.code === d.attribute ? { ...a, xp: a.xp + d.xp_awarded } : a,
        ),
      );
      setQuests((prev) =>
        prev.map((q) =>
          q.id === quest.id
            ? {
                ...q,
                status: q.cadence === "once" ? "done" : q.status,
                last_done_on: today,
              }
            : q,
        ),
      );

      if (d.levelled_up) setCelebration(d.level_after);
      else toast(`+${d.xp_awarded} xp, +${d.gold_awarded} gold`);
    });
  }

  function onDelete(quest: Quest) {
    startTransition(async () => {
      removeOptimistic(quest.id);
      const res = await deleteQuest(quest.id);
      if (!res.ok) {
        toast(res.error, "bad");
        return;
      }
      setQuests((prev) => prev.filter((q) => q.id !== quest.id));
      toast("Quest removed");
    });
  }

  function onAdd(form: FormData) {
    const title = String(form.get("title") ?? "").trim();
    if (!title) {
      toast("Give the quest a name.", "bad");
      return;
    }
    startTransition(async () => {
      const res = await createQuest({
        title,
        attribute: form.get("attribute") as AttributeCode,
        difficulty: form.get("difficulty") as Difficulty,
        cadence: form.get("cadence") as "once" | "daily" | "weekly",
        notes: null,
        due_at: null,
      });
      if (!res.ok) {
        toast(res.error, "bad");
        return;
      }
      setQuests((prev) => [res.data, ...prev]);
      toast("Quest added");
    });
  }

  function onBuy(item: ShopItem) {
    startTransition(async () => {
      const res = await purchaseItem(item.code);
      if (!res.ok) {
        toast(res.error, "bad");
        return;
      }
      setOwned((prev) => new Set(prev).add(item.code));
      setProfile((prev) => ({
        ...prev,
        gold: res.data.gold,
        theme_tier: res.data.theme_tier,
      }));
      toast(
        item.grants_tier !== null
          ? `${item.name} unlocked. The world warms.`
          : `${item.name} acquired.`,
      );
    });
  }

  return (
    <div data-tier={tier} className="tier-root min-h-screen">
      {celebration !== null && (
        <Celebration level={celebration} onDone={() => setCelebration(null)} />
      )}

      {/* Toasts */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-5 left-1/2 z-40 flex w-[min(92vw,26rem)] -translate-x-1/2 flex-col gap-2"
      >
        {toasts.map((t) => (
          <p
            key={t.id}
            className={`font-micro px-4 py-3 text-center ${
              t.tone === "good"
                ? "bg-[var(--amber)] text-[var(--void)]"
                : "bg-[var(--rose)] text-[var(--void)]"
            }`}
          >
            {t.text}
          </p>
        ))}
      </div>

      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-5 py-10">
        {/* ---------------- Character header ---------------- */}
        <header className="flex flex-col gap-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-micro text-[var(--amber)]">
                {TIERS[tier].name} · tier {tier}
              </p>
              <h1 className="font-display mt-1 text-3xl text-[var(--cream)] sm:text-4xl">
                {profile.display_name}
              </h1>
            </div>
            <div className="flex items-center gap-6">
              <Stat label="Gold" value={profile.gold.toLocaleString()} accent />
              <Stat label="Streak" value={`${profile.streak_current}d`} />
              <Stat label="Momentum" value={`${mult.toFixed(2)}x`} accent />
              {/* A real HTML form posting to a route handler, not a Server
                  Action. As <form action={signOut}> React rendered an empty
                  action attribute and no request ever reached the server.
                  This also works with JavaScript disabled. */}
              <form method="post" action="/auth/signout">
                <button
                  type="submit"
                  className="font-micro text-[var(--muted)] underline underline-offset-4 hover:text-[var(--cream)]"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>

          <div>
            <div className="font-micro mb-2 flex justify-between text-[var(--muted)]">
              <span>Level {p.level}</span>
              <span className="tabular-nums">
                {p.into.toLocaleString()} / {p.span.toLocaleString()} xp
              </span>
            </div>
            <div
              className="h-2 w-full bg-[var(--ink)]"
              role="progressbar"
              aria-valuenow={Math.round(p.percent)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Progress to level ${p.level + 1}`}
            >
              <div
                className="h-full bg-[var(--amber)] transition-[width] duration-500 ease-out"
                style={{ width: `${p.percent}%` }}
              />
            </div>
          </div>
        </header>

        {/* ---------------- Add quest ---------------- */}
        <section aria-labelledby="add-heading">
          <h2 id="add-heading" className="font-micro mb-3 text-[var(--muted)]">
            New quest
          </h2>
          <form
            action={onAdd}
            className="flex flex-col gap-3 bg-[var(--ink)] p-4 sm:flex-row sm:items-center"
          >
            <input
              id="title"
              name="title"
              type="text"
              required
              maxLength={140}
              placeholder="Read 20 pages"
              aria-label="Quest name"
              className="flex-1 bg-transparent px-2 py-2 text-[var(--cream)] outline-none placeholder:text-[var(--muted)]/60"
            />
            <select
              id="attribute"
              name="attribute"
              aria-label="Attribute"
              defaultValue="discipline"
              className="font-micro bg-[var(--void)] px-3 py-2 text-[var(--muted)] outline-none"
            >
              {ATTRIBUTES.map((a) => (
                <option key={a} value={a}>
                  {ATTRIBUTE_LABEL[a]}
                </option>
              ))}
            </select>
            <select
              id="difficulty"
              name="difficulty"
              aria-label="Difficulty"
              defaultValue="normal"
              className="font-micro bg-[var(--void)] px-3 py-2 text-[var(--muted)] outline-none"
            >
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>
                  {DIFFICULTY_LABEL[d]} · {BASE_XP[d]}xp
                </option>
              ))}
            </select>
            <select
              id="cadence"
              name="cadence"
              aria-label="Repeats"
              defaultValue="once"
              className="font-micro bg-[var(--void)] px-3 py-2 text-[var(--muted)] outline-none"
            >
              <option value="once">Once</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
            <button type="submit" disabled={pending} className="pixel-btn-amber">
              Add
            </button>
          </form>
        </section>

        {/* ---------------- Quests ---------------- */}
        <section aria-labelledby="quests-heading" className="grid gap-8 md:grid-cols-[1.6fr_1fr]">
          <div>
            <h2 id="quests-heading" className="font-micro mb-3 text-[var(--muted)]">
              Open quests · {active.length}
            </h2>

            {active.length === 0 ? (
              <p className="font-body bg-[var(--ink)] px-4 py-6 text-sm">
                Nothing open. Add a quest above, or come back tomorrow when the
                repeating ones reset.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {active.map((q) => (
                  <li
                    key={q.id}
                    className="group flex items-center gap-3 bg-[var(--ink)] px-4 py-3"
                  >
                    <button
                      onClick={() => onComplete(q)}
                      disabled={pending}
                      aria-label={`Complete ${q.title}`}
                      className="h-5 w-5 shrink-0 border-2 border-[var(--muted)]/50 transition-colors hover:border-[var(--sage)] hover:bg-[var(--sage)]/30"
                    />
                    <span className="flex-1 text-[var(--cream)]">{q.title}</span>
                    <span className="font-micro hidden text-[var(--muted)] sm:inline">
                      {ATTRIBUTE_LABEL[q.attribute]}
                    </span>
                    <span className="font-micro tabular-nums text-[var(--amber)]">
                      +{Math.floor(BASE_XP[q.difficulty] * mult)}
                    </span>
                    <button
                      onClick={() => onDelete(q)}
                      disabled={pending}
                      aria-label={`Delete ${q.title}`}
                      className="font-micro text-[var(--muted)]/60 opacity-0 transition-opacity hover:text-[var(--rose)] focus-visible:opacity-100 group-hover:opacity-100"
                    >
                      Del
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {doneToday.length > 0 && (
              <>
                <h3 className="font-micro mt-6 mb-3 text-[var(--muted)]">
                  Done today · {doneToday.length}
                </h3>
                <ul className="flex flex-col gap-2 opacity-50">
                  {doneToday.map((q) => (
                    <li
                      key={q.id}
                      className="flex items-center gap-3 bg-[var(--ink)] px-4 py-3"
                    >
                      <span className="h-5 w-5 shrink-0 bg-[var(--sage)]" />
                      <span className="flex-1 text-[var(--cream)] line-through">
                        {q.title}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          {/* ---------------- Attributes ---------------- */}
          <div>
            <h2 className="font-micro mb-3 text-[var(--muted)]">Attributes</h2>
            <ul className="flex flex-col gap-4">
              {attributes.map((a) => {
                const lvl = levelFromXp(a.xp);
                const ap = progress(a.xp);
                return (
                  <li key={a.code}>
                    <div className="font-micro mb-2 flex justify-between">
                      <span className="text-[var(--muted)]">
                        {ATTRIBUTE_LABEL[a.code]}
                      </span>
                      <span className="tabular-nums text-[var(--cream)]">{lvl}</span>
                    </div>
                    <div className="h-1.5 w-full bg-[var(--ink)]">
                      <div
                        className="h-full bg-[var(--steel)] transition-[width] duration-500"
                        style={{ width: `${ap.percent}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* ---------------- Shop ---------------- */}
        <section aria-labelledby="shop-heading">
          <h2 id="shop-heading" className="font-display text-2xl text-[var(--cream)]">
            Buy the light back
          </h2>
          <p className="font-body mt-2 text-sm">
            Gold comes from real work. Tier items change the lighting of the whole
            application, permanently.
          </p>

          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {props.shop.map((item) => {
              const isOwned = owned.has(item.code);
              const level = levelFromXp(profile.total_xp);
              const locked = level < item.min_level;
              const poor = profile.gold < item.cost_gold;
              return (
                <li key={item.code} className="flex flex-col gap-2 bg-[var(--ink)] p-4">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-display text-lg text-[var(--cream)]">
                      {item.name}
                    </span>
                    <span className="font-micro tabular-nums text-[var(--amber)]">
                      {item.cost_gold}g
                    </span>
                  </div>
                  <p className="font-body text-xs">{item.description}</p>
                  <button
                    onClick={() => onBuy(item)}
                    disabled={isOwned || locked || poor || pending}
                    className="pixel-btn-amber mt-auto disabled:cursor-not-allowed disabled:bg-[var(--muted)]/25 disabled:text-[var(--muted)]"
                  >
                    {isOwned
                      ? "Owned"
                      : locked
                        ? `Level ${item.min_level}`
                        : poor
                          ? "Not enough gold"
                          : "Buy"}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        {/* ---------------- History ---------------- */}
        <section aria-labelledby="history-heading">
          <h2 id="history-heading" className="font-micro mb-3 text-[var(--muted)]">
            Chronicle · last {props.completions.length}
          </h2>
          {props.completions.length === 0 ? (
            <p className="font-body text-sm">
              Nothing recorded yet. Your history is stored on the server, so it
              survives a refresh and follows you to any device.
            </p>
          ) : (
            <ul className="flex flex-col">
              {props.completions.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center gap-3 py-2 text-sm text-[var(--muted)]"
                >
                  <span className="font-micro tabular-nums">{c.completed_on}</span>
                  <span className="flex-1 text-[var(--cream)]">{c.title_at_time}</span>
                  <span className="font-micro tabular-nums text-[var(--amber)]">
                    +{c.xp_awarded}xp
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="text-right">
      <p
        className={`font-display text-xl tabular-nums ${
          accent ? "text-[var(--amber)]" : "text-[var(--cream)]"
        }`}
      >
        {value}
      </p>
      <p className="font-micro text-[var(--muted)]">{label}</p>
    </div>
  );
}
