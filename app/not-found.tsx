import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Nothing here",
  description: "That page does not exist.",
};

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-16">
      <div className="w-full max-w-md">
        <p className="font-micro text-[var(--amber)]">Off the map</p>
        <h1 className="font-display mt-2 text-5xl text-[var(--cream)]">404</h1>
        <p className="font-body mt-3 text-sm">
          There is no quest at this address. The dark goes on for a while in
          this direction.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link href="/" className="pixel-btn-amber">
            Back to the start
          </Link>
          <Link
            href="/play"
            className="font-micro text-[var(--muted)] underline underline-offset-4 hover:text-[var(--cream)]"
          >
            Your quests
          </Link>
        </div>
      </div>
    </main>
  );
}
