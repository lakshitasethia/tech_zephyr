"use client";

import { useEffect, useState } from "react";
import {
  AMBIENCE_OPTIONS,
  getSavedAmbience,
  setAmbience,
  type AmbienceKind,
} from "@/lib/audio/ambience";

/**
 * Background ambience control.
 *
 * Deliberately defaults to silence and never auto-starts. Browsers block audio
 * before a gesture anyway, but more importantly nobody wants a productivity app
 * making noise at them uninvited. The choice is remembered, so a returning user
 * who wants rain gets rain on their next click.
 */
export default function AmbiencePicker() {
  const [kind, setKind] = useState<AmbienceKind>("off");
  const [restored, setRestored] = useState(false);

  // Read the saved preference after mount. Reading localStorage during render
  // would mismatch the server rendered markup.
  useEffect(() => {
    setKind(getSavedAmbience());
    setRestored(true);
  }, []);

  function choose(next: AmbienceKind) {
    setKind(next);
    // This runs inside a change event, which counts as the user gesture the
    // AudioContext needs.
    setAmbience(next);
  }

  return (
    <label className="flex items-center gap-2">
      <span className="sr-only">Background ambience</span>
      <span aria-hidden="true" className="font-micro text-[var(--muted)]">
        {kind === "off" ? "♪" : "♫"}
      </span>
      <select
        id="ambience"
        value={restored ? kind : "off"}
        onChange={(e) => choose(e.target.value as AmbienceKind)}
        className="font-micro cursor-pointer bg-transparent text-[var(--muted)] outline-none hover:text-[var(--cream)]"
      >
        {AMBIENCE_OPTIONS.map((o) => (
          <option key={o.value} value={o.value} className="bg-[var(--ink)]">
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
