/**
 * Client-side mirror of the progression maths in supabase/migrations/0001_init.sql.
 *
 * IMPORTANT: this exists ONLY so the UI can render progress bars and optimistic
 * previews without a round trip. It is never the source of truth. Every value
 * the user actually banks is computed by the database and returned from the
 * complete_quest RPC. If these two ever disagree, the database wins.
 */

export const ATTRIBUTES = ["intellect", "strength", "discipline", "spirit"] as const;
export type AttributeCode = (typeof ATTRIBUTES)[number];

export const DIFFICULTIES = ["trivial", "easy", "normal", "hard", "epic"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const CADENCES = ["once", "daily", "weekly"] as const;
export type Cadence = (typeof CADENCES)[number];

export const ATTRIBUTE_LABEL: Record<AttributeCode, string> = {
  intellect: "Intellect",
  strength: "Strength",
  discipline: "Discipline",
  spirit: "Spirit",
};

export const BASE_XP: Record<Difficulty, number> = {
  trivial: 10,
  easy: 25,
  normal: 50,
  hard: 90,
  epic: 150,
};

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  trivial: "Trivial",
  easy: "Easy",
  normal: "Normal",
  hard: "Hard",
  epic: "Epic",
};

/** Cumulative XP required to reach a level. Mirrors public.xp_for_level(). */
export function xpForLevel(level: number): number {
  const l = Math.max(1, Math.floor(level));
  return 50 * (l - 1) * l;
}

/** Level derived from total XP. Mirrors public.level_from_xp(). */
export function levelFromXp(totalXp: number): number {
  const xp = Math.max(0, totalXp);
  return Math.max(1, Math.floor((50 + Math.sqrt(2500 + 200 * xp)) / 100));
}

/** Momentum multiplier from the current streak. Mirrors public.momentum(). */
export function momentum(streak: number): number {
  const s = Math.min(Math.max(streak, 0), 10);
  return Math.round((1 + s * 0.05) * 100) / 100;
}

/** Everything the XP bar needs, derived from a single total. */
export function progress(totalXp: number) {
  const level = levelFromXp(totalXp);
  const floor = xpForLevel(level);
  const ceiling = xpForLevel(level + 1);
  const into = totalXp - floor;
  const span = ceiling - floor;
  return {
    level,
    into,
    span,
    remaining: span - into,
    percent: span > 0 ? Math.min(100, (into / span) * 100) : 0,
  };
}

/** Theme tiers. Buying light back is the core progression loop. */
export const TIERS = [
  { tier: 0, name: "Cold Start", blurb: "One weak lamp. Almost no colour." },
  { tier: 1, name: "Lamplight", blurb: "Amber returns. The ink deepens." },
  { tier: 2, name: "Bloom", blurb: "Sage and rose. Embers drift." },
  { tier: 3, name: "Ascendant", blurb: "Full warmth and gold leaf." },
] as const;
