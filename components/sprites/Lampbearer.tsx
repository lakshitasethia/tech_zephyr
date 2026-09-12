import React from "react";
import { SpriteRenderer, PixelColorMap } from "./SpriteRenderer";

// 24x36 grid. 4-value color ramp per material.
// Light source: lantern (right side). Hood is dark void, cloak has folds.
// D=deep shadow, C=cloak base, L=cloak light, K=cloak highlight
// H=hood deep, F=face shadow, M=lantern frame, P=arm/handle
// A=amber flame, G=gold core, B=boot shadow, W=boot base
const LAMPBEARER_FRAME_1: string[] = [
  "........HHHHHH..........",
  ".......HHHHHHHH.........",
  "......HHHHHHHHHH........",
  ".....HHHHHHHHHHH........",
  ".....HHHFFHFFHHH........",
  ".....HHFFFFFFHH.........",
  "......HFFFFFH...........",
  ".....HHFFFFHH...........",
  "....HHDCCCCDDHH.........",
  "...HHDCCCCCCDDHH........",
  "...HDCCCCCCCCDHH........",
  "..HDCCCCCCCCCLHH..MM...",
  "..HDCCCCCCCCCLH..MPAM..",
  "..HDDCCCCCCCLH..MPAGM..",
  "..HDDCCCCCCLH...MPAAGM.",
  "...HDCCCCCLH.....MPAM..",
  "...HDCCCCLH......MMM...",
  "...HDDCCCLH............",
  "....HDCCCLH............",
  "....HDCCCCH............",
  "....HDCCCCCH...........",
  ".....HDCCCCCH..........",
  ".....HDCCCCCH..........",
  ".....HDDCCCCH.........",
  ".....HDDCCCCCH........",
  "......HDCCCCCH.........",
  "......HDCCCCCH.........",
  "......HDDCCCCH.........",
  ".......HDDCCH..........",
  ".......HHDDH...........",
  "........HH.HH..........",
  "........BW.WB..........",
  "........BW.WB..........",
  "........BW.WB..........",
  ".......BBW.WBB.........",
  ".......BBB.BBB.........",
];

// Frame 2: 1px bob up (identical shape, shifted up by design intent)
const LAMPBEARER_FRAME_2: string[] = LAMPBEARER_FRAME_1.map((row, i) => {
  if (i === 0) return "........................";
  return LAMPBEARER_FRAME_1[i - 1];
});

const LAMPBEARER_PALETTE: PixelColorMap = {
  H: "#060A14", // Deepest hood/outline shadow
  D: "#0C1221", // Deep cloak shadow
  C: "#152035", // Cloak base
  L: "#253456", // Cloak light (lantern-facing folds)
  K: "#3A4E78", // Cloak highlight edge (brightest fold)
  F: "#9A8D7E", // Face visible in hood opening
  M: "#2A201C", // Lantern brass frame
  P: "#42322A", // Arm / handle
  A: "#F0A44C", // Amber lantern flame
  G: "#FFD580", // Gold core highlight
  B: "#060A14", // Boot shadow
  W: "#101829", // Boot base
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
      style={{ ...style }}
    >
      <style jsx>{`
        .lampbearer-bob {
          animation: lampbearerBob 1.6s steps(2, jump-none) infinite;
        }
        .lantern-flicker {
          animation: lanternFlicker 2.4s steps(3, jump-none) infinite;
        }
        @keyframes lampbearerBob {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
        @keyframes lanternFlicker {
          0%, 30% {
            opacity: 0.7;
            filter: drop-shadow(0 0 10px rgba(240, 164, 76, 0.4));
          }
          35%, 40% {
            opacity: 0.5;
            filter: drop-shadow(0 0 4px rgba(240, 164, 76, 0.2));
          }
          45%, 100% {
            opacity: 1;
            filter: drop-shadow(0 0 24px rgba(255, 196, 107, 0.85));
          }
        }
      `}</style>

      {/* Ground shadow ellipse */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: "-4px",
          left: "50%",
          transform: "translateX(-50%)",
          width: `${scale * 14}px`,
          height: `${scale * 3}px`,
          background: "radial-gradient(ellipse, rgba(6, 10, 20, 0.7) 0%, transparent 70%)",
          borderRadius: "50%",
        }}
        aria-hidden="true"
      />

      {/* Atmospheric radial pool beneath/around the lantern */}
      {glowing && (
        <div
          className="lantern-flicker pointer-events-none absolute -inset-10 rounded-full"
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
          grid={LAMPBEARER_FRAME_1}
          colorMap={LAMPBEARER_PALETTE}
          scale={scale}
        />
      </div>
    </div>
  );
};
