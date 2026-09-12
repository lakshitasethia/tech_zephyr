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
