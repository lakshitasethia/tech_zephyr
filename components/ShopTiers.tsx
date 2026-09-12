"use client";

import React, { useRef } from "react";
import { Lampbearer } from "./sprites/Lampbearer";
import { IdleOne } from "./sprites/IdleOne";

interface TierInfo {
  tier: string;
  name: string;
  cost: string;
  desc: string;
  unlocked: boolean;
  bgTint: string;
  glow: string;
}

export const ShopTiers: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const tiers: TierInfo[] = [
    {
      tier: "TIER 0",
      name: "COLD START",
      cost: "FREE",
      desc: "Near monochrome. One weak lamp.",
      unlocked: true,
      bgTint: "#0A0F1C",
      glow: "rgba(255, 255, 255, 0.03)",
    },
    {
      tier: "TIER 1",
      name: "LAMPLIGHT",
      cost: "400 GOLD",
      desc: "Amber enters. Ink deepens.",
      unlocked: true,
      bgTint: "#171C2E",
      glow: "rgba(240, 164, 76, 0.12)",
    },
    {
      tier: "TIER 2",
      name: "BLOOM",
      cost: "1,200 GOLD",
      desc: "Sage and rose accents. Ambient embers.",
      unlocked: false,
      bgTint: "#221E2E",
      glow: "rgba(143, 174, 147, 0.18)",
    },
    {
      tier: "TIER 3",
      name: "ASCENDANT",
      cost: "3,000 GOLD",
      desc: "Full warmth. Gold leaf. Volumetric light.",
      unlocked: false,
      bgTint: "#2C2128",
      glow: "rgba(255, 196, 107, 0.28)",
    },
  ];

  return (
    <section
      id="the-shop"
      className="relative min-h-screen py-28 px-6 sm:px-8 overflow-hidden flex flex-col justify-center"
      aria-label="The Shop and Tiers"
    >
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="mb-16 max-w-2xl">
          <div className="font-micro text-amber text-[11px] tracking-micro mb-3 uppercase flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-amber inline-block shrink-0" />
            THE VISUAL PROGRESSION
          </div>
          <h2 className="font-display text-4xl sm:text-6xl font-bold text-cream mb-6">
            BUY THE LIGHT BACK
          </h2>
          <p className="font-body text-base sm:text-lg text-muted leading-relaxed">
            Gold earned from real work unlocks visual tiers. The entire interface
            warms as you progress. You do not purchase decorative trinkets. You
            illuminate the world you inhabit.
          </p>
        </div>

        {/* 4 Tier Cards on a diagonal ascending rightward */}
        <div
          ref={containerRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 items-end pt-8 pb-12"
        >
          {tiers.map((t, idx) => {
            // Diagonal offset style for desktop
            const desktopOffset = `lg:translate-y-[${(3 - idx) * 32}px]`;

            return (
              <div
                key={t.tier}
                className={`relative flex flex-col justify-between p-6 sm:p-7 select-none transition-all duration-300 ${
                  t.unlocked ? "" : "opacity-75 grayscale-[60%]"
                }`}
                style={{
                  backgroundColor: t.bgTint,
                  boxShadow: `0 20px 40px -15px ${t.glow}`,
                  transform: `translateY(${typeof window !== "undefined" && window.innerWidth >= 1024 ? (3 - idx) * 32 : 0}px)`,
                }}
              >
                {/* Top: Tier badge, Cost, and Lock Status */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <span className="font-micro text-[10px] text-amber tracking-micro block">
                      {t.tier}
                    </span>
                    <span className="font-display text-lg font-bold text-cream">
                      {t.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-micro text-[11px] text-gold tracking-micro">
                      {t.cost}
                    </span>
                    {!t.unlocked && (
                      <div className="p-1 bg-[#101829]" title="Locked tier">
                        {/* Pixel Padlock SVG */}
                        <svg
                          width="12"
                          height="14"
                          viewBox="0 0 12 14"
                          className="pixel-crisp"
                          aria-hidden="true"
                        >
                          <rect x="3" y="1" width="6" height="6" fill="none" stroke="#9D9385" strokeWidth="2" />
                          <rect x="1" y="6" width="10" height="7" fill="#9D9385" />
                          <rect x="5" y="8" width="2" height="3" fill="#06070B" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>

                {/* Live Miniature Dashboard Preview */}
                <div className="relative bg-[#06070B]/80 p-4 mb-6 flex flex-col gap-3 min-h-[160px] justify-between overflow-hidden">
                  {/* Subtle inner cast light */}
                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background: `radial-gradient(circle at 50% 30%, ${t.glow} 0%, transparent 80%)`,
                    }}
                    aria-hidden="true"
                  />

                  {/* Miniature Top Bar */}
                  <div className="flex items-center justify-between font-micro text-[9px] text-muted tracking-micro relative z-10">
                    <span className="flex items-center gap-1.5">
                      <span
                        className="w-1.5 h-1.5 inline-block"
                        style={{
                          backgroundColor:
                            idx === 0
                              ? "#49566A"
                              : idx === 1
                              ? "#F0A44C"
                              : idx === 2
                              ? "#8FAE93"
                              : "#FFC46B",
                        }}
                      />
                      LVL {12 + idx * 8}
                    </span>
                    <span className="text-cream tabular-nums">
                      {(idx + 1) * 1420} XP
                    </span>
                  </div>

                  {/* Miniature Central Sprite / Graphic */}
                  <div className="flex items-center justify-center my-1 relative z-10">
                    {idx === 0 ? (
                      <IdleOne scale={2} />
                    ) : (
                      <Lampbearer scale={2} glowing={idx >= 2} />
                    )}
                  </div>

                  {/* Miniature Quests List */}
                  <div className="flex flex-col gap-1.5 relative z-10">
                    <div className="flex items-center justify-between text-[10px] bg-[#101829]/60 px-2 py-1">
                      <span className="font-mono text-cream truncate max-w-[110px]">
                        {idx === 0
                          ? "Faint Candle"
                          : idx === 1
                          ? "Morning Run"
                          : idx === 2
                          ? "Deep Focus Session"
                          : "Mastery Campaign"}
                      </span>
                      <span
                        className="font-micro text-[8px]"
                        style={{
                          color:
                            idx === 0
                              ? "#9D9385"
                              : idx === 1
                              ? "#F0A44C"
                              : idx === 2
                              ? "#8FAE93"
                              : "#FFC46B",
                        }}
                      >
                        +{20 + idx * 25} XP
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="font-body text-xs text-muted leading-normal">
                  {t.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
