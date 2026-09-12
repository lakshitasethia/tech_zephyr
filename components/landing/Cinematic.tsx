"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { EmberCanvas } from "@/components/canvas/EmberCanvas";
import {
  initAudio,
  playTypeBlip,
  playThunk,
  playDropThunk,
  playFilamentHum,
  isMuted,
  toggleMute,
} from "@/lib/audio/synthEngine";

interface CinematicProps {
  onComplete: () => void;
}

type Stage = "typewriter" | "bulb" | "handoff" | "done";

const LINE_1 = "> THE LANTERN WENT OUT SOME TIME AGO.";
const LINE_2 = "> NOBODY IS COMING TO RELIGHT IT.";

export const Cinematic: React.FC<CinematicProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<Stage>("typewriter");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [caretVisible, setCaretVisible] = useState(true);
  const [bulbY, setBulbY] = useState(-120); // offscreen above
  const [bulbRotation, setBulbRotation] = useState(0);
  const [filamentLit, setFilamentLit] = useState(false);
  const [lightRadius, setLightRadius] = useState(0);
  const [clipProgress, setClipProgress] = useState(0); // 0-1 for handoff wipe
  const [audioMuted, setAudioMuted] = useState(true);

  const timerRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const rafRef = useRef<number>(0);
  const skippedRef = useRef(false);

  const clearTimers = useCallback(() => {
    timerRef.current.forEach(clearTimeout);
    timerRef.current = [];
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  const finish = useCallback(() => {
    if (skippedRef.current) return;
    skippedRef.current = true;
    clearTimers();
    if (typeof window !== "undefined") {
      sessionStorage.setItem("liferpg_cinematic_seen", "true");
    }
    setStage("done");
    onComplete();
  }, [clearTimers, onComplete]);

  const handleSkip = useCallback(() => {
    finish();
  }, [finish]);

  // Initialize audio on component mount (user already clicked in Preloader)
  useEffect(() => {
    initAudio();
    setAudioMuted(isMuted());
  }, []);

  // Caret blink
  useEffect(() => {
    if (stage !== "typewriter") return;
    const interval = setInterval(() => setCaretVisible((v) => !v), 530);
    return () => clearInterval(interval);
  }, [stage]);

  // Handle key/click skip
  useEffect(() => {
    const handler = (e: Event) => {
      // Ignore mute button clicks
      if ((e.target as HTMLElement)?.closest?.("[data-mute-btn]")) return;
      if ((e.target as HTMLElement)?.closest?.("[data-skip-btn]")) {
        finish();
        return;
      }
      finish();
    };

    window.addEventListener("keydown", handler, { once: true });
    // Don't add click to skip - the skip button handles it
    return () => window.removeEventListener("keydown", handler);
  }, [finish]);

  // Reduced motion check
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check sessionStorage
    if (sessionStorage.getItem("liferpg_cinematic_seen") === "true") {
      finish();
      return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      // Show both lines at once, hold 600ms, then finish
      setLine1(LINE_1);
      setLine2(LINE_2);
      const t = setTimeout(() => finish(), 600);
      timerRef.current.push(t);
      return;
    }

    // Start the full sequence
    runTypewriter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runTypewriter = () => {
    let charIdx = 0;
    const fullLine1 = LINE_1;
    const fullLine2 = LINE_2;
    const totalChars = fullLine1.length + fullLine2.length;
    let currentLine = 1;
    let lineCharIdx = 0;

    const typeNext = () => {
      if (skippedRef.current) return;

      if (charIdx >= totalChars) {
        // Pause, then move to bulb stage
        const t = setTimeout(() => {
          if (!skippedRef.current) setStage("bulb");
        }, 400);
        timerRef.current.push(t);
        return;
      }

      if (currentLine === 1) {
        if (lineCharIdx < fullLine1.length) {
          const char = fullLine1[lineCharIdx];
          setLine1(fullLine1.slice(0, lineCharIdx + 1));
          lineCharIdx++;
          charIdx++;

          // Play audio
          if (char === " " || lineCharIdx === fullLine1.length) {
            playThunk();
          } else {
            playTypeBlip();
          }

          const jitter = 22 + Math.random() * 12;
          const t = setTimeout(typeNext, jitter);
          timerRef.current.push(t);
        } else {
          // Pause between lines
          currentLine = 2;
          lineCharIdx = 0;
          const t = setTimeout(typeNext, 350);
          timerRef.current.push(t);
        }
      } else {
        if (lineCharIdx < fullLine2.length) {
          const char = fullLine2[lineCharIdx];
          setLine2(fullLine2.slice(0, lineCharIdx + 1));
          lineCharIdx++;
          charIdx++;

          if (char === " " || lineCharIdx === fullLine2.length) {
            playThunk();
          } else {
            playTypeBlip();
          }

          const jitter = 22 + Math.random() * 12;
          const t = setTimeout(typeNext, jitter);
          timerRef.current.push(t);
        } else {
          // Done typing
          const t = setTimeout(() => {
            if (!skippedRef.current) setStage("bulb");
          }, 400);
          timerRef.current.push(t);
        }
      }
    };

    // Start typing after a small initial pause
    const t = setTimeout(typeNext, 300);
    timerRef.current.push(t);
  };

  // Bulb drop + pendulum swing sequence
  useEffect(() => {
    if (stage !== "bulb" || skippedRef.current) return;

    playDropThunk();

    // Animate bulb drop: fast fall from -120 to 0
    let frame = 0;
    const dropFrames = 18;
    const swingFrames = [25, -18, 12, -7, 4, -2, 1, 0]; // Decaying oscillation in degrees
    let swingIdx = 0;
    let swingFrame = 0;
    const framesPerSwing = 14;
    let flickerDone = false;

    const animate = () => {
      if (skippedRef.current) return;

      if (frame < dropFrames) {
        // Drop phase - ease in
        const t = frame / dropFrames;
        const eased = t * t * (3 - 2 * t); // smoothstep
        const overshoot = eased > 0.85 ? Math.sin((eased - 0.85) * 20) * 8 : 0;
        setBulbY(-120 + (120 + overshoot) * eased);
        frame++;
        rafRef.current = requestAnimationFrame(animate);
      } else if (swingIdx < swingFrames.length) {
        // Swing phase
        const targetAngle = swingFrames[swingIdx];
        const prevAngle = swingIdx > 0 ? swingFrames[swingIdx - 1] : 0;
        const t = swingFrame / framesPerSwing;
        const angle = prevAngle + (targetAngle - prevAngle) * t;
        setBulbRotation(angle);

        // Flicker on the second swing (swingIdx === 1)
        if (swingIdx === 1 && !flickerDone) {
          if (swingFrame === 4) setFilamentLit(true);
          if (swingFrame === 6) setFilamentLit(false);
          if (swingFrame === 8) setFilamentLit(true);
          if (swingFrame === 10) {
            setFilamentLit(true);
            flickerDone = true;
            playFilamentHum(2.0);
          }
        }

        swingFrame++;
        if (swingFrame >= framesPerSwing) {
          swingFrame = 0;
          swingIdx++;
        }
        rafRef.current = requestAnimationFrame(animate);
      } else {
        // Swing done - expand light and transition to handoff
        setFilamentLit(true);
        let lightFrame = 0;
        const lightFrames = 40;

        const expandLight = () => {
          if (skippedRef.current) return;
          lightFrame++;
          const progress = lightFrame / lightFrames;
          setLightRadius(progress);

          if (progress >= 0.7) {
            setStage("handoff");
          }

          if (lightFrame < lightFrames) {
            rafRef.current = requestAnimationFrame(expandLight);
          } else {
            // Handoff complete
            const t = setTimeout(() => finish(), 200);
            timerRef.current.push(t);
          }
        };

        rafRef.current = requestAnimationFrame(expandLight);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  if (stage === "done") return null;

  const handleMuteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newMuted = toggleMute();
    setAudioMuted(newMuted);
  };

  return (
    <div
      id="cinematic-layer"
      role="region"
      aria-label="Opening Cinematic"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden select-none"
      style={{
        backgroundColor: "var(--void)",
        clipPath:
          stage === "handoff"
            ? `circle(${100 + clipProgress * 100}% at 50% 40%)`
            : undefined,
      }}
    >
      {/* Vignette */}
      <div
        className="pointer-events-none absolute inset-0 z-20"
        style={{
          background: "radial-gradient(circle at center, transparent 30%, #06070B 90%)",
        }}
        aria-hidden="true"
      />

      {/* Ember canvas appears when bulb is lit */}
      {(stage === "bulb" || stage === "handoff") && filamentLit && (
        <div className="absolute inset-0 z-0" style={{ opacity: lightRadius }}>
          <EmberCanvas count={80} direction="radial" originX={0.5} originY={0.4} />
        </div>
      )}

      {/* Typewriter text */}
      {stage === "typewriter" && (
        <div className="relative z-30 flex flex-col items-start gap-3 px-8 max-w-2xl">
          <div className="font-micro text-cream tracking-micro" style={{ fontSize: "clamp(13px, 1.4vw, 17px)" }}>
            {line1}
            {line2.length === 0 && (
              <span
                className="inline-block w-[0.6em] h-[1.1em] ml-[2px] align-middle"
                style={{
                  backgroundColor: caretVisible ? "var(--amber)" : "transparent",
                  transition: "background-color 0.05s",
                }}
                aria-hidden="true"
              />
            )}
          </div>
          {line2.length > 0 && (
            <div className="font-micro text-cream tracking-micro" style={{ fontSize: "clamp(13px, 1.4vw, 17px)" }}>
              {line2}
              <span
                className="inline-block w-[0.6em] h-[1.1em] ml-[2px] align-middle"
                style={{
                  backgroundColor: caretVisible ? "var(--amber)" : "transparent",
                  transition: "background-color 0.05s",
                }}
                aria-hidden="true"
              />
            </div>
          )}
        </div>
      )}

      {/* Bulb on cord */}
      {(stage === "bulb" || stage === "handoff") && (
        <div
          className="relative z-30 flex flex-col items-center"
          style={{
            transformOrigin: "50% 0%",
            transform: `translateY(${bulbY}px) rotate(${bulbRotation}deg)`,
          }}
        >
          {/* Cord */}
          <div
            className="w-[2px] bg-muted"
            style={{ height: "80px" }}
            aria-hidden="true"
          />

          {/* Bulb SVG */}
          <svg
            width="32"
            height="40"
            viewBox="0 0 32 40"
            className="pixel-crisp"
            aria-hidden="true"
          >
            {/* Socket */}
            <rect x="12" y="0" width="8" height="6" fill="#42322A" />
            <rect x="13" y="6" width="6" height="2" fill="#2A201C" />
            {/* Glass bulb */}
            <ellipse cx="16" cy="22" rx="12" ry="14" fill={filamentLit ? "rgba(255, 214, 128, 0.15)" : "rgba(30, 36, 50, 0.6)"} />
            <ellipse cx="16" cy="22" rx="10" ry="12" fill={filamentLit ? "rgba(240, 164, 76, 0.2)" : "rgba(20, 28, 40, 0.4)"} />
            {/* Filament */}
            <line x1="14" y1="14" x2="14" y2="28" stroke={filamentLit ? "#F0A44C" : "#2A201C"} strokeWidth="1" />
            <line x1="18" y1="14" x2="18" y2="28" stroke={filamentLit ? "#F0A44C" : "#2A201C"} strokeWidth="1" />
            <line x1="14" y1="28" x2="16" y2="30" stroke={filamentLit ? "#FFC46B" : "#2A201C"} strokeWidth="1" />
            <line x1="18" y1="28" x2="16" y2="30" stroke={filamentLit ? "#FFC46B" : "#2A201C"} strokeWidth="1" />
          </svg>

          {/* Glow around lit bulb */}
          {filamentLit && (
            <div
              className="pointer-events-none absolute"
              style={{
                top: "60px",
                left: "50%",
                transform: `translate(-50%, -50%) scale(${1 + lightRadius * 8})`,
                width: "120px",
                height: "120px",
                background: "radial-gradient(circle, rgba(240, 164, 76, 0.5) 0%, rgba(255, 196, 107, 0.15) 40%, transparent 70%)",
                borderRadius: "50%",
                transition: "transform 0.3s ease-out",
              }}
              aria-hidden="true"
            />
          )}
        </div>
      )}

      {/* SKIP control - always visible */}
      <button
        type="button"
        data-skip-btn
        onClick={handleSkip}
        className="absolute bottom-8 right-8 z-40 font-micro text-muted hover:text-amber tracking-micro uppercase transition-colors duration-150 focus-visible:outline-amber p-2 bg-transparent border-none cursor-pointer"
        style={{ fontSize: "12px" }}
      >
        [ SKIP ]
      </button>

      {/* Mute toggle - speaker glyph */}
      <button
        type="button"
        data-mute-btn
        onClick={handleMuteClick}
        className="absolute bottom-8 left-8 z-40 p-2 bg-transparent border-none cursor-pointer text-muted hover:text-amber transition-colors duration-150 focus-visible:outline-amber"
        aria-label={audioMuted ? "Unmute audio" : "Mute audio"}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" className="pixel-crisp" aria-hidden="true">
          {/* Speaker body */}
          <rect x="2" y="6" width="4" height="6" fill="currentColor" />
          <polygon points="6,6 11,2 11,16 6,12" fill="currentColor" />
          {/* Sound waves or X for muted */}
          {audioMuted ? (
            <>
              <line x1="13" y1="5" x2="17" y2="13" stroke="currentColor" strokeWidth="1.5" />
              <line x1="17" y1="5" x2="13" y2="13" stroke="currentColor" strokeWidth="1.5" />
            </>
          ) : (
            <>
              <rect x="13" y="7" width="1" height="4" fill="currentColor" />
              <rect x="15" y="5" width="1" height="8" fill="currentColor" />
            </>
          )}
        </svg>
      </button>
    </div>
  );
};
