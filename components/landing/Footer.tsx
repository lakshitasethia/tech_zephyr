import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer
      id="footer"
      className="relative z-10 pt-24 sm:pt-32 pb-12 sm:pb-16 px-6 sm:px-8 select-none"
      style={{ backgroundColor: "var(--closing)" }}
      aria-label="Site Footer"
    >
      {/* Top edge: subtle gradient separator instead of a border */}
      <div
        className="absolute top-0 left-0 right-0 h-[1px] pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(240, 164, 76, 0.25) 30%, rgba(240, 164, 76, 0.25) 70%, transparent 100%)",
        }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 sm:gap-16 pb-16 sm:pb-20">
          {/* Wordmark at left with the 6px amber square bullet */}
          <div className="md:col-span-5 flex flex-col items-start gap-5">
            <div className="flex items-center gap-2.5">
              <span
                className="w-[6px] h-[6px] bg-amber inline-block shrink-0 pixel-crisp"
                style={{ borderRadius: "0px" }}
                aria-hidden="true"
              />
              <span className="font-display text-2xl sm:text-3xl font-bold text-cream">
                LANTERNKEEP
              </span>
            </div>
            <p className="font-body text-muted max-w-[36ch]" style={{ fontSize: "15px" }}>
              Turns everyday real output into tangible progression. Buy the light back.
            </p>
          </div>

          {/* Three plain text columns of links */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-10 sm:gap-8">
            <div className="flex flex-col gap-4">
              <div className="font-micro text-amber tracking-micro mb-1" style={{ fontSize: "11px" }}>
                SYSTEM
              </div>
              <a
                href="#how-it-works"
                className="font-mono text-sm text-muted hover:text-cream transition-colors duration-150 py-1"
              >
                How It Works
              </a>
              <a
                href="#attributes"
                className="font-mono text-sm text-muted hover:text-cream transition-colors duration-150 py-1"
              >
                Attributes
              </a>
              <a
                href="#campaigns"
                className="font-mono text-sm text-muted hover:text-cream transition-colors duration-150 py-1"
              >
                Campaigns
              </a>
            </div>

            <div className="flex flex-col gap-4">
              <div className="font-micro text-amber tracking-micro mb-1" style={{ fontSize: "11px" }}>
                ECONOMY
              </div>
              <a
                href="#the-shop"
                className="font-mono text-sm text-muted hover:text-cream transition-colors duration-150 py-1"
              >
                The Shop
              </a>
              <a
                href="#the-shop"
                className="font-mono text-sm text-muted hover:text-cream transition-colors duration-150 py-1"
              >
                Visual Tiers
              </a>
              <a
                href="#the-shop"
                className="font-mono text-sm text-muted hover:text-cream transition-colors duration-150 py-1"
              >
                Gold Yields
              </a>
            </div>

            <div className="flex flex-col gap-4">
              <div className="font-micro text-amber tracking-micro mb-1" style={{ fontSize: "11px" }}>
                COMPASS
              </div>
              <a
                href="#"
                className="font-mono text-sm text-muted hover:text-cream transition-colors duration-150 py-1"
              >
                Manifesto
              </a>
              <a
                href="#"
                className="font-mono text-sm text-muted hover:text-cream transition-colors duration-150 py-1"
              >
                Terms of Habit
              </a>
              <a
                href="#"
                className="font-mono text-sm text-muted hover:text-cream transition-colors duration-150 py-1"
              >
                Privacy Seal
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar: separated by a fine dark line */}
        <div
          className="pt-8 sm:pt-10 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTop: "1px solid rgba(23, 28, 46, 0.6)" }}
        >
          <div className="font-micro text-muted tracking-micro" style={{ fontSize: "12px" }}>
            THE WORLD WAITS IN DARKNESS. DO NOT MISS A DAY.
          </div>
          <div className="font-micro text-muted tracking-micro" style={{ fontSize: "11px" }}>
            LANTERNKEEP // MMXXVI
          </div>
        </div>
      </div>
    </footer>
  );
};
