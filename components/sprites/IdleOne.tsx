import React from "react";
import { SpriteRenderer, PixelColorMap } from "./SpriteRenderer";

// Slumped silhouette matching Lampbearer
const IDLE_ONE_GRID: string[] = [
  "................",
  "....DDDDDD......",
  "...DDDDDDDD.....",
  "..DDDDDDDDDD....",
  "..DDGGSSGGDD....",
  "..DGGGSSGGGD....",
  "..DGGGGGGGG.....",
  "...DGGGGGG......",
  "..DDGGGGGD......",
  ".DDGGGGGGGDD....",
  ".DGGGGGGGGDDMM..",
  "DGGGGGGGGGDDDM..",
  "DGGGGGGG...DDDM.",
  "DGGGGGG....DDDM.",
  "DGGGGGG.....DMM.",
  ".DGGGGG.........",
  ".DGGGGGG........",
  ".DGGGGGGG.......",
  "..DGGGGGG.......",
  "..DGGGGGG.......",
  "..DGGGGGD.......",
  "...DD.DD........",
  "...BB.BB........",
  "..BBB.BBB.......",
];

const IDLE_ONE_PALETTE: PixelColorMap = {
  D: "#1A212E", // Desaturated dark grey hood
  G: "#2B3545", // Slumped cloak grey
  S: "#49566A", // Face shadow
  M: "#1D232F", // Extinguished cold lantern frame
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
        filter: "grayscale(100%) brightness(0.65)",
        ...style,
      }}
      aria-hidden="true"
    >
      <style jsx>{`
        .idle-slump {
          animation: idleSlump 3.6s ease-in-out infinite alternate;
        }
        @keyframes idleSlump {
          0% {
            transform: translateY(0px);
          }
          100% {
            transform: translateY(2px);
          }
        }
      `}</style>

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
