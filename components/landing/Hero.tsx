"use client";

import React, { useEffect, useRef } from "react";
import { Lampbearer } from "@/components/sprites/Lampbearer";
import { Moth } from "@/components/sprites/Moth";
import { EmberCanvas } from "@/components/canvas/EmberCanvas";
import { attachMagneticHover, smoothScrollTo } from "@/lib/animations/gsapSetup";
import { gsap } from "gsap";

export const Hero: React.FC = () => {
  const questBtnRef = useRef<HTMLButtonElement | null>(null);
  const headlineRef = useRef<HTMLHeadingElement | null>(null);
  const textLayerRef = useRef<HTMLDivElement | null>(null);
  const spriteLayerRef = useRef<HTMLDivElement | null>(null);
  const emberLayerRef = useRef<HTMLDivElement | null>(null);
  const cursorLightRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (questBtnRef.current) {
      const cleanup = attachMagneticHover(questBtnRef.current, 6);
      return cleanup;
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

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

    // Parallax at three depths via ScrollTrigger
    const mm = gsap.matchMedia();
    mm.add("(min-width: 900px)", () => {
      if (textLayerRef.current) {
        gsap.to(textLayerRef.current, {
          y: 120,
          ease: "none",
          scrollTrigger: {
            trigger: "#hero",
            start: "top top",
            end: "bottom top",
            scrub: 0.5,
          },
        });
      }

      if (spriteLayerRef.current) {
        gsap.to(spriteLayerRef.current, {
          y: 60,
          ease: "none",
          scrollTrigger: {
            trigger: "#hero",
            start: "top top",
            end: "bottom top",
            scrub: 0.5,
          },
        });
      }

      if (emberLayerRef.current) {
        gsap.to(emberLayerRef.current, {
          y: 30,
          ease: "none",
          scrollTrigger: {
            trigger: "#hero",
            start: "top top",
            end: "bottom top",
            scrub: 0.5,
          },
        });
      }
    });

    // Hero cursor light - additive warm radial following pointer
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    let lightRaf: number;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    if (canHover && cursorLightRef.current) {
      const light = cursorLightRef.current;
      light.style.display = "block";

      const onMouseMove = (e: MouseEvent) => {
        targetX = e.clientX;
        targetY = e.clientY;
      };

      const animate = () => {
        currentX += (targetX - currentX) * 0.12;
        currentY += (targetY - currentY) * 0.12;
        light.style.transform = `translate3d(${currentX - 200}px, ${currentY - 200}px, 0)`;
        lightRaf = requestAnimationFrame(animate);
      };

      window.addEventListener("mousemove", onMouseMove, { passive: true });
      lightRaf = requestAnimationFrame(animate);

      return () => {
        window.removeEventListener("mousemove", onMouseMove);
        cancelAnimationFrame(lightRaf);
        mm.revert();
      };
    }

    return () => {
      mm.revert();
    };
  }, []);

  const headlineLines = ["YOUR LIFE", "IS ALREADY", "AN RPG"];

  const handleStartQuest = () => {
    smoothScrollTo("how-it-works", { offset: -80 });
  };

  return (
    <section
      id="hero"
      tabIndex={-1}
      className="relative min-h-screen pt-40 sm:pt-44 pb-20 px-6 sm:px-8 flex flex-col justify-between overflow-hidden outline-none"
    >
      {/* Cursor-following additive warm light (desktop only) */}
      <div
        ref={cursorLightRef}
        className="pointer-events-none fixed z-20"
        style={{
          display: "none",
          width: "400px",
          height: "400px",
          background: "radial-gradient(circle, rgba(240, 164, 76, 0.12) 0%, rgba(240, 164, 76, 0.04) 40%, transparent 70%)",
          borderRadius: "50%",
          mixBlendMode: "screen",
        }}
        aria-hidden="true"
      />

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
            it shows up anywhere. Lanternkeep gives that work a number, a level, and
            a world that lights up when you do it.
          </p>

          <div className="flex flex-wrap items-center gap-6 sm:gap-8">
            <button
              ref={questBtnRef}
              type="button"
              onClick={handleStartQuest}
              className="pixel-btn-amber"
            >
              START A QUEST
            </button>

            <a
              href="#how-it-works"
              onClick={(e) => {
                e.preventDefault();
                smoothScrollTo("how-it-works", { offset: -80 });
              }}
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
          <div ref={emberLayerRef} className="absolute inset-0 z-0">
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
