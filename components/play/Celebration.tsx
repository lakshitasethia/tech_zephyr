"use client";

import { useEffect, useRef } from "react";

/**
 * Level up moment. Canvas particles rather than DOM nodes so a burst of 90
 * squares costs one paint instead of 90 layout passes.
 * Fully skipped when the user prefers reduced motion.
 */
export default function Celebration({
  level,
  onDone,
}: {
  level: number;
  onDone: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = setTimeout(onDone, reduced ? 1200 : 2600);
    if (reduced) return () => clearTimeout(timer);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return () => clearTimeout(timer);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    ctx.scale(dpr, dpr);

    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    const colors = ["#F0A44C", "#FFC46B", "#F2ECE2", "#8FAE93"];
    const parts = Array.from({ length: 90 }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 6;
      return {
        x: w / 2,
        y: h / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        size: 2 + Math.floor(Math.random() * 3),
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1,
      };
    });

    let raf = 0;
    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      let alive = false;
      for (const p of parts) {
        if (p.life <= 0) continue;
        alive = true;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.14;
        p.vx *= 0.99;
        p.life -= 0.012;
        ctx.globalAlpha = Math.max(p.life, 0);
        ctx.fillStyle = p.color;
        // Squares, never circles. Pixel aesthetic.
        ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
      }
      ctx.globalAlpha = 1;
      if (alive) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [onDone]);

  return (
    <div
      role="status"
      aria-live="assertive"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--void)]/80 backdrop-blur-sm"
      onClick={onDone}
    >
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />
      <div className="relative text-center">
        <p className="font-micro text-[var(--amber)]">Level up</p>
        <p className="font-display mt-2 text-7xl text-[var(--cream)] tabular-nums">
          {level}
        </p>
        <p className="font-body mt-3 text-sm">Tap anywhere to continue</p>
      </div>
    </div>
  );
}
