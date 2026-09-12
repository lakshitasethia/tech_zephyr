"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Snapping character-level reveal for headings.
 * Staggers by 25ms, snaps into position on a single frame offset without easing/blur.
 */
export function initCharacterReveal(
  container: HTMLElement,
  triggerElement?: HTMLElement
) {
  if (typeof window === "undefined" || !container) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) {
    return;
  }

  const chars = container.querySelectorAll<HTMLElement>(".char-snap");
  if (chars.length === 0) return;

  // Initial set (visible by default in HTML for SEO/no-JS, but prepped here)
  gsap.set(chars, { y: 16, opacity: 0 });

  ScrollTrigger.create({
    trigger: triggerElement || container,
    start: "top 85%",
    once: true,
    onEnter: () => {
      gsap.to(chars, {
        y: 0,
        opacity: 1,
        stagger: 0.025,
        duration: 0.04, // Snaps in 1 frame
        ease: "steps(1, end)",
      });
    },
  });
}

/**
 * Ticking numeric counter tween that ticks up rather than sliding smoothly.
 */
export function initCounterTween(
  element: HTMLElement,
  targetValue: number,
  prefix: string = "",
  suffix: string = "",
  duration: number = 1.4
) {
  if (typeof window === "undefined" || !element) return;

  const obj = { val: 0 };
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion) {
    element.textContent = `${prefix}${targetValue.toLocaleString()}${suffix}`;
    return;
  }

  ScrollTrigger.create({
    trigger: element,
    start: "top 90%",
    once: true,
    onEnter: () => {
      gsap.to(obj, {
        val: targetValue,
        duration: duration,
        ease: "steps(20, end)", // Ticks discrete integer increments
        onUpdate: () => {
          element.textContent = `${prefix}${Math.round(obj.val).toLocaleString()}${suffix}`;
        },
      });
    },
  });
}
