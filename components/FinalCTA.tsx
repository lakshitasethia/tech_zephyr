"use client";

import React, { useEffect, useRef } from "react";
import { Lampbearer } from "./sprites/Lampbearer";
import { Moth } from "./sprites/Moth";
import { EmberCanvas } from "./canvas/EmberCanvas";
import { attachMagneticHover } from "@/lib/animations/gsapSetup";

interface FinalCTAProps {
  onStartQuest?: () => void;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({ onStartQuest }) => {
  const btnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (btnRef.current) {
      const cleanup = attachMagneticHover(btnRef.current, 6);
      return cleanup;
    }
  }, []);

  return (
    <section
      id="final-cta"
      className="relative min-h-[90vh] py-32 px-6 sm:px-8 overflow-hidden flex flex-col items-center justify-center text-center"
      aria-label="Final Call To Action"
    >
      {/* Full-width drifting embers */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <EmberCanvas count={80} direction="upward" />
      </div>

      {/* Wide warm pool of volumetric light */}
      <div
        className="pointer-events-none absolute w-[600px] h-[600px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255, 196, 107, 0.28) 0%, rgba(240, 164, 76, 0.12) 45%, transparent 75%)",
          zIndex: 1,
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
        {/* Lampbearer at larger scale with multiple moths circling */}
        <div className="relative mb-12">
          <Lampbearer scale={7} glowing={true} />

          {/* Primary Moth */}
          <div className="absolute top-12 -right-4">
            <Moth scale={3} orbitRadiusX={64} orbitRadiusY={36} duration={5.8} />
          </div>

          {/* Second Moth with offset trajectory */}
          <div className="absolute top-8 -left-6">
            <Moth scale={2} orbitRadiusX={-50} orbitRadiusY={28} duration={7.2} />
          </div>

          {/* Third Moth */}
          <div className="absolute -top-4 right-10">
            <Moth scale={2} orbitRadiusX={40} orbitRadiusY={-30} duration={6.4} />
          </div>
        </div>

        {/* Headline in Pixelify Sans */}
        <h2 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold text-cream mb-6 tracking-wide select-none">
          CHAPTER TWO STARTS TONIGHT
        </h2>

        {/* One line of body copy */}
        <p className="font-body text-lg sm:text-xl text-cream/90 max-w-[55ch] mb-10 leading-relaxed">
          Open your quest log, commit your first task, and claim your lantern.
        </p>

        {/* Single large START A QUEST button */}
        <button
          ref={btnRef}
          type="button"
          onClick={onStartQuest}
          className="pixel-btn-amber text-xs sm:text-sm py-4 px-10 tracking-micro shadow-2xl"
        >
          START A QUEST
        </button>
      </div>
    </section>
  );
};
