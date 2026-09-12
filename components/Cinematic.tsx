"use client";

import React, { useEffect, useRef, useState } from "react";
import { Lampbearer } from "./sprites/Lampbearer";
import { EmberCanvas } from "./canvas/EmberCanvas";

interface CinematicProps {
  onComplete: () => void;
}

export const Cinematic: React.FC<CinematicProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<"ignite" | "embers" | "title" | "wipe" | "done">("ignite");
  const [lettersVisible, setLettersVisible] = useState<number>(0);
  const titleText = "LIFE RPG";
  const timerRef = useRef<NodeJS.Timeout[]>([]);

  const handleSkip = () => {
    timerRef.current.forEach(clearTimeout);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("liferpg_cinematic_seen", "true");
    }
    setStage("done");
    onComplete();
  };

  useEffect(() => {
    // Check if previously seen
    if (typeof window !== "undefined" && sessionStorage.getItem("liferpg_cinematic_seen") === "true") {
      onComplete();
      return;
    }

    // Step 1: Ignite single amber pixel (600ms)
    const t1 = setTimeout(() => {
      setStage("embers");
    }, 700);

    // Step 2: Title resolves letter by letter with 40ms snap stagger (around 1800ms)
    const t2 = setTimeout(() => {
      setStage("title");
      for (let i = 1; i <= titleText.length; i++) {
        const letterTimer = setTimeout(() => {
          setLettersVisible(i);
        }, (i - 1) * 45);
        timerRef.current.push(letterTimer);
      }
    }, 1700);

    // Step 3: Hold 700ms, then wipe upward
    const t3 = setTimeout(() => {
      setStage("wipe");
    }, 2800);

    // Step 4: Complete
    const t4 = setTimeout(() => {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("liferpg_cinematic_seen", "true");
      }
      setStage("done");
      onComplete();
    }, 3600);

    timerRef.current.push(t1, t2, t3, t4);

    return () => {
      timerRef.current.forEach(clearTimeout);
    };
  }, [onComplete]);

  if (stage === "done") return null;

  return (
    <div
      id="cinematic-layer"
      role="region"
      aria-label="Opening Cinematic"
      className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-void overflow-hidden select-none transition-all duration-700 ease-[cubic-bezier(0.8,0,0.2,1)]"
      style={{
        clipPath: stage === "wipe" ? "polygon(0 0, 100% 0, 100% 0, 0 0)" : "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
      }}
    >
      {/* Vignette softening the edges */}
      <div
        className="pointer-events-none absolute inset-0 z-20"
        style={{
          background: "radial-gradient(circle at center, transparent 30%, #06070B 90%)",
        }}
        aria-hidden="true"
      />

      {/* Stage 1: Single amber pixel ignites at center */}
      {stage === "ignite" && (
        <div
          className="h-[3px] w-[3px] bg-amber shadow-[0_0_12px_#f0a44c] animate-ping"
          aria-hidden="true"
        />
      )}

      {/* Stage 2 & 3: 120 ember particles expanding outward + Lampbearer fades up */}
      {(stage === "embers" || stage === "title" || stage === "wipe") && (
        <>
          <div className="absolute inset-0 z-0">
            <EmberCanvas count={120} direction="radial" originX={0.5} originY={0.5} />
          </div>

          <div className="relative z-10 flex flex-col items-center gap-6">
            {/* Lampbearer sprite fades up at center, small scale */}
            <div className="transition-opacity duration-1000 opacity-100">
              <Lampbearer scale={4} glowing={true} />
            </div>

            {/* Title resolves in Pixelify Sans, letter by letter */}
            <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-wider text-cream flex items-center justify-center min-h-[48px]">
              {titleText.split("").map((char, index) => (
                <span
                  key={index}
                  className="inline-block transition-transform duration-75"
                  style={{
                    opacity: index < lettersVisible ? 1 : 0,
                    transform: index < lettersVisible ? "translateY(0px)" : "translateY(8px)",
                  }}
                >
                  {char === " " ? "\u00A0" : char}
                </span>
              ))}
            </h2>
          </div>
        </>
      )}

      {/* Skip control bottom right */}
      <button
        type="button"
        onClick={handleSkip}
        className="absolute bottom-8 right-8 z-30 font-micro text-[11px] text-muted hover:text-amber tracking-micro uppercase transition-colors duration-150 focus-visible:outline-amber p-2 bg-transparent border-none cursor-pointer"
      >
        [ SKIP ]
      </button>
    </div>
  );
};
