"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { signIn, signUp } from "@/lib/actions/auth";

interface Props {
  mode: "login" | "signup";
}

export default function AuthForm({ mode }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const isSignup = mode === "signup";

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const action = isSignup ? signUp : signIn;
      const result = await action(formData);
      // A successful action redirects, so anything returned here is a failure.
      if (result && !result.ok) setError(result.error);
    });
  }

  return (
    <div className="w-full max-w-sm">
      <p className="font-micro text-[var(--amber)]">
        {isSignup ? "Chapter One" : "Welcome back"}
      </p>
      <h1 className="font-display mt-2 text-4xl text-[var(--cream)]">
        {isSignup ? "Name your wanderer" : "Pick up the lantern"}
      </h1>
      <p className="font-body mt-3 text-sm">
        {isSignup
          ? "Your world starts dark. Finish real quests, earn gold, and buy the light back."
          : "Your quests, your streak and your gold are waiting exactly where you left them."}
      </p>

      <form action={onSubmit} className="mt-8 flex flex-col gap-4" noValidate>
        {isSignup && (
          <label className="flex flex-col gap-2">
            <span className="font-micro text-[var(--muted)]">Name</span>
            <input
              id="display_name"
              name="display_name"
              type="text"
              required
              maxLength={40}
              autoComplete="nickname"
              placeholder="Wanderer"
              className="bg-[var(--ink)] px-4 py-3 text-[var(--cream)] outline-none placeholder:text-[var(--muted)]/50"
            />
          </label>
        )}

        <label className="flex flex-col gap-2">
          <span className="font-micro text-[var(--muted)]">Email</span>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className="bg-[var(--ink)] px-4 py-3 text-[var(--cream)] outline-none placeholder:text-[var(--muted)]/50"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="font-micro text-[var(--muted)]">Password</span>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete={isSignup ? "new-password" : "current-password"}
            placeholder="At least 8 characters"
            className="bg-[var(--ink)] px-4 py-3 text-[var(--cream)] outline-none placeholder:text-[var(--muted)]/50"
          />
        </label>

        {error && (
          <p
            role="alert"
            className="bg-[var(--rose)]/15 px-3 py-2 text-sm text-[var(--rose)]"
          >
            {error}
          </p>
        )}

        <button type="submit" disabled={pending} className="pixel-btn-amber mt-2">
          {pending ? "Working" : isSignup ? "Begin" : "Enter"}
        </button>
      </form>

      <p className="font-body mt-6 text-sm">
        {isSignup ? "Already have a character? " : "No character yet? "}
        <Link
          href={isSignup ? "/login" : "/signup"}
          className="text-[var(--amber)] underline underline-offset-4"
        >
          {isSignup ? "Sign in" : "Create one"}
        </Link>
      </p>
    </div>
  );
}
