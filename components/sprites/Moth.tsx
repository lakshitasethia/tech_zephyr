import React, { useState, useEffect } from "react";
import { SpriteRenderer, PixelColorMap } from "./SpriteRenderer";

// Two distinct wing poses for a real flap animation.
// Frame 1: wings up. Frame 2: wings down.
// Visible body segment between wings. Recognizable as moth when paused.

// Wings-up pose (15x11)
const MOTH_FRAME_UP: string[] = [
  "..WW.......WW..",
  ".WWAA.....AAWW.",
  "WWWAA.....AAWWW",
  "WWWAB.....BAWWW",
  ".WWAB.BBB.BAWW.",
  "..WAB.BGB.BAW..",
  "...WA.BBB.AW...",
  "....W..B..W....",
  ".......B.......",
  "......B.B......",
  "................",
];

// Wings-down pose (15x11)
const MOTH_FRAME_DOWN: string[] = [
  "...............",
  "...............",
  "...WA.....AW...",
  "..WWAB...BAWW..",
  ".WWWAB.B.BAWWW.",
  "WWWWAB.G.BAWWWW",
  ".WWWAB.B.BAWWW.",
  "..WWAB...BAWW..",
  "...WA..B..AW...",
  ".......B.......",
  "......B.B......",
];

const MOTH_PALETTE: PixelColorMap = {
  W: "#F2ECE2", // Cream wings
  A: "#FFC46B", // Pale amber inner wing
  B: "#38271C", // Body/antennae
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
  // 2-frame flap: alternate between up and down poses
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const interval = setInterval(() => {
      setFrame((f) => (f === 0 ? 1 : 0));
    }, 180); // ~5.5 fps flap

    return () => clearInterval(interval);
  }, []);

  const currentGrid = frame === 0 ? MOTH_FRAME_UP : MOTH_FRAME_DOWN;

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
        @keyframes mothFigureEight {
          0% {
            transform: translate(0px, 0px);
          }
          25% {
            transform: translate(${orbitRadiusX}px, -${Math.abs(orbitRadiusY) * 0.9}px) rotate(12deg);
          }
          50% {
            transform: translate(0px, -${Math.abs(orbitRadiusY) * 1.5}px) rotate(-8deg);
          }
          75% {
            transform: translate(-${Math.abs(orbitRadiusX) * 1.1}px, -${Math.abs(orbitRadiusY) * 0.5}px) rotate(-16deg);
          }
          100% {
            transform: translate(0px, 0px);
          }
        }
      `}</style>

      <div className="moth-orbit">
        <SpriteRenderer
          grid={currentGrid}
          colorMap={MOTH_PALETTE}
          scale={scale}
        />
      </div>
    </div>
  );
};
