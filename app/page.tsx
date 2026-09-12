"use client";

import React, { useEffect, useState } from "react";
import { Preloader } from "@/components/landing/Preloader";
import { Cinematic } from "@/components/landing/Cinematic";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { ShopTiers } from "@/components/landing/ShopTiers";
import { Attributes } from "@/components/landing/Attributes";
import { Campaigns } from "@/components/landing/Campaigns";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";
import { initSmoothScroll, initBackgroundTransitions } from "@/lib/animations/gsapSetup";

export default function LandingPage() {
  const [preloaderDone, setPreloaderDone] = useState(false);
  const [cinematicDone, setCinematicDone] = useState(false);

  useEffect(() => {
    // Check if cinematic was previously seen in this session
    if (typeof window !== "undefined" && sessionStorage.getItem("liferpg_cinematic_seen") === "true") {
      setCinematicDone(true);
    }
  }, []);

  useEffect(() => {
    // Initialize Lenis smooth scroll and background palette interpolation
    const { destroy } = initSmoothScroll();
    initBackgroundTransitions();

    return () => {
      destroy();
    };
  }, []);

  const handleStartQuest = () => {
    const target = document.getElementById("how-it-works");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <main className="relative min-h-screen text-cream overflow-x-hidden selection:bg-amber selection:text-void">
      {/* 0. Preloader */}
      {!preloaderDone && (
        <Preloader onComplete={() => setPreloaderDone(true)} />
      )}

      {/* 1. Cinematic Opening (4s, skippable) */}
      {preloaderDone && !cinematicDone && (
        <Cinematic onComplete={() => setCinematicDone(true)} />
      )}

      {/* 2. Navbar */}
      <Navbar onStartQuest={handleStartQuest} />

      {/* 3. Hero */}
      <Hero onStartQuest={handleStartQuest} />

      {/* 4. How It Works (Pinned Horizontal Scroll) */}
      <HowItWorks />

      {/* 5. The Shop and Tiers */}
      <ShopTiers />

      {/* 6. Attributes */}
      <Attributes />

      {/* 7. Campaigns and the Warden */}
      <Campaigns />

      {/* 8. Final Call to Action */}
      <FinalCTA onStartQuest={handleStartQuest} />

      {/* 9. Footer */}
      <Footer />
    </main>
  );
}
