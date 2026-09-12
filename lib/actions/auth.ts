"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/game/types";

const credentials = z.object({
  email: z.string().trim().toLowerCase().email("That does not look like an email."),
  password: z.string().min(8, "Use at least 8 characters."),
});

const signUpInput = credentials.extend({
  display_name: z
    .string()
    .trim()
    .min(1, "Pick a name.")
    .max(40, "Keep it under 40 characters."),
});

function friendlyAuth(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "Wrong email or password.";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "That email already has an account. Sign in instead.";
  if (m.includes("email address") && m.includes("invalid"))
    return "That email address is not accepted. Use a real domain such as gmail.com.";
  if (m.includes("email not confirmed"))
    return "Check your inbox and confirm your email first.";
  if (m.includes("email rate limit") || m.includes("rate limit"))
    return "Too many attempts. Wait a minute and try again.";
  if (m.includes("weak password") || m.includes("password should be"))
    return "That password is too weak. Use at least 8 characters.";
  if (m.includes("fetch failed") || m.includes("network"))
    return "Could not reach the server. Check your connection and try again.";
  return "We could not sign you in. Try again.";
}

export async function signUp(formData: FormData): Promise<ActionResult> {
  const parsed = signUpInput.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    display_name: formData.get("display_name"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Check your details." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { display_name: parsed.data.display_name } },
  });

  if (error) return { ok: false, error: friendlyAuth(error.message) };
  redirect("/play");
}

export async function signIn(formData: FormData): Promise<ActionResult> {
  const parsed = credentials.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Check your details." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) return { ok: false, error: friendlyAuth(error.message) };
  redirect("/play");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
