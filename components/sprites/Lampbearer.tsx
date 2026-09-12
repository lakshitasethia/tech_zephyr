import React from "react";
import { SpriteRenderer, PixelColorMap } from "./SpriteRenderer";

const LAMPBEARER_GRID: string[] = [
  "....HHHHHH......",
  "...HHHHHHHH.....",
  "..HHHHHHHHHH....",
  "..HHCCFFCCHH....",
  "..HCCCFFCCCH....",
  "..HCCCCCCCC.....",
  "...HCCCCCC......",
  "..HHCCCCCHH.....",
  ".HHCCCCCCCCHH...",
  ".HCCCCCCCCCPPM..",
  "HCCCCCCCCCCPAM..",
  "HCCCCCCC...PAGM.",
  "HCCCCCC....PAAM.",
  "HCCCCCC.....PMM.",
  ".HCCCCC.........",
  ".HCCCCCC........",
  ".HCCCCCCC.......",
  "..HCCCCCC.......",
  "..HCCCCCC.......",
  "..HCCCCCH.......",
  "...HH.HH........",
  "...BB.BB........",
  "...BB.BB........",
  "..BBB.BBB.......",
];

const LAMPBEARER_PALETTE: PixelColorMap = {
  H: "#0E1424", // Deep indigo hood shadow
  C: "#182238", // Cloak indigo
  L: "#253456", // Highlight fold
  F: "#82756A", // Hooded face recess
  M: "#2A201C", // Lantern brass frame
  P: "#42322A", // Arm / handle
  A: "#F0A44C", // Amber lantern flame
  G: "#FFC46B", // Gold core
  B: "#090D17", // Boots / traveler greaves
};

interface LampbearerProps {
  scale?: number;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
  glowing?: boolean;
}

export const Lampbearer: React.FC<LampbearerProps> = ({
  scale = 5,
  className = "",
  id,
  style = {},
  glowing = true,
}) => {
  return (
    <div
      className={`relative inline-block ${className}`}
      id={id}
      style={{
        ...style,
      }}
    >
      <style jsx>{`
        .lampbearer-bob {
          animation: lampbearerBob 1.6s steps(2, jump-none) infinite;
        }
        .lantern-pulse {
          animation: lanternGlow 2.1s ease-in-out infinite alternate;
        }
        @keyframes lampbearerBob {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-4px);
          }
          100% {
            transform: translateY(0px);
          }
        }
        @keyframes lanternGlow {
          0% {
            opacity: 0.65;
            filter: drop-shadow(0 0 12px rgba(240, 164, 76, 0.4));
          }
          100% {
            opacity: 1;
            filter: drop-shadow(0 0 28px rgba(255, 196, 107, 0.9));
          }
        }
      `}</style>

      {/* Atmospheric radial pool beneath/around the lantern */}
      {glowing && (
        <div
          className="lantern-pulse pointer-events-none absolute -inset-10 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 75% 45%, rgba(240, 164, 76, 0.35) 0%, rgba(240, 164, 76, 0.08) 45%, transparent 70%)",
            zIndex: 0,
          }}
          aria-hidden="true"
        />
      )}

      <div className="lampbearer-bob relative z-10">
        <SpriteRenderer
          grid={LAMPBEARER_GRID}
          colorMap={LAMPBEARER_PALETTE}
          scale={scale}
        />
      </div>
    </div>
  );
};
