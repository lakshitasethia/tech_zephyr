"use client";

import "./marks.css";

interface Props {
  owned: Set<string>;
  streak: number;
}

/**
 * What you own, made visible.
 *
 * Badges and trinkets previously existed only as a row in the inventory table
 * and a button that said "Owned", which meant four of the seven shop items
 * bought you nothing you could see. These are the marks you have earned.
 *
 * The Moth is the one with a condition attached: it circles the lantern only
 * while the streak is alive, so it is a companion you can actually lose.
 */
export default function OwnedMarks({ owned, streak }: Props) {
  const badges = [
    { code: "badge_firstblood", label: "First Light", glyph: "firstlight" },
    { code: "badge_ironweek", label: "Iron Week", glyph: "ironweek" },
    { code: "trinket_quill", label: "Ledger Quill", glyph: "quill" },
  ].filter((b) => owned.has(b.code));

  const hasMoth = owned.has("trinket_moth");
  const mothAwake = hasMoth && streak > 0;

  if (badges.length === 0 && !hasMoth) return null;

  return (
    <div className="mt-2 flex items-center gap-3">
      {badges.length > 0 && (
        <ul className="flex items-center gap-2" aria-label="Earned marks">
          {badges.map((b) => (
            <li key={b.code} className="group relative">
              <span
                className={`mark mark-${b.glyph}`}
                role="img"
                aria-label={b.label}
              />
              <span className="font-micro mark-tip">{b.label}</span>
            </li>
          ))}
        </ul>
      )}

      {hasMoth && (
        <div
          className="relative h-6 w-16"
          title={
            mothAwake
              ? "The Moth circles your lantern"
              : "The Moth has settled. Hold a streak to wake it."
          }
        >
          <span
            className={mothAwake ? "moth moth-awake" : "moth moth-asleep"}
            role="img"
            aria-label={
              mothAwake
                ? "The Moth, circling. Your streak is alive."
                : "The Moth, settled. Your streak has lapsed."
            }
          />
          {!mothAwake && (
            <span className="font-micro absolute left-8 top-1 whitespace-nowrap text-[var(--muted)]/70">
              asleep
            </span>
          )}
        </div>
      )}
    </div>
  );
}
