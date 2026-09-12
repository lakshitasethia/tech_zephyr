"use client";

import React, { useEffect, useRef } from "react";

interface EmberCanvasProps {
  count?: number;
  className?: string;
  style?: React.CSSProperties;
  direction?: "upward" | "radial";
  originX?: number; // 0 to 1
  originY?: number; // 0 to 1
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  maxAlpha: number;
  fadeSpeed: number;
  life: number;
  maxLife: number;
  color: string;
}

export const EmberCanvas: React.FC<EmberCanvasProps> = ({
  count = 60,
  className = "",
  style = {},
  direction = "upward",
  originX = 0.5,
  originY = 0.5,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const colors = ["#F0A44C", "#FFC46B", "#E28B36", "#D97B29"];

    const createParticle = (initRandom = false): Particle => {
      const isRadial = direction === "radial";
      const startX = isRadial ? width * originX : Math.random() * width;
      const startY = isRadial
        ? height * originY
        : initRandom
        ? Math.random() * height
        : height + Math.random() * 20;

      const angle = isRadial ? Math.random() * Math.PI * 2 : 0;
      const speed = isRadial ? 0.3 + Math.random() * 1.2 : 0.4 + Math.random() * 0.9;

      const vx = isRadial ? Math.cos(angle) * speed : (Math.random() - 0.5) * 0.4;
      const vy = isRadial ? Math.sin(angle) * speed : -speed;

      const size = Math.random() > 0.4 ? 2 : 3; // strictly 2px or 3px square, never circle
      const maxAlpha = 0.3 + Math.random() * 0.6;
      const maxLife = 120 + Math.random() * 180;

      return {
        x: startX,
        y: startY,
        vx,
        vy,
        size,
        alpha: initRandom ? Math.random() * maxAlpha : 0,
        maxAlpha,
        fadeSpeed: 0.008 + Math.random() * 0.015,
        life: initRandom ? Math.random() * maxLife : 0,
        maxLife,
        color: colors[Math.floor(Math.random() * colors.length)],
      };
    };

    const particles: Particle[] = Array.from({ length: count }, () => createParticle(true));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (!prefersReducedMotion) {
          p.x += p.vx + (Math.random() - 0.5) * 0.2; // slight turbulence
          p.y += p.vy;
          p.life++;

          // Fade in and out
          if (p.life < p.maxLife * 0.2) {
            p.alpha = Math.min(p.maxAlpha, p.alpha + p.fadeSpeed);
          } else if (p.life > p.maxLife * 0.7) {
            p.alpha = Math.max(0, p.alpha - p.fadeSpeed);
          }

          // Reset if dead or offscreen
          if (p.life >= p.maxLife || p.alpha <= 0 || p.y < -10 || p.x < -10 || p.x > width + 10) {
            particles[i] = createParticle(false);
          }
        }

        // Draw crisp square particle
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [count, direction, originX, originY]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 h-full w-full select-none ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
};
