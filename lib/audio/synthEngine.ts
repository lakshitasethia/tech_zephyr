"use client";

/**
 * Minimal Web Audio synthesizer for the intro sequence.
 * All sounds are generated, no audio files.
 * AudioContext is created lazily on first user gesture.
 * Everything wrapped in try/catch so audio never breaks the page.
 */

let _ctx: AudioContext | null = null;
let _masterGain: GainNode | null = null;

function getMuteKey(): string {
  return "liferpg_audio_muted";
}

export function isMuted(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(getMuteKey()) === "true";
}

export function setMuted(val: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(getMuteKey(), val ? "true" : "false");
  if (_masterGain) {
    _masterGain.gain.value = val ? 0 : 0.15;
  }
}

export function toggleMute(): boolean {
  const newVal = !isMuted();
  setMuted(newVal);
  return newVal;
}

/** Initialize AudioContext - call only after a user gesture */
export function initAudio(): boolean {
  if (_ctx) return true;
  try {
    _ctx = new AudioContext();
    _masterGain = _ctx.createGain();
    _masterGain.gain.value = isMuted() ? 0 : 0.15;
    _masterGain.connect(_ctx.destination);
    return true;
  } catch {
    _ctx = null;
    _masterGain = null;
    return false;
  }
}

/** Per-character typewriter blip: short square/triangle, 900-1400Hz, 8-14ms */
export function playTypeBlip(): void {
  if (!_ctx || !_masterGain) return;
  try {
    const osc = _ctx.createOscillator();
    const gain = _ctx.createGain();
    osc.type = Math.random() > 0.5 ? "square" : "triangle";
    osc.frequency.value = 900 + Math.random() * 500;
    const dur = 0.008 + Math.random() * 0.006;
    gain.gain.setValueAtTime(0.08, _ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, _ctx.currentTime + dur);
    osc.connect(gain);
    gain.connect(_masterGain);
    osc.start(_ctx.currentTime);
    osc.stop(_ctx.currentTime + dur + 0.01);
  } catch {}
}

/** Slightly lower, longer thunk for spaces and line ends */
export function playThunk(): void {
  if (!_ctx || !_masterGain) return;
  try {
    const osc = _ctx.createOscillator();
    const gain = _ctx.createGain();
    osc.type = "triangle";
    osc.frequency.value = 400 + Math.random() * 200;
    const dur = 0.025;
    gain.gain.setValueAtTime(0.12, _ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, _ctx.currentTime + dur);
    osc.connect(gain);
    gain.connect(_masterGain);
    osc.start(_ctx.currentTime);
    osc.stop(_ctx.currentTime + dur + 0.01);
  } catch {}
}

