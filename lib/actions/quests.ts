"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ATTRIBUTES, CADENCES, DIFFICULTIES } from "@/lib/game/rules";
import type { ActionResult, CompleteQuestResult, Quest } from "@/lib/game/types";

/**
 * Validation runs on the server, not just in the form. An empty title, a
 * 10,000 character title, or a bogus difficulty are all rejected here even if
 * the client is bypassed entirely.
 */
const questInput = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Give the quest a name.")
    .max(140, "Keep the name under 140 characters."),
  notes: z.string().trim().max(2000, "Notes are too long.").optional().nullable(),
  attribute: z.enum(ATTRIBUTES),
  difficulty: z.enum(DIFFICULTIES),
  cadence: z.enum(CADENCES),
  due_at: z.string().datetime({ offset: true }).nullable().optional(),
});

/** Turns raw Postgres errors into something a person can act on. */
function friendly(message: string): string {
  const map: Record<string, string> = {
    not_authenticated: "Your session expired. Sign in again.",
    profile_missing: "We could not find your character. Try signing out and back in.",
    quest_not_found: "That quest no longer exists.",
    quest_archived: "That quest is archived. Restore it first.",
    already_completed: "You already finished that one.",
    already_completed_today: "Already done today. It comes back tomorrow.",
    insufficient_gold: "Not enough gold yet.",
    level_too_low: "You need a higher level for that.",
    already_owned: "You already own that.",
    item_not_found: "That item is not in the shop.",
  };
  for (const key of Object.keys(map)) {
    if (message.includes(key)) return map[key];
  }
  return "Something went wrong. Try again.";
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("not_authenticated");
  return { supabase, user };
}

export async function createQuest(
  input: unknown,
): Promise<ActionResult<Quest>> {
  const parsed = questInput.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid quest." };
  }

  try {
    const { supabase, user } = await requireUser();
    const { data, error } = await supabase
      .from("quests")
      .insert({ ...parsed.data, user_id: user.id })
      .select()
      .single();

    if (error) return { ok: false, error: friendly(error.message) };
    revalidatePath("/play");
    return { ok: true, data: data as Quest };
  } catch (e) {
    return { ok: false, error: friendly(String(e)) };
  }
}

export async function updateQuest(
  id: string,
  input: unknown,
): Promise<ActionResult<Quest>> {
  const parsed = questInput.partial().safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid quest." };
  }

  try {
    const { supabase } = await requireUser();
    // No user_id filter needed: RLS restricts this to the caller's own rows.
    const { data, error } = await supabase
      .from("quests")
      .update({ ...parsed.data, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) return { ok: false, error: friendly(error.message) };
    revalidatePath("/play");
    return { ok: true, data: data as Quest };
  } catch (e) {
    return { ok: false, error: friendly(String(e)) };
  }
}

export async function deleteQuest(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireUser();
    const { error } = await supabase.from("quests").delete().eq("id", id);
    if (error) return { ok: false, error: friendly(error.message) };
    revalidatePath("/play");
    return { ok: true, data: undefined };
  } catch (e) {
    return { ok: false, error: friendly(String(e)) };
  }
}

/**
 * The only way XP enters the system. The client sends an id and nothing else.
 * Rewards, streak and level are all computed inside the database function.
 */
export async function completeQuest(
  id: string,
  source: "manual" | "timer" = "manual",
): Promise<ActionResult<CompleteQuestResult>> {
  try {
    const { supabase } = await requireUser();
    const { data, error } = await supabase.rpc("complete_quest", {
      p_quest_id: id,
      p_source: source,
    });

    if (error) return { ok: false, error: friendly(error.message) };
    revalidatePath("/play");
    return { ok: true, data: data as CompleteQuestResult };
  } catch (e) {
    return { ok: false, error: friendly(String(e)) };
  }
}
