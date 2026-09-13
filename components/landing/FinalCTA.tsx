"use client";

import React, { useEffect, useRef } from "react";
import { Lampbearer } from "@/components/sprites/Lampbearer";
import { Moth } from "@/components/sprites/Moth";
import { EmberCanvas } from "@/components/canvas/EmberCanvas";
import { attachMagneticHover, smoothScrollTo } from "@/lib/animations/gsapSetup";
import { gsap } from "gsap";
import { initCharacterReveal } from "@/lib/animations/textReveals";

export const FinalCTA: React.FC = () => {
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const spriteLayerRef = useRef<HTMLDivElement | null>(null);
  const emberLayerRef = useRef<HTMLDivElement | null>(null);
  const textLayerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (btnRef.current) {
      const cleanup = attachMagneticHover(btnRef.current, 6);
      return cleanup;
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    // Character reveal on heading
    if (headingRef.current) {
      initCharacterReveal(headingRef.current);
    }

    // Parallax at 3 depths
    const mm = gsap.matchMedia();
    mm.add("(min-width: 900px)", () => {
      if (textLayerRef.current) {
        gsap.to(textLayerRef.current, {
          y: 80,
          ease: "none",
          scrollTrigger: {
            trigger: "#final-cta",
            start: "top bottom",
            end: "bottom top",
            scrub: 0.5,
          },
        });
      }
      if (spriteLayerRef.current) {
        gsap.to(spriteLayerRef.current, {
          y: 40,
          ease: "none",
          scrollTrigger: {
            trigger: "#final-cta",
            start: "top bottom",
            end: "bottom top",
            scrub: 0.5,
          },
        });
      }
      if (emberLayerRef.current) {
        gsap.to(emberLayerRef.current, {
          y: 20,
          ease: "none",
          scrollTrigger: {
            trigger: "#final-cta",
            start: "top bottom",
            end: "bottom top",
            scrub: 0.5,
          },
        });
      }
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      id="final-cta"
      tabIndex={-1}
      className="relative min-h-[90vh] py-32 px-6 sm:px-8 overflow-hidden flex flex-col items-center justify-center text-center outline-none"
      aria-label="Final Call To Action"
    >
      {/* Full-width drifting embers */}
      <div ref={emberLayerRef} className="absolute inset-0 z-0 pointer-events-none">
        <EmberCanvas count={80} direction="upward" />
      </div>

      {/* Wide warm pool of volumetric light - soft outer edge */}
      <div
        className="pointer-events-none absolute"
        style={{
          width: "700px",
          height: "700px",
          background:
            "radial-gradient(circle, rgba(255, 196, 107, 0.24) 0%, rgba(240, 164, 76, 0.10) 35%, rgba(240, 164, 76, 0.03) 55%, transparent 72%)",
          borderRadius: "50%",
          zIndex: 1,
        }}
        aria-hidden="true"
      />

      <div ref={textLayerRef} className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
        {/* Lampbearer at larger scale with multiple moths circling */}
        <div ref={spriteLayerRef} className="relative mb-20 sm:mb-24">
          <Lampbearer scale={7} glowing={true} />

          {/* Primary Moth */}
          <div className="absolute top-12 -right-4">
            <Moth scale={4} orbitRadiusX={64} orbitRadiusY={36} duration={5.8} />
          </div>

          {/* Second Moth with offset trajectory */}
          <div className="absolute top-8 -left-6">
            <Moth scale={3} orbitRadiusX={-50} orbitRadiusY={28} duration={7.2} />
          </div>

          {/* Third Moth */}
          <div className="absolute -top-4 right-10">
            <Moth scale={3} orbitRadiusX={40} orbitRadiusY={-30} duration={6.4} />
          </div>
        </div>

        {/* Headline in Pixelify Sans with char-snap reveal */}
        <h2
          ref={headingRef}
          className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold text-cream mb-6 tracking-wide select-none"
        >
          {"CHAPTER TWO STARTS TONIGHT".split("").map((char, i) => (
            <span key={i} className="char-snap inline-block">
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </h2>

        {/* One line of body copy */}
        <p className="font-body text-cream/90 max-w-[55ch] mb-10">
          Open your quest log, commit your first task, and claim your lantern.
        </p>

        {/* Single large START A QUEST button */}
        <button
          ref={btnRef}
          type="button"
          onClick={() => smoothScrollTo("how-it-works", { offset: -80 })}
          className="pixel-btn-amber py-4 px-10 tracking-micro shadow-2xl"
        >
          START A QUEST
        </button>
      </div>
    </section>
  );
};
