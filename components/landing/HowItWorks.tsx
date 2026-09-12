"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { IdleOne } from "@/components/sprites/IdleOne";
import { Lampbearer } from "@/components/sprites/Lampbearer";

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

  // Keyboard control for the slider
  const onSliderKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setSliderPos((prev) => Math.max(0, prev - 3));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setSliderPos((prev) => Math.min(100, prev + 3));
      }
    },
    []
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const fullText = "Read 20 pages of DDIA";
    let charIndex = 0;
    let typingInterval: NodeJS.Timeout;
    let panel1Triggered = false;
    let panel2Triggered = false;

    const triggerPanel1 = () => {
      if (panel1Triggered) return;
      panel1Triggered = true;
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
      if (panel2Triggered) return;
      panel2Triggered = true;
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
      const track = trackRef.current;
      const path = pathRef.current;
      if (!track) return;

      // Distance the track has to travel, plus a trailing rest so the last
      // panel settles fully before the section unpins.
      const distance = () =>
        Math.max(0, track.scrollWidth - window.innerWidth + 220);

      // Let GSAP own the transform. Writing style.transform by hand inside
      // onUpdate skips GSAP's interpolation, which is what made this feel
      // steppy, and it forces an un-hinted layout write on every frame.
      track.style.willChange = "transform";

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          // A rest tail at the end so the unpin does not snap straight into
          // the next section.
          end: () => `+=${distance() + window.innerHeight * 0.6}`,
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          // Recompute distances on resize instead of keeping stale numbers.
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (self.progress > 0.08) triggerPanel1();
            if (self.progress > 0.42) triggerPanel2();
          },
        },
      });

      tl.to(track, {
        x: () => -distance(),
        ease: "none",
        force3D: true,
        duration: 1,
      });

      // Draw the connector across the same scrub, on the same timeline, so the
      // two can never drift out of step.
      if (path) {
        const length = path.getTotalLength();
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
        tl.to(path, { strokeDashoffset: 0, ease: "none", duration: 1 }, 0);
      }

      // The rest tail: nothing moves, the last panel simply holds.
      tl.to({}, { duration: 0.28 });

      return () => {
        tl.scrollTrigger?.kill();
        tl.kill();
        track.style.willChange = "";
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
  }, []);

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      tabIndex={-1}
      className="relative py-20 sm:py-24 px-6 sm:px-8 overflow-hidden outline-none"
      aria-label="How It Works"
    >
      {/* Section Header */}
      <div className="max-w-7xl mx-auto w-full mb-12 lg:mb-14">
        <div className="font-micro text-amber tracking-micro mb-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-amber inline-block shrink-0" />
          THE THREE STEPS
        </div>
        <h2 className="font-display text-4xl sm:text-5xl font-bold text-cream">
          HOW IT WORKS
        </h2>
      </div>

      {/* Horizontal Track Container */}
      <div ref={containerRef} className="w-full overflow-visible">
        <div
          ref={trackRef}
          className="flex flex-col lg:flex-row gap-12 lg:gap-16 w-full transition-transform duration-75 ease-out lg:pl-8 lg:pr-16"
        >
          {/* PANEL 1: ADD A QUEST */}
          <div className="w-full lg:w-[560px] lg:min-h-[480px] shrink-0 bg-[#0A0F1C]/90 p-7 sm:p-9 flex flex-col justify-between relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <span className="w-3 h-3 bg-amber inline-block pixel-crisp" style={{ borderRadius: "0px" }} />
                <span className="font-micro text-amber tracking-micro">PANEL 01</span>
              </div>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-cream mb-4">
                ADD A QUEST
              </h3>
              <p className="font-body text-muted mb-8">
                Type the actual work you need to do. Attach an attribute tag. Set the XP weight.
              </p>

              {/* Pixel Styled Input Mock */}
              <div className="bg-[#101829] p-4 sm:p-5 flex flex-col gap-4">
                <div className="font-micro text-muted tracking-micro flex justify-between" style={{ fontSize: "11px" }}>
                  <span>NEW_TASK_ENTRY</span>
                  <span className="text-amber">[ACTIVE]</span>
                </div>

                <div className="flex items-center justify-between gap-3 bg-[#06070B] px-4 py-3 min-h-[48px]">
                  <div className="font-mono text-sm text-cream flex items-center min-w-0">
                    <span className="truncate">{typedText}</span>
                    <span className="inline-block w-2 h-4 bg-amber ml-1 shrink-0 animate-pulse" />
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {tagVisible && (
                      <span className="font-micro bg-[#171C2E] text-steel px-2 py-1 tracking-micro" style={{ fontSize: "11px" }}>
                        INTELLECT
                      </span>
                    )}
                    {xpVisible && (
                      <span className="font-micro bg-amber text-void px-2 py-1 font-bold tracking-micro" style={{ fontSize: "11px" }}>
                        +40 XP
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="font-micro text-muted tracking-micro mt-6" style={{ fontSize: "11px" }}>
              INPUT REFLECTS DIRECT REAL-WORLD OUTPUT.
            </div>
          </div>

          {/* PANEL 2: COMPLETE IT */}
          <div className="w-full lg:w-[560px] lg:min-h-[480px] shrink-0 bg-[#0A0F1C]/90 p-7 sm:p-9 flex flex-col justify-between relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <span className="w-3 h-3 bg-amber inline-block pixel-crisp" style={{ borderRadius: "0px" }} />
                <span className="font-micro text-amber tracking-micro">PANEL 02</span>
              </div>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-cream mb-4">
                COMPLETE IT
              </h3>
              <p className="font-body text-muted mb-8">
                Check it off when finished. Eight amber sparks burst outward. Your attribute XP ticks up.
              </p>

              {/* Quest item row with sage completion */}
              <div className="bg-[#101829] p-4 sm:p-5 flex flex-col gap-5 relative">
                <div className="flex items-center justify-between gap-4 bg-[#06070B] p-4 relative">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Sage checkbox */}
                    <button
                      type="button"
                      onClick={() => setCompleted(!completed)}
                      className={`w-6 h-6 shrink-0 flex items-center justify-center cursor-pointer transition-colors duration-150 border-none ${
                        completed ? "bg-sage" : "bg-[#171C2E]"
                      }`}
                      style={{ borderRadius: "0px" }}
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
                      className={`font-mono text-sm truncate ${
                        completed ? "line-through text-muted" : "text-cream"
                      }`}
                    >
                      Read 20 pages of DDIA
                    </span>
                  </div>

                  <span className="font-micro text-sage tracking-micro shrink-0" style={{ fontSize: "11px" }}>
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
                  <div className="flex justify-between font-micro text-muted tracking-micro" style={{ fontSize: "11px" }}>
                    <span>INTELLECT PROGRESS</span>
                    <span className="text-amber tabular-nums">{tickingXp} / 500 XP</span>
                  </div>
                  <div className="h-2 w-full bg-[#06070B]">
                    <div
                      className="h-full bg-amber transition-all duration-100"
                      style={{ width: `${(tickingXp / 500) * 100}%`, borderRadius: "0px" }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="font-micro text-muted tracking-micro mt-6" style={{ fontSize: "11px" }}>
              SAGE ACCENTS SIGNAL VERIFIED TASK COMPLETION.
            </div>
          </div>

          {/* PANEL 3: THE WORLD CHANGES */}
          <div className="w-full lg:w-[560px] lg:min-h-[480px] shrink-0 bg-[#0A0F1C]/90 p-7 sm:p-9 flex flex-col justify-between relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <span className="w-3 h-3 bg-amber inline-block pixel-crisp" style={{ borderRadius: "0px" }} />
                <span className="font-micro text-amber tracking-micro">PANEL 03</span>
              </div>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-cream mb-4">
                THE WORLD CHANGES
              </h3>
              <p className="font-body text-muted mb-6">
                Drag the divider below. See the cold desaturated void illuminate into warm lamplight.
              </p>

              {/* Interactive Comparison Slider - keyboard operable */}
              <div
                ref={sliderContainerRef}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onKeyDown={onSliderKeyDown}
                role="slider"
                aria-label="Light progression comparison"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(sliderPos)}
                tabIndex={0}
                className="relative h-[220px] w-full select-none cursor-ew-resize overflow-hidden touch-none"
              >
                {/* WARM RIGHT SIDE (FULL WIDTH BACKGROUND) */}
                <div
                  className="absolute inset-0 p-5 sm:p-6 flex flex-col justify-between overflow-hidden"
                  style={{
                    backgroundColor: "#2C2128",
                    backgroundImage:
                      "radial-gradient(circle at 80% 50%, rgba(240, 164, 76, 0.35) 0%, transparent 70%)",
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                  }}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-micro text-gold tracking-micro" style={{ fontSize: "11px" }}>
                      [TIER 3: ASCENDANT]
                    </span>
                    <span className="font-micro text-amber tracking-micro" style={{ fontSize: "11px" }}>
                      WORLD LIT
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Lampbearer scale={3} glowing={true} />
                    <div>
                      <div className="font-display text-lg text-cream font-bold">WARM REALM</div>
                      <div className="font-micro text-amber" style={{ fontSize: "10px" }}>GOLD SHINES ON ALL QUESTS</div>
                    </div>
                  </div>
                  <div className="font-micro text-muted tracking-micro" style={{ fontSize: "10px" }}>
                    ALL INTERFACES WARMED BY PROGRESS
                  </div>
                </div>

                {/* COLD LEFT SIDE (CLIPPED BY SLIDER POSITION) */}
                <div
                  className="absolute inset-0 p-5 sm:p-6 flex flex-col justify-between bg-[#06070B]"
                  style={{
                    clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)`,
                    filter: "grayscale(100%) brightness(0.7)",
                    willChange: "clip-path",
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                  }}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-micro text-muted tracking-micro" style={{ fontSize: "11px" }}>
                      [TIER 0: COLD START]
                    </span>
                    <span className="font-micro text-muted tracking-micro" style={{ fontSize: "11px" }}>
                      WORLD DARK
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <IdleOne scale={3} />
                    <div>
                      <div className="font-display text-lg text-muted font-bold">DESOLATE VOID</div>
                      <div className="font-micro text-muted" style={{ fontSize: "10px" }}>UNLIT LANTERN</div>
                    </div>
                  </div>
                  <div className="font-micro text-muted tracking-micro" style={{ fontSize: "10px" }}>
                    STARTING STATE FOR EVERY TRAVELER
                  </div>
                </div>

                {/* DRAGGABLE DIVIDER LINE & HANDLE */}
                <div
                  className="absolute top-0 bottom-0 w-[2px] bg-amber z-30 pointer-events-none"
                  style={{ left: `${sliderPos}%` }}
                >
                  <div
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 bg-amber flex items-center justify-center text-void"
                    style={{ borderRadius: "0px" }}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" className="pixel-crisp">
                      <rect x="1" y="5" width="2" height="2" fill="#06070B" />
                      <rect x="9" y="5" width="2" height="2" fill="#06070B" />
                      <rect x="5" y="2" width="2" height="8" fill="#06070B" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="font-micro text-amber tracking-micro mt-6" style={{ fontSize: "11px" }}>
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
