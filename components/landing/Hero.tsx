"use client";

import React, { useEffect, useRef } from "react";
import { Lampbearer } from "@/components/sprites/Lampbearer";
import { Moth } from "@/components/sprites/Moth";
import { EmberCanvas } from "@/components/canvas/EmberCanvas";
import { attachMagneticHover } from "@/lib/animations/gsapSetup";
import { gsap } from "gsap";

interface HeroProps {
  onStartQuest?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartQuest }) => {
  const questBtnRef = useRef<HTMLButtonElement | null>(null);
  const headlineRef = useRef<HTMLHeadingElement | null>(null);
  const textLayerRef = useRef<HTMLDivElement | null>(null);
  const spriteLayerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (questBtnRef.current) {
      const cleanup = attachMagneticHover(questBtnRef.current, 6);
      return cleanup;
    }
  }, []);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    // Character level snapping text reveals
    if (headlineRef.current) {
      const chars = headlineRef.current.querySelectorAll<HTMLElement>(".char-snap");
      gsap.fromTo(
        chars,
        { y: 14, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.025,
          duration: 0.04,
          ease: "steps(1, end)",
          delay: 0.2,
        }
      );
    }

    // Parallax at three depths (particle layer slowest, sprite layer medium, text layer fastest)
    const handleScroll = () => {
      const y = window.scrollY;
      if (textLayerRef.current) {
        textLayerRef.current.style.transform = `translateY(${y * 0.16}px)`;
      }
      if (spriteLayerRef.current) {
        spriteLayerRef.current.style.transform = `translateY(${y * 0.08}px)`;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const headlineLines = ["YOUR LIFE", "IS ALREADY", "AN RPG"];

  return (
    <section
      id="hero"
      className="relative min-h-screen pt-40 sm:pt-44 pb-20 px-6 sm:px-8 flex flex-col justify-between overflow-hidden"
    >
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center my-auto">
        {/* Left two thirds: Eyebrow, Headline, Paragraph, Controls */}
        <div ref={textLayerRef} className="lg:col-span-7 flex flex-col items-start z-10">
          <div className="font-micro text-amber tracking-micro mb-6 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-amber inline-block shrink-0" />
            CHAPTER ONE
          </div>

          <h1
            ref={headlineRef}
            className="font-display text-5xl sm:text-7xl lg:text-[5.25rem] font-bold text-cream leading-[1.04] mb-8 select-none"
          >
            {headlineLines.map((line, lIdx) => (
              <span key={lIdx} className="block whitespace-nowrap">
                {line.split("").map((char, cIdx) => (
                  <span
                    key={cIdx}
                    className="char-snap inline-block transition-transform duration-75"
                  >
                    {char === " " ? "\u00A0" : char}
                  </span>
                ))}
              </span>
            ))}
          </h1>

          <p className="font-body mb-10">
            You are already grinding. Waking up early, reading the hard chapter,
            going back to the gym after a week off. The problem is that none of
            it shows up anywhere. Life RPG gives that work a number, a level, and
            a world that lights up when you do it.
          </p>

          <div className="flex flex-wrap items-center gap-6 sm:gap-8">
            <button
              ref={questBtnRef}
              type="button"
              onClick={onStartQuest}
              className="pixel-btn-amber"
            >
              START A QUEST
            </button>

            <a
              href="#how-it-works"
              className="group inline-flex items-center gap-2.5 font-micro text-cream hover:text-amber transition-colors duration-150 py-2 focus-visible:outline-amber"
            >
              <span>SEE HOW IT WORKS</span>
              {/* Pixel arrow that nudges right on hover */}
              <span className="inline-block transition-transform duration-150 ease-out group-hover:translate-x-1.5 pixel-crisp">
                <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
                  <rect x="0" y="4" width="6" height="2" fill="currentColor" />
                  <rect x="6" y="2" width="2" height="6" fill="currentColor" />
                  <rect x="8" y="4" width="2" height="2" fill="currentColor" />
                </svg>
              </span>
            </a>
          </div>
        </div>

        {/* Right third: Lampbearer in radial pool, orbiting Moth, drifting embers */}
        <div
          ref={spriteLayerRef}
          className="lg:col-span-5 relative flex items-center justify-center min-h-[380px] lg:min-h-[460px]"
        >
          {/* Slow particle field behind sprite */}
          <div className="absolute inset-0 z-0">
            <EmberCanvas count={45} direction="radial" originX={0.5} originY={0.55} />
          </div>

          {/* Subtly breathing amber radial pool */}
          <div
            className="pointer-events-none absolute w-[340px] h-[340px] sm:w-[440px] sm:h-[440px]"
            style={{
              background:
                "radial-gradient(circle, rgba(240, 164, 76, 0.20) 0%, rgba(240, 164, 76, 0.08) 35%, rgba(240, 164, 76, 0.02) 55%, transparent 70%)",
              animation: "radialBreath 4.8s ease-in-out infinite alternate",
              borderRadius: "50%",
            }}
            aria-hidden="true"
          />

          <style jsx>{`
            @keyframes radialBreath {
              0% {
                transform: scale(0.92);
                opacity: 0.7;
              }
              100% {
                transform: scale(1.08);
                opacity: 1;
              }
            }
          `}</style>

          {/* Sprite assembly */}
          <div className="relative z-10 flex flex-col items-center">
            <Lampbearer scale={6} glowing={true} />
            {/* The Moth orbiting the lantern */}
            <div className="absolute top-10 right-4">
              <Moth scale={3} orbitRadiusX={50} orbitRadiusY={30} duration={6} />
            </div>
          </div>
        </div>
      </div>

      {/* Scroll cue at bottom: 1px vertical amber line growing downward */}
      <div
        className="w-full flex flex-col items-center justify-center pt-8 pointer-events-none select-none"
        aria-hidden="true"
      >
        <div className="relative h-12 w-[1px] bg-ink overflow-hidden">
          <div className="scroll-cue-line absolute top-0 left-0 w-[1px] bg-amber" />
        </div>
        <style jsx>{`
          .scroll-cue-line {
            height: 100%;
            animation: scrollLineGrowth 2.2s cubic-bezier(0.22, 1, 0.36, 1) infinite;
          }
          @keyframes scrollLineGrowth {
            0% {
              transform: translateY(-100%);
            }
            50% {
              transform: translateY(0%);
            }
            100% {
              transform: translateY(100%);
            }
          }
        `}</style>
      </div>
    </section>
  );
};
