"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { Lampbearer } from "@/components/sprites/Lampbearer";
import { IdleOne } from "@/components/sprites/IdleOne";
import { initCharacterReveal } from "@/lib/animations/textReveals";

interface TierInfo {
  tier: string;
  name: string;
  cost: string;
  costNum: number;
  desc: string;
  unlocked: boolean;
  bgTint: string;
  glow: string;
  accent: string;
}

export const ShopTiers: React.FC = () => {
  const [isDesktop, setIsDesktop] = useState(false);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const canHoverRef = useRef(false);
  const [revealPos, setRevealPos] = useState({ x: 0.5, y: 0.5 });
  const tier0Ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check);

    canHoverRef.current = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    // Character reveal on heading
    if (headingRef.current) {
      initCharacterReveal(headingRef.current);
    }

    return () => window.removeEventListener("resize", check);
  }, []);

  // Tier 0 cursor reveal - track pointer position over the card
  const handleTier0Move = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!tier0Ref.current || !canHoverRef.current) return;
    const rect = tier0Ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setRevealPos({ x, y });
  }, []);

  const tiers: TierInfo[] = [
    {
      tier: "TIER 0",
      name: "COLD START",
      cost: "FREE",
      costNum: 0,
      desc: "Near monochrome. One weak lamp. The world is barely visible.",
      unlocked: true,
      bgTint: "#0A0F1C",
      glow: "rgba(255, 255, 255, 0.03)",
      accent: "#49566A",
    },
    {
      tier: "TIER 1",
      name: "LAMPLIGHT",
      cost: "25 GOLD",
      costNum: 25,
      desc: "Amber enters. Ink deepens. Quests begin to glow.",
      unlocked: true,
      bgTint: "#131A2C",
      glow: "rgba(240, 164, 76, 0.14)",
      accent: "#F0A44C",
    },
    {
      tier: "TIER 2",
      name: "BLOOM",
      cost: "75 GOLD",
      costNum: 75,
      desc: "Sage and rose accents appear. Ambient embers drift.",
      unlocked: false,
      bgTint: "#1E1B2A",
      glow: "rgba(143, 174, 147, 0.20)",
      accent: "#8FAE93",
    },
    {
      tier: "TIER 3",
      name: "ASCENDANT",
      cost: "150 GOLD",
      costNum: 150,
      desc: "Full warmth. Gold leaf. Volumetric light on every surface.",
      unlocked: false,
      bgTint: "#2C2128",
      glow: "rgba(255, 196, 107, 0.30)",
      accent: "#FFC46B",
    },
  ];

  return (
    <section
      id="the-shop"
      tabIndex={-1}
      className="relative py-24 sm:py-28 px-6 sm:px-8 overflow-hidden outline-none"
      aria-label="The Shop and Tiers"
    >
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="mb-14 max-w-2xl">
          <div className="font-micro text-amber tracking-micro mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-amber inline-block shrink-0" />
            THE VISUAL PROGRESSION
          </div>
          <h2
            ref={headingRef}
            className="font-display text-4xl sm:text-6xl font-bold text-cream mb-6"
          >
            {"BUY THE LIGHT BACK".split("").map((char, i) => (
              <span key={i} className="char-snap inline-block">
                {char === " " ? "\u00A0" : char}
              </span>
            ))}
          </h2>
          <p className="font-body text-muted">
            Gold earned from real work unlocks visual tiers. The entire interface
            warms as you progress. You do not purchase decorative trinkets. You
            illuminate the world you inhabit.
          </p>
        </div>

        {/* 4 Tier Cards on a diagonal ascending rightward */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-5 items-end pt-4 pb-8"
        >
          {tiers.map((t, idx) => {
            const offset = isDesktop ? (3 - idx) * 28 : 0;
            const isTier0 = idx === 0;

            return (
              <div
                key={t.tier}
                ref={isTier0 ? tier0Ref : undefined}
                onMouseMove={isTier0 ? handleTier0Move : undefined}
                className={`relative flex flex-col justify-between p-6 sm:p-7 select-none transition-all duration-300 ${
                  t.unlocked ? "" : "opacity-60 grayscale-[70%]"
                }`}
                style={{
                  backgroundColor: t.bgTint,
                  boxShadow: `0 20px 40px -15px ${t.glow}`,
                  transform: `translateY(${offset}px)`,
                  borderLeft: `2px solid ${t.accent}`,
                }}
              >
                {/* Tier 0 cursor reveal mask (desktop only) */}
                {isTier0 && canHoverRef.current && (
                  <div
                    className="pointer-events-none absolute inset-0 z-20"
                    style={{
                      background: "radial-gradient(circle at 50% 30%, rgba(240, 164, 76, 0.12) 0%, transparent 60%)",
                      maskImage: `radial-gradient(circle 80px at ${revealPos.x * 100}% ${revealPos.y * 100}%, black 0%, transparent 100%)`,
                      WebkitMaskImage: `radial-gradient(circle 80px at ${revealPos.x * 100}% ${revealPos.y * 100}%, black 0%, transparent 100%)`,
                    }}
                    aria-hidden="true"
                  />
                )}

                {/* Top: Tier badge, Cost, and Lock Status */}
                <div className="flex items-start justify-between mb-5 gap-2">
                  <div className="flex flex-col">
                    <span className="font-micro tracking-micro" style={{ fontSize: "11px", color: t.accent }}>
                      {t.tier}
                    </span>
                    <span className="font-display text-xl font-bold text-cream mt-1">
                      {t.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pt-1">
                    <span className="font-micro text-gold tracking-micro" style={{ fontSize: "12px" }}>
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
                <div className="relative bg-[#06070B]/80 p-4 mb-5 flex flex-col gap-3 min-h-[180px] justify-between overflow-hidden">
                  {/* Subtle inner cast light */}
                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background: `radial-gradient(circle at 50% 30%, ${t.glow} 0%, transparent 80%)`,
                    }}
                    aria-hidden="true"
                  />

                  {/* Miniature Top Bar */}
                  <div className="flex items-center justify-between font-micro text-muted tracking-micro relative z-10" style={{ fontSize: "10px" }}>
                    <span className="flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 inline-block"
                        style={{
                          backgroundColor: t.accent,
                          borderRadius: "0px",
                        }}
                      />
                      LVL {12 + idx * 8}
                    </span>
                    <span className="text-cream tabular-nums">
                      {(idx + 1) * 1420} XP
                    </span>
                  </div>

                  {/* Miniature Central Sprite / Graphic */}
                  <div className="flex items-center justify-center my-2 relative z-10">
                    {idx === 0 ? (
                      <IdleOne scale={3} />
                    ) : (
                      <Lampbearer scale={3} glowing={idx >= 2} />
                    )}
                  </div>

                  {/* Miniature Quests List */}
                  <div className="flex flex-col gap-1.5 relative z-10">
                    <div className="flex items-center justify-between bg-[#101829]/60 px-2 py-1.5" style={{ fontSize: "11px" }}>
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
                        className="font-micro"
                        style={{
                          fontSize: "9px",
                          color: t.accent,
                        }}
                      >
                        +{20 + idx * 25} XP
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tier 0 reveal label (desktop only) */}
                {isTier0 && canHoverRef.current && (
                  <div className="font-micro text-muted tracking-micro text-center mb-2" style={{ fontSize: "10px" }}>
                    MOVE YOUR CURSOR
                  </div>
                )}

                {/* Description */}
                <p className="font-body text-muted" style={{ fontSize: "14px", lineHeight: "1.6" }}>
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
