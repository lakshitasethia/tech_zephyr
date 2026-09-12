import { createClient } from "@/lib/supabase/server";
import type {
  Attribute,
  GameEvent,
  Profile,
  Quest,
  QuestCompletion,
  ShopItem,
} from "./types";

/**
 * Every read below relies on RLS for scoping rather than a `.eq("user_id", ...)`
 * filter. If the policy is ever wrong the query returns nothing, rather than
 * silently returning someone else's data.
 *
 * The dashboard needs six of these, so they are fetched in one Promise.all
 * rather than sequentially. Six round trips in series is the classic reason a
 * server rendered page feels slow.
 */
export async function getDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [profile, attributes, quests, completions, inventory, shop] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("attributes").select("*").order("code"),
      supabase
        .from("quests")
        .select("*")
        .neq("status", "archived")
        .order("created_at", { ascending: false }),
      supabase
        .from("quest_completions")
        .select("*")
        .order("completed_at", { ascending: false })
        .limit(30),
      supabase.from("inventory").select("item_code"),
      supabase.from("shop_items").select("*").order("sort_order"),
    ]);

  if (profile.error || !profile.data) return null;

  return {
    user,
    profile: profile.data as Profile,
    attributes: (attributes.data ?? []) as Attribute[],
    quests: (quests.data ?? []) as Quest[],
    completions: (completions.data ?? []) as QuestCompletion[],
    owned: new Set((inventory.data ?? []).map((r) => r.item_code as string)),
    shop: (shop.data ?? []) as ShopItem[],
  };
}

export type Dashboard = NonNullable<Awaited<ReturnType<typeof getDashboard>>>;

/** Recent narrative events, used by the chronicle panel. */
export async function getEvents(limit = 20): Promise<GameEvent[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as GameEvent[];
}
