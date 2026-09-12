"use client";

/**
 * Background ambience, fully synthesized.
 *
 * No audio files. A decent lofi loop is one to three megabytes, which costs
 * load time, and any real track carries a licensing question on a submitted
 * project. Rain, fire and wind are all just filtered noise, so they cost a
 * couple of kilobytes of code, loop forever without a seam, and are ours.
 *
 * Everything is wrapped in try/catch. Audio must never break the page.
 */

export type AmbienceKind = "off" | "rain" | "fire" | "wind";

export const AMBIENCE_OPTIONS: { value: AmbienceKind; label: string }[] = [
  { value: "off", label: "Silence" },
  { value: "rain", label: "Rain" },
  { value: "fire", label: "Fireplace" },
  { value: "wind", label: "Night wind" },
];

const STORAGE_KEY = "liferpg_ambience";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let active: { stop: () => void } | null = null;
let current: AmbienceKind = "off";

/** One shared looping noise buffer. Regenerating it per layer is wasteful. */
let noiseBuffer: AudioBuffer | null = null;

function getNoise(context: AudioContext): AudioBuffer {
  if (noiseBuffer) return noiseBuffer;
  const seconds = 4;
  const buffer = context.createBuffer(
    1,
    context.sampleRate * seconds,
    context.sampleRate,
  );
  const data = buffer.getChannelData(0);
  // Brown-ish noise. White noise alone sounds like static; integrating it
  // rolls off the high end and reads as weather rather than interference.
  let last = 0;
  for (let i = 0; i < data.length; i++) {
    const white = Math.random() * 2 - 1;
    last = (last + 0.02 * white) / 1.02;
    data[i] = last * 3.5;
  }
  noiseBuffer = buffer;
  return buffer;
}

function ensureContext(): boolean {
  if (ctx) return true;
  try {
    ctx = new AudioContext();
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    return true;
  } catch {
    ctx = null;
    master = null;
    return false;
  }
}

function noiseSource(context: AudioContext): AudioBufferSourceNode {
  const src = context.createBufferSource();
  src.buffer = getNoise(context);
  src.loop = true;
  return src;
}

/** Steady hiss with a slow swell, plus occasional brighter drops. */
function buildRain(context: AudioContext, out: GainNode) {
  const src = noiseSource(context);
  const band = context.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.value = 1400;
  band.Q.value = 0.6;

  const hiss = context.createGain();
  hiss.gain.value = 0.55;

  // Slow amplitude drift so it never sits perfectly still.
  const lfo = context.createOscillator();
  const lfoGain = context.createGain();
  lfo.frequency.value = 0.08;
  lfoGain.gain.value = 0.12;
  lfo.connect(lfoGain).connect(hiss.gain);

  src.connect(band).connect(hiss).connect(out);
  src.start();
  lfo.start();

  return () => {
    try {
      src.stop();
      lfo.stop();
    } catch {}
  };
}

/** Low rumble plus irregular crackles. */
function buildFire(context: AudioContext, out: GainNode) {
  const src = noiseSource(context);
  const low = context.createBiquadFilter();
  low.type = "lowpass";
  low.frequency.value = 420;

  const body = context.createGain();
  body.gain.value = 0.7;
  src.connect(low).connect(body).connect(out);
  src.start();

  // Crackles: very short filtered bursts at random intervals.
  let stopped = false;
  const crackle = () => {
    if (stopped || !ctx) return;
    try {
      const burst = context.createBufferSource();
      burst.buffer = getNoise(context);
      const bp = context.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = 1200 + Math.random() * 2200;
      bp.Q.value = 3;
      const g = context.createGain();
      const now = context.currentTime;
      const peak = 0.25 + Math.random() * 0.5;
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(peak, now + 0.004);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.05 + Math.random() * 0.08);
      burst.connect(bp).connect(g).connect(out);
      burst.start(now);
      burst.stop(now + 0.2);
    } catch {}
    window.setTimeout(crackle, 120 + Math.random() * 900);
  };
  window.setTimeout(crackle, 300);

  return () => {
    stopped = true;
    try {
      src.stop();
    } catch {}
  };
}

/** Deep moving air, filter sweeping slowly. */
function buildWind(context: AudioContext, out: GainNode) {
  const src = noiseSource(context);
  const lp = context.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 500;
  lp.Q.value = 2;

  const body = context.createGain();
  body.gain.value = 0.8;

  const sweep = context.createOscillator();
  const sweepGain = context.createGain();
  sweep.frequency.value = 0.05;
  sweepGain.gain.value = 260;
  sweep.connect(sweepGain).connect(lp.frequency);

  src.connect(lp).connect(body).connect(out);
  src.start();
  sweep.start();

  return () => {
    try {
      src.stop();
      sweep.stop();
    } catch {}
  };
}

export function getSavedAmbience(): AmbienceKind {
  if (typeof window === "undefined") return "off";
  try {
    const v = localStorage.getItem(STORAGE_KEY) as AmbienceKind | null;
    return v && ["off", "rain", "fire", "wind"].includes(v) ? v : "off";
  } catch {
    return "off";
  }
}

/**
 * Switch ambience. Must be called from a user gesture the first time, or the
 * browser will refuse to start the AudioContext.
 */
export function setAmbience(kind: AmbienceKind): void {
  try {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, kind);
    } catch {}

    if (kind === current && active) return;
    current = kind;

    if (!ensureContext() || !ctx || !master) return;
    if (ctx.state === "suspended") void ctx.resume();

    // Fade the old layer out rather than cutting it.
    if (active) {
      const dying = active;
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(master.gain.value, now);
      master.gain.linearRampToValueAtTime(0, now + 0.4);
      window.setTimeout(() => dying.stop(), 450);
      active = null;
    }

    if (kind === "off") return;

    window.setTimeout(() => {
      if (!ctx || !master || current !== kind) return;
      const builder =
        kind === "rain" ? buildRain : kind === "fire" ? buildFire : buildWind;
      const stop = builder(ctx, master);
      active = { stop };
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(0, now);
      // Deliberately low. This sits under the work, it is not the point.
      master.gain.linearRampToValueAtTime(0.16, now + 1.2);
    }, active ? 460 : 0);
  } catch {
    // Ambience is a nicety. Never let it surface as an error.
  }
}

/** Short, quiet key click for the quest input. Throttled by the caller. */
export function playKeyTick(): void {
  try {
    if (!ensureContext() || !ctx || !master) return;
    if (ctx.state === "suspended") void ctx.resume();
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = Math.random() > 0.5 ? "square" : "triangle";
    osc.frequency.value = 1100 + Math.random() * 600;
    const now = ctx.currentTime;
    const dur = 0.006 + Math.random() * 0.005;
    g.gain.setValueAtTime(0.05, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    osc.connect(g);
    // Straight to destination: the ambience master is faded independently.
    g.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + dur + 0.01);
  } catch {}
}

/* ---------------------------------------------------------------------------
 * Event cues.
 *
 * Four distinct sounds so the ear can tell what happened without looking:
 * a light confirm on add, a short triumph on completion, a real fanfare on
 * level up, and a warm unlock on a purchase. All synthesized, all sharing the
 * ambience AudioContext so we are not holding two of them open.
 * ------------------------------------------------------------------------ */

/** Respects the same mute switch as the intro audio. */
function cuesMuted(): boolean {
  try {
    return localStorage.getItem("liferpg_audio_muted") === "true";
  } catch {
    return false;
  }
}

interface ToneOpts {
  freq: number;
  at: number;
  dur: number;
  peak?: number;
  type?: OscillatorType;
  glideTo?: number;
}

function tone(context: AudioContext, dest: AudioNode, o: ToneOpts) {
  const osc = context.createOscillator();
  const g = context.createGain();
  osc.type = o.type ?? "triangle";
  osc.frequency.setValueAtTime(o.freq, o.at);
  if (o.glideTo) {
    osc.frequency.exponentialRampToValueAtTime(o.glideTo, o.at + o.dur);
  }
  const peak = o.peak ?? 0.18;
  // Tiny attack rather than an instant start, which clicks.
  g.gain.setValueAtTime(0.0001, o.at);
  g.gain.exponentialRampToValueAtTime(peak, o.at + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, o.at + o.dur);
  osc.connect(g).connect(dest);
  osc.start(o.at);
  osc.stop(o.at + o.dur + 0.03);
}

/** Shared setup for every cue. Returns null when audio is unavailable. */
function cueBus(): { context: AudioContext; bus: GainNode; now: number } | null {
  try {
    if (cuesMuted()) return null;
    if (!ensureContext() || !ctx) return null;
    if (ctx.state === "suspended") void ctx.resume();
    const bus = ctx.createGain();
    bus.gain.value = 0.5;
    bus.connect(ctx.destination);
    return { context: ctx, bus, now: ctx.currentTime };
  } catch {
    return null;
  }
}

/** Quest added: a light two note confirm. Deliberately small. */
export function playAddQuest(): void {
  const b = cueBus();
  if (!b) return;
  try {
    tone(b.context, b.bus, { freq: 587.33, at: b.now, dur: 0.075, peak: 0.14 });
    tone(b.context, b.bus, { freq: 880.0, at: b.now + 0.07, dur: 0.11, peak: 0.13 });
  } catch {}
}

/** Quest completed: a short rising triumph. */
export function playComplete(): void {
  const b = cueBus();
  if (!b) return;
  try {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((f, i) =>
      tone(b.context, b.bus, {
        freq: f,
        at: b.now + i * 0.062,
        dur: 0.2,
        peak: 0.17,
        type: i === notes.length - 1 ? "sine" : "triangle",
      }),
    );
    // A little shine on top of the final note.
    tone(b.context, b.bus, {
      freq: 2093,
      at: b.now + 0.19,
      dur: 0.3,
      peak: 0.05,
      type: "sine",
    });
  } catch {}
}

/** Level up: a real fanfare with a pad underneath. The biggest moment. */
export function playLevelUp(): void {
  const b = cueBus();
  if (!b) return;
  try {
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    notes.forEach((f, i) =>
      tone(b.context, b.bus, {
        freq: f,
        at: b.now + i * 0.085,
        dur: 0.34,
        peak: 0.2,
        type: "triangle",
      }),
    );
    // Sustained fifth underneath so it lands rather than just chirps.
    tone(b.context, b.bus, {
      freq: 261.63,
      at: b.now,
      dur: 1.25,
      peak: 0.12,
      type: "sine",
    });
    tone(b.context, b.bus, {
      freq: 392.0,
      at: b.now + 0.04,
      dur: 1.2,
      peak: 0.09,
      type: "sine",
    });
    tone(b.context, b.bus, {
      freq: 2093,
      at: b.now + 0.42,
      dur: 0.55,
      peak: 0.06,
      type: "sine",
    });
  } catch {}
}

/** Purchase: a warm unlock. Low swell, then the light arrives. */
export function playPurchase(): void {
  const b = cueBus();
  if (!b) return;
  try {
    tone(b.context, b.bus, {
      freq: 174.61,
      at: b.now,
      dur: 0.42,
      peak: 0.16,
      type: "sine",
      glideTo: 261.63,
    });
    tone(b.context, b.bus, {
      freq: 698.46,
      at: b.now + 0.16,
      dur: 0.45,
      peak: 0.14,
      type: "triangle",
    });
    tone(b.context, b.bus, {
      freq: 1046.5,
      at: b.now + 0.26,
      dur: 0.55,
      peak: 0.1,
      type: "sine",
    });
    tone(b.context, b.bus, {
      freq: 1567.98,
      at: b.now + 0.36,
      dur: 0.6,
      peak: 0.06,
      type: "sine",
    });
  } catch {}
}
