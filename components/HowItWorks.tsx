"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { IdleOne } from "./sprites/IdleOne";
import { Lampbearer } from "./sprites/Lampbearer";

export const HowItWorks: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);

  // Panel 1 typing simulation
  const [typedText, setTypedText] = useState("");
  const [tagVisible, setTagVisible] = useState(false);
  const [xpVisible, setXpVisible] = useState(false);

  // Panel 2 quest completion simulation
  const [completed, setCompleted] = useState(false);
  const [burstActive, setBurstActive] = useState(false);
  const [tickingXp, setTickingXp] = useState(240);

  // Panel 3 comparison slider (percentage 0 to 100)
  const [sliderPos, setSliderPos] = useState(50);
  const sliderContainerRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef(false);

  // Handle panel 3 drag interaction
  const handleMove = (clientX: number) => {
    if (!sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const percent = (x / rect.width) * 100;
    setSliderPos(percent);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    handleMove(e.clientX);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (isDraggingRef.current) {
      handleMove(e.clientX);
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {}
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const fullText = "Read 20 pages of DDIA";
    let charIndex = 0;
    let typingInterval: NodeJS.Timeout;

    const triggerPanel1 = () => {
      setTypedText("");
      setTagVisible(false);
      setXpVisible(false);
      charIndex = 0;

      clearInterval(typingInterval);
      typingInterval = setInterval(() => {
        if (charIndex <= fullText.length) {
          setTypedText(fullText.slice(0, charIndex));
          charIndex++;
        } else {
          clearInterval(typingInterval);
          setTimeout(() => setTagVisible(true), 120);
          setTimeout(() => setXpVisible(true), 280);
        }
      }, 45);
    };

    const triggerPanel2 = () => {
      setCompleted(true);
      setBurstActive(true);
      setTimeout(() => setBurstActive(false), 900);

      let cur = 240;
      const target = 280;
      const interval = setInterval(() => {
        if (cur < target) {
          cur += 4;
          setTickingXp(cur);
        } else {
          clearInterval(interval);
        }
      }, 40);
    };

    // ScrollTrigger Setup
    const mm = gsap.matchMedia();

    mm.add("(min-width: 900px)", () => {
      const pinTrigger = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: () => `+=${window.innerWidth * 1.8}`,
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        onUpdate: (self) => {
          const progress = self.progress;

          // Horizontal translation
          if (trackRef.current) {
            const maxScroll = trackRef.current.scrollWidth - window.innerWidth + 120;
            trackRef.current.style.transform = `translateX(${-progress * maxScroll}px)`;
          }

          // Connecting line dash offset
          if (pathRef.current) {
            const length = pathRef.current.getTotalLength();
            pathRef.current.style.strokeDashoffset = `${length * (1 - progress)}`;
          }

          // Trigger panel animations based on progress thresholds
          if (progress > 0.08 && charIndex === 0) {
            triggerPanel1();
          }
          if (progress > 0.42 && !completed) {
            triggerPanel2();
          }
        },
      });

      return () => {
        pinTrigger.kill();
      };
    });

    mm.add("(max-width: 899px)", () => {
      // Simple entrance without pin on mobile
      triggerPanel1();
      triggerPanel2();
    });

    return () => {
      clearInterval(typingInterval);
      mm.revert();
    };
  }, [completed]);

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="relative min-h-screen py-24 px-6 sm:px-8 overflow-hidden flex flex-col justify-center"
      aria-label="How It Works"
    >
      {/* Section Header */}
      <div className="max-w-7xl mx-auto w-full mb-12 lg:mb-16">
        <div className="font-micro text-amber text-[11px] tracking-micro mb-3 uppercase flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-amber inline-block shrink-0" />
          THE THREE STEPS
        </div>
        <h2 className="font-display text-4xl sm:text-5xl font-bold text-cream">
          HOW IT WORKS
        </h2>
      </div>

      {/* SVG Connecting dotted amber line with square nodes */}
      <div className="hidden lg:block absolute top-[52%] left-0 w-full pointer-events-none z-0">
        <svg width="100%" height="40" className="overflow-visible" aria-hidden="true">
          <path
            ref={pathRef}
            d="M 100 20 L 3200 20"
            stroke="#F0A44C"
            strokeWidth="2"
            strokeDasharray="4 6"
            fill="none"
          />
        </svg>
      </div>

      {/* Horizontal Track Container */}
      <div ref={containerRef} className="w-full overflow-visible">
        <div
          ref={trackRef}
          className="flex flex-col lg:flex-row gap-16 lg:gap-32 w-full transition-transform duration-75 ease-out"
        >
          {/* PANEL 1: ADD A QUEST */}
          <div className="w-full lg:w-[620px] shrink-0 bg-[#0A0F1C]/90 p-8 sm:p-10 flex flex-col justify-between border-none relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="w-3 h-3 bg-amber inline-block pixel-crisp" />
                <span className="font-micro text-xs text-amber tracking-micro">PANEL 01</span>
              </div>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-cream mb-4">
                ADD A QUEST
              </h3>
              <p className="font-body text-sm text-muted mb-8 leading-relaxed">
                Type the actual work you need to do. Attach an attribute tag. Set the XP weight.
              </p>

              {/* Pixel Styled Input Mock */}
              <div className="bg-[#101829] p-5 flex flex-col gap-4">
                <div className="font-micro text-[10px] text-muted tracking-micro uppercase flex justify-between">
                  <span>NEW_TASK_ENTRY</span>
                  <span className="text-amber">[ACTIVE]</span>
                </div>

                <div className="flex items-center justify-between gap-3 bg-[#06070B] px-4 py-3 min-h-[48px]">
                  <div className="font-mono text-sm text-cream flex items-center">
                    <span>{typedText}</span>
                    <span className="inline-block w-2 h-4 bg-amber ml-1 animate-pulse" />
                  </div>

                  <div className="flex items-center gap-2">
                    {tagVisible && (
                      <span className="font-micro text-[10px] bg-[#171C2E] text-steel px-2 py-1 tracking-micro animate-[bounce_0.2s_ease-out]">
                        INTELLECT
                      </span>
                    )}
                    {xpVisible && (
                      <span className="font-micro text-[10px] bg-amber text-void px-2 py-1 font-bold tracking-micro">
                        +40 XP
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="font-micro text-[10px] text-muted tracking-micro mt-6">
              INPUT REFLECTS DIRECT REAL-WORLD OUTPUT.
            </div>
          </div>

          {/* PANEL 2: COMPLETE IT */}
          <div className="w-full lg:w-[620px] shrink-0 bg-[#0A0F1C]/90 p-8 sm:p-10 flex flex-col justify-between border-none relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="w-3 h-3 bg-amber inline-block pixel-crisp" />
                <span className="font-micro text-xs text-amber tracking-micro">PANEL 02</span>
              </div>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-cream mb-4">
                COMPLETE IT
              </h3>
              <p className="font-body text-sm text-muted mb-8 leading-relaxed">
                Check it off when finished. Eight amber sparks burst outward. Your attribute XP ticks up.
              </p>

              {/* Quest item row with sage completion */}
              <div className="bg-[#101829] p-5 flex flex-col gap-5 relative">
                <div className="flex items-center justify-between gap-4 bg-[#06070B] p-4 relative">
                  <div className="flex items-center gap-3">
                    {/* Sage checkbox */}
                    <button
                      type="button"
                      onClick={() => setCompleted(!completed)}
                      className={`w-6 h-6 flex items-center justify-center cursor-pointer transition-colors duration-150 border-none ${
                        completed ? "bg-sage" : "bg-[#171C2E]"
                      }`}
                      aria-label="Toggle quest complete"
                    >
                      {completed && (
                        <svg width="12" height="12" viewBox="0 0 12 12" className="pixel-crisp">
                          <rect x="2" y="5" width="2" height="4" fill="#06070B" />
                          <rect x="4" y="7" width="2" height="2" fill="#06070B" />
                          <rect x="6" y="5" width="2" height="2" fill="#06070B" />
                          <rect x="8" y="3" width="2" height="2" fill="#06070B" />
                        </svg>
                      )}
                    </button>
                    <span
                      className={`font-mono text-sm ${
                        completed ? "line-through text-muted" : "text-cream"
                      }`}
                    >
                      Read 20 pages of DDIA
                    </span>
                  </div>

                  <span className="font-micro text-[10px] text-sage tracking-micro">
                    COMPLETED
                  </span>

                  {/* 8 small amber pixel squares bursting outward */}
                  {burstActive && (
                    <div className="pointer-events-none absolute left-6 top-6 z-20">
                      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
                        <span
                          key={i}
                          className="absolute w-[3px] h-[3px] bg-amber"
                          style={{
                            transform: `rotate(${deg}deg) translate(22px) rotate(-${deg}deg)`,
                            animation: "burstParticle 0.7s ease-out forwards",
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* XP Bar beneath advancing with ticking counter */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between font-micro text-[10px] text-muted tracking-micro">
                    <span>INTELLECT PROGRESS</span>
                    <span className="text-amber tabular-nums">{tickingXp} / 500 XP</span>
                  </div>
                  <div className="h-2 w-full bg-[#06070B]">
                    <div
                      className="h-full bg-amber transition-all duration-100"
                      style={{ width: `${(tickingXp / 500) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="font-micro text-[10px] text-muted tracking-micro mt-6">
              SAGE ACCENTS SIGNAL VERIFIED TASK COMPLETION.
            </div>
          </div>

          {/* PANEL 3: THE WORLD CHANGES */}
          <div className="w-full lg:w-[680px] shrink-0 bg-[#0A0F1C]/90 p-8 sm:p-10 flex flex-col justify-between border-none relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="w-3 h-3 bg-amber inline-block pixel-crisp" />
                <span className="font-micro text-xs text-amber tracking-micro">PANEL 03</span>
              </div>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-cream mb-4">
                THE WORLD CHANGES
              </h3>
              <p className="font-body text-sm text-muted mb-6 leading-relaxed">
                Drag the divider below. See the cold desaturated void illuminate into warm lamplight.
              </p>

              {/* Interactive Comparison Slider */}
              <div
                ref={sliderContainerRef}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                className="relative h-[220px] w-full select-none cursor-ew-resize overflow-hidden touch-none"
              >
                {/* WARM RIGHT SIDE (FULL WIDTH BACKGROUND) */}
                <div
                  className="absolute inset-0 p-6 flex flex-col justify-between"
                  style={{
                    backgroundColor: "#2C2128",
                    backgroundImage:
                      "radial-gradient(circle at 80% 50%, rgba(240, 164, 76, 0.35) 0%, transparent 70%)",
                  }}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-micro text-[10px] text-gold tracking-micro">
                      [TIER 3: ASCENDANT]
                    </span>
                    <span className="font-micro text-[10px] text-amber tracking-micro">
                      WORLD LIT
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Lampbearer scale={3} glowing={true} />
                    <div>
                      <div className="font-display text-lg text-cream font-bold">WARM REALM</div>
                      <div className="font-micro text-[9px] text-amber">GOLD SHINES ON ALL QUESTS</div>
                    </div>
                  </div>
                  <div className="font-micro text-[9px] text-muted tracking-micro">
                    ALL INTERFACES WARMED BY PROGRESS
                  </div>
                </div>

                {/* COLD LEFT SIDE (CLIPPED BY SLIDER POSITION) */}
                <div
                  className="absolute inset-0 p-6 flex flex-col justify-between bg-[#06070B]"
                  style={{
                    clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)`,
                    filter: "grayscale(100%) brightness(0.7)",
                  }}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-micro text-[10px] text-muted tracking-micro">
                      [TIER 0: COLD START]
                    </span>
                    <span className="font-micro text-[10px] text-muted tracking-micro">
                      WORLD DARK
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <IdleOne scale={3} />
                    <div>
                      <div className="font-display text-lg text-muted font-bold">DESOLATE VOID</div>
                      <div className="font-micro text-[9px] text-muted">UNLIT LANTERN</div>
                    </div>
                  </div>
                  <div className="font-micro text-[9px] text-muted tracking-micro">
                    STARTING STATE FOR EVERY TRAVELER
                  </div>
                </div>

                {/* DRAGGABLE DIVIDER LINE & HANDLE */}
                <div
                  className="absolute top-0 bottom-0 w-[2px] bg-amber z-30 pointer-events-none"
                  style={{ left: `${sliderPos}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 bg-amber flex items-center justify-center text-void">
                    <svg width="12" height="12" viewBox="0 0 12 12" className="pixel-crisp">
                      <rect x="1" y="5" width="2" height="2" fill="#06070B" />
                      <rect x="9" y="5" width="2" height="2" fill="#06070B" />
                      <rect x="5" y="2" width="2" height="8" fill="#06070B" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="font-micro text-[10px] text-amber tracking-micro mt-6">
              DRAG TO COMPARE THE LIGHT ARC.
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes burstParticle {
          0% {
            opacity: 1;
            transform: translate(0, 0);
          }
          100% {
            opacity: 0;
            transform: translate(var(--tw-translate-x, 16px), 24px);
          }
        }
      `}</style>
    </section>
  );
};
