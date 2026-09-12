"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Warden } from "@/components/sprites/Warden";
import { initCharacterReveal } from "@/lib/animations/textReveals";

interface Stage {
  num: string;
  title: string;
  xp: string;
  done: boolean;
}

export const Campaigns: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const pathRef = useRef<SVGLineElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const healthBarRef = useRef<HTMLDivElement | null>(null);
  const [stagesCompleted, setStagesCompleted] = useState<number>(0);

  const stages: Stage[] = [
    {
      num: "STAGE 01",
      title: "Architecture and Schema Definition",
      xp: "+120 XP",
      done: true,
    },
    {
      num: "STAGE 02",
      title: "Core Service Implementation",
      xp: "+240 XP",
      done: true,
    },
    {
      num: "STAGE 03",
      title: "Stress Testing and Benchmarking",
      xp: "+360 XP",
      done: true,
    },
    {
      num: "STAGE 04",
      title: "Production Deployment and Cutover",
      xp: "+600 XP",
      done: false,
    },
  ];

  useEffect(() => {
    if (typeof window === "undefined" || !sectionRef.current) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Character reveal on heading
    if (headingRef.current && !prefersReducedMotion) {
      initCharacterReveal(headingRef.current);
    }

    if (prefersReducedMotion) {
      setStagesCompleted(3);
      return;
    }

    let prevStep = 0;

    // Draw connecting line on scroll into view
    const trigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top 70%",
      end: "bottom 50%",
      scrub: 1,
      onUpdate: (self) => {
        // Line draw
        if (pathRef.current) {
          const progress = Math.min(1, self.progress * 1.5);
          pathRef.current.style.strokeDashoffset = `${300 * (1 - progress)}`;
        }

        // 4-step health bar depletion with shake on each new step
        const step = Math.min(4, Math.floor(self.progress * 5));
        if (step !== prevStep && step > prevStep) {
          // Shake the health bar on each new hit
          if (healthBarRef.current) {
            gsap.fromTo(
              healthBarRef.current,
              { x: -3 },
              {
                x: 0,
                duration: 0.3,
                ease: "elastic.out(1.5, 0.3)",
              }
            );
          }
          prevStep = step;
        }
        setStagesCompleted(step);
      },
    });

    return () => trigger.kill();
  }, []);

  // Boss health remaining: 4 steps
  const healthPercent = Math.max(10, 100 - stagesCompleted * 22);

  return (
    <section
      id="campaigns"
      ref={sectionRef}
      tabIndex={-1}
      className="relative min-h-screen py-28 px-6 sm:px-8 overflow-hidden flex flex-col justify-center outline-none"
      aria-label="Campaigns and the Warden Boss"
    >
      <div className="max-w-7xl mx-auto w-full">
        {/* Section Header */}
        <div className="mb-16">
          <div className="font-micro text-amber tracking-micro mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-amber inline-block shrink-0" />
            EPIC OBJECTIVES
          </div>
          <h2
            ref={headingRef}
            className="font-display text-4xl sm:text-6xl font-bold text-cream"
          >
            {"CAMPAIGNS AND THE WARDEN".split("").map((char, i) => (
              <span key={i} className="char-snap inline-block">
                {char === " " ? "\u00A0" : char}
              </span>
            ))}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left: Warden boss sprite at large integer scale + Health Bar */}
          <div className="lg:col-span-5 flex flex-col items-center">
            {/* Warden Health Bar (depletes in four steps with shake) */}
            <div
              ref={healthBarRef}
              className="w-full max-w-[340px] mb-8 bg-[#0A0F1C] p-4"
            >
              <div className="flex justify-between items-center font-micro text-[10px] tracking-micro text-muted mb-2">
                <span className="text-rose font-bold">WARDEN HP</span>
                <span className="tabular-nums text-cream">{healthPercent}%</span>
              </div>
              <div className="h-3 w-full bg-[#101829] overflow-hidden">
                <div
                  className="h-full bg-rose transition-all duration-300 ease-out"
                  style={{ width: `${healthPercent}%` }}
                />
              </div>
              <div className="mt-2 text-[9px] font-mono text-muted text-right">
                4-STAGE RESISTANCE DECAY
              </div>
            </div>

            {/* Warden Sprite */}
            <div className="relative flex items-center justify-center p-6">
              <Warden scale={6} />
            </div>
          </div>

          {/* Right: Campaigns description and 4-stage vertical list */}
          <div className="lg:col-span-7 flex flex-col">
            <p className="font-body text-muted mb-10">
              Large initiatives cannot be defeated in one sitting. Break large
              projects into Campaigns with discrete milestones. Each stage deals
              tangible damage to the Warden until the climactic completion.
            </p>

            {/* Vertical Stage List with connecting amber line */}
            <div className="relative flex flex-col gap-8 pl-8">
              {/* Connecting Line SVG */}
              <div className="absolute left-[11px] top-4 bottom-4 w-[2px] pointer-events-none" aria-hidden="true">
                <svg width="2" height="100%" className="overflow-visible">
                  <line
                    ref={pathRef}
                    x1="1"
                    y1="0"
                    x2="1"
                    y2="100%"
                    stroke="#F0A44C"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    strokeDashoffset="300"
                  />
                </svg>
              </div>

              {stages.map((stage, idx) => {
                const isComplete = idx < stagesCompleted;

                return (
                  <div key={stage.num} className="relative flex items-start gap-5 select-none">
                    {/* Square Stage Node */}
                    <div
                      className={`w-6 h-6 shrink-0 flex items-center justify-center -ml-[23px] relative z-10 transition-colors duration-200 ${
                        isComplete ? "bg-amber text-void" : "bg-[#101829] text-muted"
                      }`}
                    >
                      {isComplete ? (
                        <svg width="10" height="10" viewBox="0 0 10 10" className="pixel-crisp">
                          <rect x="1" y="4" width="2" height="4" fill="#06070B" />
                          <rect x="3" y="6" width="2" height="2" fill="#06070B" />
                          <rect x="5" y="4" width="2" height="2" fill="#06070B" />
                          <rect x="7" y="2" width="2" height="2" fill="#06070B" />
                        </svg>
                      ) : (
                        <span className="w-1.5 h-1.5 bg-muted" />
                      )}
                    </div>

                    {/* Stage Details */}
                    <div
                      className={`flex-1 p-5 ${
                        isComplete ? "bg-[#0A0F1C]/80" : "bg-[#0A0F1C]/40 opacity-70"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4 mb-2">
                        <span className="font-micro text-[10px] text-amber tracking-micro">
                          {stage.num}
                        </span>
                        <span
                          className={`font-micro text-[10px] tracking-micro ${
                            isComplete ? "text-sage" : "text-muted"
                          }`}
                        >
                          {isComplete ? "COMPLETE" : "IN PROGRESS"}
                        </span>
                      </div>
                      <div className="font-display text-lg font-bold text-cream mb-1">
                        {stage.title}
                      </div>
                      <div className="font-mono text-xs text-muted">
                        Reward: <span className="text-gold">{stage.xp}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
