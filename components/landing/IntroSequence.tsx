"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  initAudio,
  playTypeBlip,
  playThunk,
  isMuted,
  toggleMute,
} from "@/lib/audio/synthEngine";

interface IntroSequenceProps {
  onComplete: () => void;
}

type Beat = "loading" | "ready" | "typing";

const LINE_1 = "> THE LANTERN WENT OUT SOME TIME AGO.";
const LINE_2 = "> NOBODY IS COMING TO RELIGHT IT.";

export const IntroSequence: React.FC<IntroSequenceProps> = ({ onComplete }) => {
  const [beat, setBeat] = useState<Beat>("loading");
  const [progress, setProgress] = useState(0);
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [caretVisible, setCaretVisible] = useState(true);
  const [isWiping, setIsWiping] = useState(false);
  const [audioMuted, setAudioMuted] = useState(true);

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const finishedRef = useRef(false);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    clearTimers();
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem("liferpg_cinematic_seen", "true");
      } catch {}
    }
    onComplete();
  }, [clearTimers, onComplete]);

  // Check second visit or reduced motion on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      if (sessionStorage.getItem("liferpg_cinematic_seen") === "true") {
        finish();
        return;
      }
    } catch {}

    setAudioMuted(isMuted());

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setProgress(100);
      setBeat("ready");
      return;
    }

    // Beat 1: Counter 0 to 100 with progress bar
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress = Math.min(85, currentProgress + 5);
      setProgress(currentProgress);
    }, 50);

    const fontWait = new Promise<void>((resolve) => {
      if (typeof document !== "undefined" && document.fonts) {
        document.fonts.ready.then(() => resolve()).catch(() => resolve());
      } else {
        resolve();
      }
    });

    const minimumDelay = new Promise<void>((resolve) =>
      setTimeout(resolve, 850)
    );

    Promise.all([fontWait, minimumDelay]).then(() => {
      clearInterval(interval);
      setProgress(100);
      const t = setTimeout(() => {
        if (!finishedRef.current) {
          setBeat("ready");
        }
      }, 200);
      timersRef.current.push(t);
    });

    return () => {
      clearInterval(interval);
      clearTimers();
    };
  }, [finish, clearTimers]);

  // Caret blinking in typing beat
  useEffect(() => {
    if (beat !== "typing") return;
    const interval = setInterval(() => setCaretVisible((v) => !v), 530);
    return () => clearInterval(interval);
  }, [beat]);

  // Beat 3: Typewriter engine
  const startTypewriter = useCallback(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      setLine1(LINE_1);
      setLine2(LINE_2);
      const t = setTimeout(() => finish(), 500);
      timersRef.current.push(t);
      return;
    }

    let charIdx = 0;
    let currentLine = 1;
    let lineCharIdx = 0;
    const totalChars = LINE_1.length + LINE_2.length;

    const typeNext = () => {
      if (finishedRef.current) return;

      if (charIdx >= totalChars) {
        // Hold 500ms after last line, then clip-path wipe straight to hero
        const tHold = setTimeout(() => {
          if (finishedRef.current) return;
          setIsWiping(true);
          const tDone = setTimeout(() => {
            finish();
          }, 450);
          timersRef.current.push(tDone);
        }, 500);
        timersRef.current.push(tHold);
        return;
      }

      if (currentLine === 1) {
        if (lineCharIdx < LINE_1.length) {
          const char = LINE_1[lineCharIdx];
          setLine1(LINE_1.slice(0, lineCharIdx + 1));
          lineCharIdx++;
          charIdx++;

          if (char === " " || lineCharIdx === LINE_1.length) {
            playThunk();
          } else {
            playTypeBlip();
          }

          const jitter = 20 + Math.random() * 8;
          const t = setTimeout(typeNext, jitter);
          timersRef.current.push(t);
        } else {
          currentLine = 2;
          lineCharIdx = 0;
          const t = setTimeout(typeNext, 250);
          timersRef.current.push(t);
        }
      } else {
        if (lineCharIdx < LINE_2.length) {
          const char = LINE_2[lineCharIdx];
          setLine2(LINE_2.slice(0, lineCharIdx + 1));
          lineCharIdx++;
          charIdx++;

          if (char === " " || lineCharIdx === LINE_2.length) {
            playThunk();
          } else {
            playTypeBlip();
          }

          const jitter = 20 + Math.random() * 8;
          const t = setTimeout(typeNext, jitter);
          timersRef.current.push(t);
        } else {
          const tHold = setTimeout(() => {
            if (finishedRef.current) return;
            setIsWiping(true);
            const tDone = setTimeout(() => {
              finish();
            }, 450);
            timersRef.current.push(tDone);
          }, 500);
          timersRef.current.push(tHold);
        }
      }
    };

    const tInit = setTimeout(typeNext, 150);
    timersRef.current.push(tInit);
  }, [finish]);

  // Handle transition from Beat 2 [ PRESS TO BEGIN ] to Beat 3
  const handleBegin = useCallback(() => {
    if (finishedRef.current || beat !== "ready") return;
    initAudio();
    setAudioMuted(isMuted());
    setBeat("typing");
    startTypewriter();
  }, [beat, startTypewriter]);

  // Listen for user click/keypress in Beat 2
  useEffect(() => {
    if (beat !== "ready") return;

    const onGesture = (e: Event) => {
      if ((e.target as HTMLElement)?.closest?.("[data-skip-btn]")) return;
      if ((e.target as HTMLElement)?.closest?.("[data-mute-btn]")) return;
      handleBegin();
    };

    window.addEventListener("click", onGesture, { once: true });
    window.addEventListener("keydown", onGesture, { once: true });

    return () => {
      window.removeEventListener("click", onGesture);
      window.removeEventListener("keydown", onGesture);
    };
  }, [beat, handleBegin]);

  // Any key or click skips during Beat 3 typing
  useEffect(() => {
    if (beat !== "typing") return;

    const onSkipGesture = (e: Event) => {
      if ((e.target as HTMLElement)?.closest?.("[data-mute-btn]")) return;
      finish();
    };

    window.addEventListener("keydown", onSkipGesture, { once: true });
    const timer = setTimeout(() => {
      window.addEventListener("click", onSkipGesture, { once: true });
    }, 100);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", onSkipGesture);
      window.removeEventListener("click", onSkipGesture);
    };
  }, [beat, finish]);

  const handleMuteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newMuted = toggleMute();
    setAudioMuted(newMuted);
  };

  const handleSkipClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    finish();
  };

  return (
    <div
      id="intro-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Intro Sequence"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center select-none overflow-hidden"
      style={{
        backgroundColor: "var(--void)",
        clipPath: isWiping ? "inset(0 0 100% 0)" : "inset(0 0 0 0)",
        transition: isWiping
          ? "clip-path 450ms cubic-bezier(0.77, 0, 0.175, 1)"
          : "none",
      }}
    >
      <style jsx>{`
        .amber-pulse {
          animation: amberPulse 1.8s ease-in-out infinite alternate;
        }
        @keyframes amberPulse {
          0% {
            color: #f0a44c;
            opacity: 0.6;
            text-shadow: 0 0 4px rgba(240, 164, 76, 0.3);
          }
          100% {
            color: #ffc46b;
            opacity: 1;
            text-shadow: 0 0 16px rgba(255, 196, 107, 0.8);
          }
        }
      `}</style>

      {/* Vignette */}
      <div
        className="pointer-events-none absolute inset-0 z-20"
        style={{
          background:
            "radial-gradient(circle at center, transparent 30%, #06070B 90%)",
        }}
        aria-hidden="true"
      />

      {/* Beat 1: Preloader counter & bar */}
      {beat === "loading" && (
        <div className="relative z-30 flex flex-col items-center gap-8">
          <div
            className="font-micro tabular-nums text-cream"
            style={{ fontSize: "clamp(18px, 2.5vw, 26px)" }}
          >
            {progress.toString().padStart(3, "0")} %
          </div>
          <div
            className="h-[3px] w-[240px] overflow-hidden"
            style={{ backgroundColor: "#171C2E", borderRadius: "0px" }}
          >
            <div
              className="h-full transition-all duration-75 ease-out"
              style={{
                width: `${progress}%`,
                backgroundColor: "var(--amber)",
                borderRadius: "0px",
              }}
            />
          </div>
        </div>
      )}

      {/* Beat 2: [ PRESS TO BEGIN ] */}
      {beat === "ready" && (
        <div className="relative z-30 flex flex-col items-center">
          <button
            type="button"
            onClick={handleBegin}
            className="amber-pulse font-micro tracking-micro uppercase cursor-pointer border-none bg-transparent select-none p-4"
            style={{ fontSize: "clamp(16px, 2vw, 22px)" }}
            autoFocus
          >
            [ PRESS TO BEGIN ]
          </button>
        </div>
      )}

      {/* Beat 3: Typewriter lines */}
      {beat === "typing" && (
        <div className="relative z-30 flex flex-col items-start gap-3 px-8 max-w-2xl">
          <div
            className="font-micro text-cream tracking-micro"
            style={{ fontSize: "clamp(13px, 1.4vw, 17px)" }}
          >
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
            <div
              className="font-micro text-cream tracking-micro"
              style={{ fontSize: "clamp(13px, 1.4vw, 17px)" }}
            >
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

      {/* SKIP control - always visible */}
      <button
        type="button"
        data-skip-btn
        onClick={handleSkipClick}
        className="absolute bottom-8 right-8 z-40 font-micro text-muted hover:text-amber tracking-micro uppercase transition-colors duration-150 focus-visible:outline-amber p-2 bg-transparent border-none cursor-pointer"
        style={{ fontSize: "12px" }}
      >
        [ SKIP ]
      </button>

      {/* Mute toggle */}
      <button
        type="button"
        data-mute-btn
        onClick={handleMuteClick}
        className="absolute bottom-8 left-8 z-40 p-2 bg-transparent border-none cursor-pointer text-muted hover:text-amber transition-colors duration-150 focus-visible:outline-amber"
        aria-label={audioMuted ? "Unmute audio" : "Mute audio"}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          className="pixel-crisp"
          aria-hidden="true"
        >
          <rect x="2" y="6" width="4" height="6" fill="currentColor" />
          <polygon points="6,6 11,2 11,16 6,12" fill="currentColor" />
          {audioMuted ? (
            <>
              <line
                x1="13"
                y1="5"
                x2="17"
                y2="13"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <line
                x1="17"
                y1="5"
                x2="13"
                y2="13"
                stroke="currentColor"
                strokeWidth="1.5"
              />
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
