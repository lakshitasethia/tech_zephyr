import React from "react";
import { SpriteRenderer, PixelColorMap } from "./SpriteRenderer";

// Redesigned for legibility: wider wings with visible wing-shape,
// more detail so it reads as a moth at small render size.
const MOTH_GRID: string[] = [
  "..W.........W..",
  ".WW.........WW.",
  "WWA.........AWW",
  "WWAA.......AAWW",
  ".WWAB.....BAWW.",
  "..WAB.BBB.BAW..",
  "...WA.BGB.AW...",
  "....W.BBB.W....",
  "......BWB......",
  ".......B.......",
  "......B.B......",
];

const MOTH_PALETTE: PixelColorMap = {
  W: "#F2ECE2", // Cream wings
  A: "#FFC46B", // Pale amber inner wing
  B: "#38271C", // Body
  G: "#F0A44C", // Spark core
};

interface MothProps {
  scale?: number;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
  orbitRadiusX?: number;
  orbitRadiusY?: number;
  duration?: number;
}

export const Moth: React.FC<MothProps> = ({
  scale = 3,
  className = "",
  id,
  style = {},
  orbitRadiusX = 54,
  orbitRadiusY = 32,
  duration = 6.4,
}) => {
  return (
    <div
      className={`pointer-events-none absolute ${className}`}
      id={id}
      style={{
        width: `${15 * scale}px`,
        height: `${11 * scale}px`,
        ...style,
      }}
      aria-hidden="true"
    >
      <style jsx>{`
        .moth-orbit {
          animation: mothFigureEight ${duration}s infinite linear;
        }
        .moth-flutter {
          animation: mothFlutter 0.22s steps(2, jump-none) infinite alternate;
        }
        @keyframes mothFigureEight {
          0% {
            transform: translate(0px, 0px);
          }
          25% {
            transform: translate(${orbitRadiusX}px, -${orbitRadiusY * 0.9}px) rotate(12deg);
          }
          50% {
            transform: translate(0px, -${orbitRadiusY * 1.5}px) rotate(-8deg);
          }
          75% {
            transform: translate(-${orbitRadiusX * 1.1}px, -${orbitRadiusY * 0.5}px) rotate(-16deg);
          }
          100% {
            transform: translate(0px, 0px);
          }
        }
        @keyframes mothFlutter {
          0% {
            transform: scaleX(1);
          }
          100% {
            transform: scaleX(0.78);
          }
        }
      `}</style>

      <div className="moth-orbit">
        <div className="moth-flutter">
          <SpriteRenderer
            grid={MOTH_GRID}
            colorMap={MOTH_PALETTE}
            scale={scale}
          />
        </div>
      </div>
    </div>
  );
};
