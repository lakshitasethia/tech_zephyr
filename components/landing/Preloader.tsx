"use client";

import React, { useEffect, useState, useCallback } from "react";

interface PreloaderProps {
  onComplete: () => void;
}

export const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [fadedOut, setFadedOut] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      setProgress(100);
      setIsReady(true);
      return;
    }

    // Ensure the counter is visible for at least ~900ms so users actually see it.
    // Tick from 0 to ~85 on a 50ms interval (roughly 850ms), then wait for fonts
    // and jump to 100.
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

    // Guarantee a minimum 900ms of visible counter
    const minimumDelay = new Promise<void>((resolve) =>
      setTimeout(resolve, 900)
    );

    Promise.all([fontWait, minimumDelay]).then(() => {
      clearInterval(interval);
      setProgress(100);
      // Hold at 100 for a beat before showing PRESS TO BEGIN
      setTimeout(() => setIsReady(true), 250);
    });

    return () => clearInterval(interval);
  }, []);

  const handleUserGesture = useCallback(() => {
    setFadedOut(true);
    setTimeout(() => {
      onComplete();
    }, 350);
  }, [onComplete]);

  useEffect(() => {
    if (!isReady) return;

    window.addEventListener("click", handleUserGesture, { once: true });
    window.addEventListener("keydown", handleUserGesture, { once: true });

    return () => {
      window.removeEventListener("click", handleUserGesture);
      window.removeEventListener("keydown", handleUserGesture);
    };
  }, [isReady, handleUserGesture]);

  if (fadedOut) return null;

  return (
    <div
      id="preloader"
      role="dialog"
      aria-modal="true"
      aria-label="Preloader"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-300 ${
        fadedOut ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      style={{ backgroundColor: "var(--void)" }}
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

      <div className="flex flex-col items-center gap-8">
        {!isReady ? (
          <>
            <div
              className="font-micro tabular-nums text-cream"
              style={{ fontSize: "clamp(18px, 2.5vw, 26px)" }}
            >
              {progress.toString().padStart(3, "0")} %
            </div>
            {/* 240px wide, 3px tall, amber fill, hard edges, no rounding */}
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
          </>
        ) : (
          <button
            type="button"
            className="amber-pulse font-micro tracking-micro uppercase cursor-pointer border-none bg-transparent select-none"
            style={{ fontSize: "clamp(16px, 2vw, 22px)" }}
            autoFocus
          >
            [ PRESS TO BEGIN ]
          </button>
        )}
      </div>
    </div>
  );
};
