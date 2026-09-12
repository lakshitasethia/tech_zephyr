"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult, PurchaseResult } from "@/lib/game/types";

function friendly(message: string): string {
  if (message.includes("insufficient_gold")) return "Not enough gold yet.";
  if (message.includes("level_too_low")) return "You need a higher level for that.";
  if (message.includes("already_owned")) return "You already own that.";
  if (message.includes("item_not_found")) return "That item is not in the shop.";
  if (message.includes("not_authenticated")) return "Your session expired. Sign in again.";
  return "Something went wrong. Try again.";
}

/** Gold is checked and deducted inside the database, never in the client. */
export async function purchaseItem(
  code: string,
): Promise<ActionResult<PurchaseResult>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "Your session expired. Sign in again." };

    const { data, error } = await supabase.rpc("purchase_item", {
      p_item_code: code,
    });

    if (error) return { ok: false, error: friendly(error.message) };
    revalidatePath("/play");
    return { ok: true, data: data as PurchaseResult };
  } catch (e) {
    return { ok: false, error: friendly(String(e)) };
  }
}
