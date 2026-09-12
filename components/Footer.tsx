import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer
      id="footer"
      className="relative z-10 bg-[#0A0B10] pt-20 pb-16 px-6 sm:px-8 border-none select-none"
      aria-label="Site Footer"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16">
          {/* Wordmark at left with the 6px amber square bullet */}
          <div className="md:col-span-5 flex flex-col items-start gap-4">
            <div className="flex items-center gap-2.5">
              <span
                className="w-[6px] h-[6px] bg-amber inline-block shrink-0 pixel-crisp"
                aria-hidden="true"
              />
              <span className="font-display text-2xl font-bold text-cream">
                LIFE RPG
              </span>
            </div>
            <p className="font-body text-sm text-muted max-w-[36ch] leading-relaxed">
              Turns everyday real output into tangible progression. Buy the light back.
            </p>
          </div>

          {/* Three plain text columns of links */}
          <div className="md:col-span-7 grid grid-cols-3 gap-8">
            <div className="flex flex-col gap-3">
              <div className="font-micro text-[10px] text-amber tracking-micro">
                SYSTEM
              </div>
              <a
                href="#how-it-works"
                className="font-mono text-xs text-muted hover:text-cream transition-colors duration-150 py-1"
              >
                How It Works
              </a>
              <a
                href="#attributes"
                className="font-mono text-xs text-muted hover:text-cream transition-colors duration-150 py-1"
              >
                Attributes
              </a>
              <a
                href="#campaigns"
                className="font-mono text-xs text-muted hover:text-cream transition-colors duration-150 py-1"
              >
                Campaigns
              </a>
            </div>

            <div className="flex flex-col gap-3">
              <div className="font-micro text-[10px] text-amber tracking-micro">
                ECONOMY
              </div>
              <a
                href="#the-shop"
                className="font-mono text-xs text-muted hover:text-cream transition-colors duration-150 py-1"
              >
                The Shop
              </a>
              <a
                href="#the-shop"
                className="font-mono text-xs text-muted hover:text-cream transition-colors duration-150 py-1"
              >
                Visual Tiers
              </a>
              <a
                href="#the-shop"
                className="font-mono text-xs text-muted hover:text-cream transition-colors duration-150 py-1"
              >
                Gold Yields
              </a>
            </div>

            <div className="flex flex-col gap-3">
              <div className="font-micro text-[10px] text-amber tracking-micro">
                COMPASS
              </div>
              <a
                href="#"
                className="font-mono text-xs text-muted hover:text-cream transition-colors duration-150 py-1"
              >
                Manifesto
              </a>
              <a
                href="#"
                className="font-mono text-xs text-muted hover:text-cream transition-colors duration-150 py-1"
              >
                Terms of Habit
              </a>
              <a
                href="#"
                className="font-mono text-xs text-muted hover:text-cream transition-colors duration-150 py-1"
              >
                Privacy Seal
              </a>
            </div>
          </div>
        </div>

        {/* Single line of copy in Silkscreen at the bottom */}
        <div className="border-t border-[#171C2E]/60 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="font-micro text-[11px] text-muted tracking-micro uppercase">
            THE WORLD WAITS IN DARKNESS. DO NOT MISS A DAY.
          </div>
          <div className="font-micro text-[10px] text-muted tracking-micro">
            LIFE RPG // MMXXVI
          </div>
        </div>
      </div>
    </footer>
  );
};
