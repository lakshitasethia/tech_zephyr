"use client";

import React, { useEffect, useRef, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface AttributeData {
  name: string;
  category: string;
  totalBlocks: number;
  filledBlocks: number;
  value: number;
  color: string;
}

export const Attributes: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const [revealedIndex, setRevealedIndex] = useState<number>(0);

  const attributes: AttributeData[] = [
    {
      name: "INTELLECT",
      category: "Reading, research, coding, writing.",
      totalBlocks: 24,
      filledBlocks: 18,
      value: 78,
      color: "#7D8FB3", // Steel
    },
    {
      name: "STRENGTH",
      category: "Weightlifting, endurance, recovery, sleep.",
      totalBlocks: 24,
      filledBlocks: 14,
      value: 62,
      color: "#C98A7F", // Rose
    },
    {
      name: "DISCIPLINE",
      category: "Consistency, zero missed days, habit tracking.",
      totalBlocks: 24,
      filledBlocks: 21,
      value: 89,
      color: "#F0A44C", // Amber
    },
    {
      name: "SPIRIT",
      category: "Meditation, solitude, community, recharge.",
      totalBlocks: 24,
      filledBlocks: 16,
      value: 71,
      color: "#8FAE93", // Sage
    },
  ];

  useEffect(() => {
    if (typeof window === "undefined" || !sectionRef.current) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setRevealedIndex(4);
      return;
    }

    const trigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top 75%",
      once: true,
      onEnter: () => {
        let count = 0;
        const interval = setInterval(() => {
          count++;
          setRevealedIndex(count);
          if (count >= 4) {
            clearInterval(interval);
          }
        }, 90); // 90ms stagger
      },
    });

    return () => trigger.kill();
  }, []);

  return (
    <section
      id="attributes"
      ref={sectionRef}
      className="relative min-h-screen py-28 px-6 sm:px-8 overflow-hidden flex flex-col justify-center"
      aria-label="Attributes System"
    >
      <div className="max-w-7xl mx-auto w-full">
        {/* Section Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end mb-20 sm:mb-24">
          <div className="lg:col-span-7">
            <div className="font-micro text-amber tracking-micro mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-amber inline-block shrink-0" />
              CHARACTER CORE
            </div>
            <h2 className="font-display text-4xl sm:text-6xl font-bold text-cream">
              FOUR ATTRIBUTES
            </h2>
          </div>

          <div className="lg:col-span-5">
            <p className="font-body text-muted">
              Quest categories feed specific attributes directly. You do not
              level up an abstract score. Your discipline rises when you hold
              your habits. Your intellect grows when you read difficult texts.
            </p>
          </div>
        </div>

        {/* Four Horizontal Rows */}
        <div className="flex flex-col gap-6 sm:gap-8">
          {attributes.map((attr, idx) => {
            const isRevealed = revealedIndex > idx;
            const currentFill = isRevealed ? attr.filledBlocks : 0;

            return (
              <div
                key={attr.name}
                className="bg-[#0A0F1C]/70 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                {/* Left: Silkscreen Name & Subtext */}
                <div className="md:w-48 shrink-0">
                  <div className="font-micro text-sm tracking-micro text-cream uppercase font-bold mb-1">
                    {attr.name}
                  </div>
                  <div className="font-mono text-[11px] text-muted">
                    {attr.category}
                  </div>
                </div>

                {/* Middle: Segmented Pixel Bar (discrete 8px blocks with 2px gaps) */}
                <div className="flex-1 flex items-center overflow-x-auto py-2">
                  <div className="flex items-center gap-[2px] select-none">
                    {Array.from({ length: attr.totalBlocks }).map((_, blockIdx) => {
                      const isBlockFilled = blockIdx < currentFill;
                      return (
                        <div
                          key={blockIdx}
                          className="w-[10px] h-[24px] transition-colors duration-75 pixel-crisp"
                          style={{
                            backgroundColor: isBlockFilled ? attr.color : "#101829",
                            opacity: isBlockFilled ? 1 : 0.4,
                          }}
                          aria-hidden="true"
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Right: Value in Pixelify Sans */}
                <div className="md:w-24 text-left md:text-right shrink-0">
                  <span className="font-display text-3xl sm:text-4xl font-bold text-cream tabular-nums">
                    {isRevealed ? attr.value : 0}
                  </span>
                  <span className="font-micro text-[10px] text-muted ml-1 tracking-micro">
                    LVL
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
