"use client";

import { useCallback, useSyncExternalStore } from "react";
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
 *
 * The saved preference lives in localStorage, which the server cannot read, so
 * it is pulled through useSyncExternalStore with an explicit server snapshot of
 * "off". That is what keeps the server and client markup identical on the first
 * paint. Reading it in an effect and calling setState would work too, but it
 * causes a second render pass on every mount for a value that never changes.
 */

const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  // Another tab changing the preference should update this one.
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function notify() {
  listeners.forEach((l) => l());
}

export default function AmbiencePicker() {
  const kind = useSyncExternalStore<AmbienceKind>(
    subscribe,
    getSavedAmbience,
    () => "off",
  );

  const choose = useCallback((next: AmbienceKind) => {
    // Runs inside a change event, which is the user gesture the AudioContext
    // needs in order to start.
    setAmbience(next);
    notify();
  }, []);

  return (
    <label className="flex items-center gap-2">
      <span className="sr-only">Background ambience</span>
      <span aria-hidden="true" className="font-micro text-[var(--muted)]">
        {kind === "off" ? "♪" : "♫"}
      </span>
      <select
        id="ambience"
        value={kind}
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
