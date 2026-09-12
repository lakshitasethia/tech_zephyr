"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

// Ensure GSAP plugins are registered on client
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Named custom eases
export const EASES = {
  pixelSnap: "steps(1, end)",
  amberDraw: "cubic-bezier(0.22, 1, 0.36, 1)",
  magneticSpring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  wardenPound: "cubic-bezier(0.8, 0, 0.2, 1)",
  smoothPalette: "cubic-bezier(0.45, 0, 0.55, 1)",
};

/**
 * Initializes Lenis smooth scrolling and synchronizes it with GSAP ScrollTrigger ticker.
 */
export function initSmoothScroll(): { lenis: Lenis | null; destroy: () => void } {
  if (typeof window === "undefined") {
    return { lenis: null, destroy: () => {} };
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) {
    return { lenis: null, destroy: () => {} };
  }

  const lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: "vertical",
    gestureOrientation: "vertical",
    smoothWheel: true,
  });

  const tickerCallback = (time: number) => {
    lenis.raf(time * 1000);
  };

  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add(tickerCallback);
  gsap.ticker.lagSmoothing(0);

  return {
    lenis,
    destroy: () => {
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
    },
  };
}

/**
 * Background color interpolation across the entire page.
 * Seamlessly transitions the fixed #global-background-canvas background color.
 */
export function initBackgroundTransitions() {
  if (typeof window === "undefined") return;

  const bgCanvas = document.getElementById("global-background-canvas");
  if (!bgCanvas) return;

  const sections = [
    { id: "hero", color: "#06070B" }, // --void
    { id: "how-it-works", color: "#0A0F1C" }, // --ink
    { id: "the-shop", color: "#171C2E" }, // --slate
    { id: "attributes", color: "#221E2E" }, // --plum
    { id: "campaigns", color: "#2C2128" }, // --warm
    { id: "final-cta", color: "#38271C" }, // --ember
    { id: "footer", color: "#0A0B10" }, // --closing
  ];

  // Set initial
  gsap.set(bgCanvas, { backgroundColor: sections[0].color });

  sections.forEach((sec, i) => {
    if (i === 0) return;
    const targetElement = document.getElementById(sec.id);
    if (!targetElement) return;

    ScrollTrigger.create({
      trigger: targetElement,
      start: "top 75%",
      end: "top 25%",
      scrub: 0.5,
      onUpdate: (self) => {
        const prevColor = sections[i - 1].color;
        const nextColor = sec.color;
        // Interpolate colors smoothly
        const interpolated = gsap.utils.interpolate(prevColor, nextColor, self.progress);
        bgCanvas.style.backgroundColor = interpolated;
      },
    });
  });
}

/**
 * Magnetic button hover effect.
 * Translates toward the cursor up to max 6px, and springs back on leave.
 */
export function attachMagneticHover(element: HTMLElement, maxDistance: number = 6) {
  if (!element || typeof window === "undefined") return () => {};

  const onMouseMove = (e: MouseEvent) => {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = Math.max(-maxDistance, Math.min(maxDistance, (e.clientX - centerX) * 0.25));
    const deltaY = Math.max(-maxDistance, Math.min(maxDistance, (e.clientY - centerY) * 0.25));

    gsap.to(element, {
      x: deltaX,
      y: deltaY,
      duration: 0.18,
      ease: "power1.out",
    });
  };

  const onMouseLeave = () => {
    gsap.to(element, {
      x: 0,
      y: 0,
      duration: 0.4,
      ease: "elastic.out(1, 0.4)",
    });
  };

  element.addEventListener("mousemove", onMouseMove);
  element.addEventListener("mouseleave", onMouseLeave);

  return () => {
    element.removeEventListener("mousemove", onMouseMove);
    element.removeEventListener("mouseleave", onMouseLeave);
  };
}
