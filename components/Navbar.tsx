"use client";

import React, { useEffect, useState, useRef } from "react";
import { attachMagneticHover } from "@/lib/animations/gsapSetup";

interface NavbarProps {
  onStartQuest?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onStartQuest }) => {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("hero");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const questBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setScrolled(scrollY > 80);

      const sections = ["how-it-works", "the-shop", "attributes", "campaigns"];
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 240 && rect.bottom >= 120) {
            setActiveSection(sections[i]);
            return;
          }
        }
      }
      if (scrollY < 300) {
        setActiveSection("hero");
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (questBtnRef.current) {
      const cleanup = attachMagneticHover(questBtnRef.current, 5);
      return cleanup;
    }
  }, []);

  const navLinks = [
    { name: "HOW IT WORKS", href: "#how-it-works", id: "how-it-works" },
    { name: "QUESTS", href: "#how-it-works", id: "quests" },
    { name: "THE SHOP", href: "#the-shop", id: "the-shop" },
    { name: "ATTRIBUTES", href: "#attributes", id: "attributes" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? "backdrop-blur-md bg-[#0A0F1C]/70 py-3.5"
          : "bg-transparent py-5"
      }`}
      style={{
        border: "none",
        outline: "none",
        boxShadow: "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 flex items-center justify-between">
        {/* Left: Wordmark with 6px amber square bullet */}
        <a
          href="#"
          className="flex items-center gap-2.5 text-cream hover:text-amber transition-colors duration-150 focus-visible:outline-amber"
          aria-label="Life RPG Home"
        >
          {/* 6px amber square bullet */}
          <span
            className="w-[6px] h-[6px] bg-amber inline-block shrink-0 pixel-crisp"
            style={{ borderRadius: "0px" }}
            aria-hidden="true"
          />
          <span className="font-display text-xl sm:text-2xl font-bold tracking-wider">
            LIFE RPG
          </span>
        </a>

        {/* Center: Desktop links in Silkscreen uppercase */}
        <nav
          className="hidden md:flex items-center gap-8 lg:gap-10"
          aria-label="Main Navigation"
        >
          {navLinks.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <a
                key={link.name}
                href={link.href}
                className={`font-micro text-[11px] tracking-micro nav-link-draw ${
                  isActive ? "active" : ""
                }`}
              >
                {link.name}
              </a>
            );
          })}
        </nav>

        {/* Right: LOG IN & START A QUEST */}
        <div className="hidden md:flex items-center gap-6">
          <a
            href="#hero"
            className="font-micro text-[11px] tracking-micro text-muted hover:text-cream transition-colors duration-150 focus-visible:outline-amber"
          >
            LOG IN
          </a>
          <button
            ref={questBtnRef}
            type="button"
            onClick={onStartQuest}
            className="pixel-btn-amber font-micro text-[11px] tracking-micro"
          >
            START A QUEST
          </button>
        </div>

        {/* Mobile menu trigger: 2 by 2 pixel square grid glyph */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-amber focus-visible:outline-amber bg-transparent border-none cursor-pointer"
          aria-label="Toggle Navigation Menu"
          aria-expanded={mobileMenuOpen}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            className="pixel-crisp"
            aria-hidden="true"
          >
            <rect x="2" y="2" width="5" height="5" fill="#F0A44C" />
            <rect x="11" y="2" width="5" height="5" fill="#F0A44C" />
            <rect x="2" y="11" width="5" height="5" fill="#F0A44C" />
            <rect x="11" y="11" width="5" height="5" fill="#F0A44C" />
          </svg>
        </button>
      </div>

      {/* Mobile full-screen overlay that wipes in from right with clip-path */}
      <div
        id="mobile-nav"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation"
        className={`fixed inset-0 z-50 bg-ink/95 backdrop-blur-xl flex flex-col justify-between p-8 transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] md:hidden ${
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{
          clipPath: mobileMenuOpen
            ? "polygon(0 0, 100% 0, 100% 100%, 0 100%)"
            : "polygon(100% 0, 100% 0, 100% 100%, 100% 100%)",
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-[6px] h-[6px] bg-amber inline-block" />
            <span className="font-display text-xl font-bold">LIFE RPG</span>
          </div>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="font-micro text-xs text-muted hover:text-amber p-2 bg-transparent border-none"
            aria-label="Close Navigation"
          >
            [ CLOSE ]
          </button>
        </div>

        <nav className="flex flex-col gap-6 my-auto">
          {navLinks.map((link, idx) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="font-display text-2xl text-cream hover:text-amber transition-colors"
              style={{ transitionDelay: `${idx * 50}ms` }}
            >
              {link.name}
            </a>
          ))}
        </nav>

        <div className="flex flex-col gap-4">
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              onStartQuest?.();
            }}
            className="pixel-btn-amber w-full py-4 text-center"
          >
            START A QUEST
          </button>
          <a
            href="#hero"
            onClick={() => setMobileMenuOpen(false)}
            className="font-micro text-center text-xs text-muted hover:text-cream py-2"
          >
            LOG IN
          </a>
        </div>
      </div>
    </header>
  );
};
