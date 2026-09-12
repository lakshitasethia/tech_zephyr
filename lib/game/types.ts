import type { AttributeCode, Cadence, Difficulty } from "./rules";

export type QuestStatus = "active" | "done" | "archived";

export interface Profile {
  id: string;
  display_name: string;
  total_xp: number;
  gold: number;
  theme_tier: number;
  streak_current: number;
  streak_longest: number;
  last_active_on: string | null;
  created_at: string;
}

export interface Attribute {
  user_id: string;
  code: AttributeCode;
  xp: number;
}

export interface Quest {
  id: string;
  user_id: string;
  title: string;
  notes: string | null;
  attribute: AttributeCode;
  difficulty: Difficulty;
  status: QuestStatus;
  cadence: Cadence;
  due_at: string | null;
  last_done_on: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuestCompletion {
  id: string;
  user_id: string;
  quest_id: string | null;
  title_at_time: string;
  attribute: AttributeCode;
  difficulty: Difficulty;
  xp_awarded: number;
  gold_awarded: number;
  multiplier: number;
  source: "manual" | "timer";
  completed_on: string;
  completed_at: string;
}

export interface GameEvent {
  id: string;
  user_id: string;
  kind: string;
  payload: Record<string, unknown>;
  created_at: string;
}

export interface ShopItem {
  code: string;
  name: string;
  description: string;
  kind: "theme" | "badge" | "trinket";
  cost_gold: number;
  grants_tier: number | null;
  min_level: number;
  sort_order: number;
}

/** Shape returned by the complete_quest RPC. */
export interface CompleteQuestResult {
  xp_awarded: number;
  gold_awarded: number;
  multiplier: number;
  total_xp: number;
  gold: number;
  level_before: number;
  level_after: number;
  levelled_up: boolean;
  streak: number;
  attribute: AttributeCode;
}

/** Shape returned by the purchase_item RPC. */
export interface PurchaseResult {
  item: string;
  name: string;
  gold: number;
  theme_tier: number;
}

/** Uniform result for every server action, so the UI can branch on `ok`. */
export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };
