"use client";

import React, { useEffect, useState } from "react";

interface PreloaderProps {
  onComplete: () => void;
}

export const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [fadedOut, setFadedOut] = useState(false);

  useEffect(() => {
    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Check actual font and asset readiness
    const checkAssets = async () => {
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress = Math.min(85, currentProgress + 15);
        setProgress(currentProgress);
      }, 40);

      try {
        if (typeof document !== "undefined" && document.fonts) {
          await document.fonts.ready;
        }
      } catch {
        // Fallback gracefully
      }

      clearInterval(interval);
      setProgress(100);
      setIsReady(true);
    };

    if (prefersReducedMotion) {
      setProgress(100);
      setIsReady(true);
    } else {
      checkAssets();
    }
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const handleUserGesture = () => {
      setFadedOut(true);
      setTimeout(() => {
        onComplete();
      }, 350);
    };

    window.addEventListener("click", handleUserGesture, { once: true });
    window.addEventListener("keydown", handleUserGesture, { once: true });

    return () => {
      window.removeEventListener("click", handleUserGesture);
      window.removeEventListener("keydown", handleUserGesture);
    };
  }, [isReady, onComplete]);

  if (fadedOut) return null;

  return (
    <div
      id="preloader"
      role="dialog"
      aria-modal="true"
      aria-label="Preloader"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-void transition-opacity duration-300 ${
        fadedOut ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
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

      <div className="flex flex-col items-center gap-6">
        {!isReady ? (
          <>
            <div className="font-micro tabular-nums text-[13px] text-cream">
              {progress.toString().padStart(3, "0")} %
            </div>
            {/* 240px wide, 3px tall, amber fill, hard edges, no rounding */}
            <div
              className="h-[3px] w-[240px] bg-[#171C2E] overflow-hidden"
              style={{ borderRadius: "0px" }}
            >
              <div
                className="h-full bg-amber transition-all duration-75 ease-out"
                style={{
                  width: `${progress}%`,
                  borderRadius: "0px",
                }}
              />
            </div>
          </>
        ) : (
          <button
            type="button"
            className="amber-pulse font-micro text-[13px] tracking-micro uppercase cursor-pointer border-none bg-transparent select-none focus-visible:outline-amber"
            autoFocus
          >
            [ PRESS TO BEGIN ]
          </button>
        )}
      </div>
    </div>
  );
};
