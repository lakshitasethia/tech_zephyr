import React from "react";
import { SpriteRenderer, PixelColorMap } from "./SpriteRenderer";

// Redesigned for menace: broader shoulders, narrower head, sharper edges,
// helmet crest, darker body with only the eyes warm.
const WARDEN_GRID: string[] = [
  "..............SSSS....................",
  ".............SSSSSS...................",
  "............SSSSSSSS..................",
  "...........SSAAAAAAAS.................",
  "..........SAAAAAAAAAA.................",
  "..........SAAAAAAAAAA.................",
  ".........SAAAA..AAAAA.................",
  ".........SAAA....AAAA.................",
  ".........SAAA.E..AAAA.................",
  ".........SAAAA.EAAAAA.................",
  "..........AAAAAAAAAA..................",
  "..........AAAA....AAA.................",
  "...........AAA....AAA.................",
  "..........AAAAA..AAAAA................",
  "........AAAAAAAAAAAAAAA...............",
  "......AAAAAAAAAAAAAAAAAAA.............",
  "....SAAAAAAAAAAAAAAAAAAAAAS...........",
  "...SAAAAAAAAAAAAAAAAAAAAAAAAS.........",
  "..SAAAA....AAAAAAAAAAA....AAAAS......",
  ".SAAAA......AAAAAAAAA......AAAAS.....",
  ".SAAA........AAAAAAA........AAAS.....",
  ".SAAA........AAAAAAA........AAAS.....",
  ".SAAA.........AAAAA.........AAAS.....",
  "..............AAAAA...................",
  ".............AAAAAAA..................",
  ".............AAAAAAA..................",
  "............AAAAAAAAA.................",
  "............AAAA.AAAA.................",
  "...........AAAA...AAAA...............",
  "..........AAAAA...AAAAA..............",
  ".........AAAAA.....AAAAA.............",
  "........AAAAAA.....AAAAAA............",
];

const WARDEN_PALETTE: PixelColorMap = {
  A: "#0C1221", // Darker heavy armor
  S: "#060A14", // Shadow edges / helmet spikes
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
            "radial-gradient(ellipse at center, rgba(6, 10, 20, 0.8) 0%, transparent 70%)",
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
