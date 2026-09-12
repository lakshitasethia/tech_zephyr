import React from "react";
import { SpriteRenderer, PixelColorMap } from "./SpriteRenderer";

const WARDEN_GRID: string[] = [
  "............AAAA....AAAA............",
  "...........AAAAAA..AAAAAA...........",
  "..........AAAAAAAAAAAAAAAA..........",
  "..........AAAAAAAAAAAAAAAA..........",
  ".........AAAAAAAAAAAAAAAAAA.........",
  ".........AAAAAAAAAAAAAAAAAA.........",
  "........AAAAA..AAAAAA..AAAAA........",
  "........AAAA....AAAA....AAAA........",
  "........AAAA..E.AAAA.E..AAAA........",
  "........AAAAA.EAAAAAAE.AAAAA........",
  ".........AAAAAAAAAAAAAAAAAA.........",
  ".........AAAA..AAAAAA..AAAA.........",
  "..........AAAA........AAAA..........",
  ".........AAAAAA......AAAAAA.........",
  ".......AAAAAAAAAAAAAAA.AAAAAA.......",
  ".....AAAAAAAAAAAAAAAAAAAAAAAAAA.....",
  "....AAAAAAAAAAAAAAAAAAAAAAAAAAAA....",
  "...AAAA...AAAAAAAAAAAAAAAA...AAAA...",
  "..AAAA.....AAAAAAAAAAAAAA.....AAAA..",
  "..AAA.......AAAAAAAAAAAA.......AAA..",
  "..AAA.......AAAAAAAAAAAA.......AAA..",
  "..AAA........AAAAAAAAAA........AAA..",
  ".............AAAAAAAAAA.............",
  "............AAAAAAAAAAAA............",
  "............AAAAAAAAAAAA............",
  "...........AAAAAAAAAAAAAA...........",
  "...........AAAAA....AAAAA...........",
  "...........AAAA......AAAA...........",
  "..........AAAAA......AAAAA..........",
  "..........AAAA........AAAA..........",
  ".........AAAAA........AAAAA.........",
  "........AAAAAA........AAAAAA........",
];

const WARDEN_PALETTE: PixelColorMap = {
  A: "#131B2E", // Dark heavy armor
  E: "#F0A44C", // Glowing amber eye pixels
};

interface WardenProps {
  scale?: number;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
}

export const Warden: React.FC<WardenProps> = ({
  scale = 4,
  className = "",
  id,
  style = {},
}) => {
  return (
    <div
      className={`relative inline-block select-none ${className}`}
      id={id}
      style={{
        ...style,
      }}
      aria-hidden="true"
    >
      <style jsx>{`
        .warden-eyes {
          animation: wardenEyeGaze 3.2s infinite ease-in-out;
        }
        @keyframes wardenEyeGaze {
          0%,
          100% {
            filter: drop-shadow(0 0 4px #f0a44c) drop-shadow(0 0 10px #ffc46b);
            opacity: 0.9;
          }
          50% {
            filter: drop-shadow(0 0 8px #f0a44c) drop-shadow(0 0 20px #ffc46b);
            opacity: 1;
          }
          75% {
            filter: drop-shadow(0 0 2px #f0a44c);
            opacity: 0.6;
          }
        }
      `}</style>

      {/* Subtle back silhouette aura */}
      <div
        className="pointer-events-none absolute -inset-6"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(16, 24, 41, 0.7) 0%, transparent 70%)",
          zIndex: 0,
        }}
        aria-hidden="true"
      />

      <div className="warden-eyes relative z-10">
        <SpriteRenderer
          grid={WARDEN_GRID}
          colorMap={WARDEN_PALETTE}
          scale={scale}
        />
      </div>
    </div>
  );
};
