import React from "react";
import { SpriteRenderer, PixelColorMap } from "./SpriteRenderer";

// Exact silhouette match for Lampbearer (same 24x36 grid).
// Desaturated grey, lantern dark/glassy, no glow.
// Slumped: shoulders lowered ~1px, head tilted down slightly.
const IDLE_ONE_GRID: string[] = [
  "........................",
  "........DDDDDD..........",
  ".......DDDDDDDD.........",
  "......DDDDDDDDDD........",
  ".....DDDDDDDDDDD........",
  ".....DDDSSSSDDD.........",
  ".....DDSSSSSDD..........",
  "......DSSSSD............",
  ".....DDGGGGGDDDD........",
  "....DDGGGGGGGDDD........",
  "...DDGGGGGGGGDDD........",
  "...DGGGGGGGGGGDD..MM...",
  "..DGGGGGGGGGGDD..MDDM..",
  "..DDGGGGGGGGGGD..MDDM..",
  "..DDGGGGGGGGGD...MDDDM.",
  "...DGGGGGGGD.....MDDM..",
  "...DGGGGGGD......MMM...",
  "...DDGGGGGD............",
  "....DGGGGGD............",
  "....DGGGGGG............",
  "....DGGGGGGG...........",
  ".....DGGGGGGG..........",
  ".....DGGGGGGG..........",
  ".....DDGGGGGG..........",
  ".....DDGGGGGGG.........",
  "......DGGGGGGG.........",
  "......DGGGGGGG.........",
  "......DDGGGGGG.........",
  ".......DDGGGG..........",
  ".......DDDDD...........",
  "........DD.DD..........",
  "........BB.BB..........",
  "........BB.BB..........",
  "........BB.BB..........",
  ".......BBB.BBB.........",
  ".......BBB.BBB.........",
];

const IDLE_ONE_PALETTE: PixelColorMap = {
  D: "#1A212E", // Desaturated dark hood/outline
  G: "#2B3545", // Slumped cloak grey
  S: "#49566A", // Face shadow area
  M: "#1D232F", // Dead lantern frame (cold)
  B: "#0E121A", // Heavy worn boots
};

interface IdleOneProps {
  scale?: number;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
}

export const IdleOne: React.FC<IdleOneProps> = ({
  scale = 5,
  className = "",
  id,
  style = {},
}) => {
  return (
    <div
      className={`relative inline-block select-none ${className}`}
      id={id}
      style={{
        filter: "grayscale(100%) brightness(0.6)",
        ...style,
      }}
      aria-hidden="true"
    >
      <style jsx>{`
        .idle-slump {
          animation: idleSlump 3.6s ease-in-out infinite alternate;
        }
        @keyframes idleSlump {
          0% { transform: translateY(0px); }
          100% { transform: translateY(2px); }
        }
      `}</style>

      {/* Ground shadow */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: "-4px",
          left: "50%",
          transform: "translateX(-50%)",
          width: `${scale * 14}px`,
          height: `${scale * 3}px`,
          background: "radial-gradient(ellipse, rgba(6, 10, 20, 0.5) 0%, transparent 70%)",
          borderRadius: "50%",
        }}
        aria-hidden="true"
      />

      <div className="idle-slump">
        <SpriteRenderer
          grid={IDLE_ONE_GRID}
          colorMap={IDLE_ONE_PALETTE}
          scale={scale}
        />
      </div>
    </div>
  );
};
