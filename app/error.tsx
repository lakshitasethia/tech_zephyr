"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Route level error boundary.
 *
 * The brief treats "unhandled runtime exceptions or blank-screen crashes"
 * as a disqualification, so no thrown error may ever reach the user as a
 * white page. This catches anything inside the route and offers a way out.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Kept so the failure is visible in production logs rather than silent.
    console.error("Route error:", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-16">
      <div className="w-full max-w-md">
        <p className="font-micro text-[var(--rose)]">The lantern guttered</p>
        <h1 className="font-display mt-2 text-4xl text-[var(--cream)]">
          Something went wrong
        </h1>
        <p className="font-body mt-3 text-sm">
          Your quests and progress are safe on the server. Nothing was lost.
          Try again, and if it keeps happening, sign in once more.
        </p>

        {error.digest && (
          <p className="font-micro mt-4 text-[var(--muted)]">
            Reference: {error.digest}
          </p>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <button onClick={reset} className="pixel-btn-amber">
            Try again
          </button>
          <Link
            href="/play"
            className="font-micro text-[var(--muted)] underline underline-offset-4 hover:text-[var(--cream)]"
          >
            Back to your quests
          </Link>
        </div>
      </div>
    </main>
  );
}
