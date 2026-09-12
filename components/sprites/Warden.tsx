import React from "react";
import { SpriteRenderer, PixelColorMap } from "./SpriteRenderer";

// Warden: heavy armored boss. 4-value armor ramp.
// S=shadow/spikes, A=armor deep, P=plate mid, L=plate light (edge catching light)
// V=visor recess, E=amber eyes inside visor
// Light source from left (player's lantern side).
const WARDEN_GRID: string[] = [
  "..............SSSS....................",
  ".............SSSSSS...................",
  "............SSSSSSSS..................",
  "...........SSAPPPPPAS.................",
  "..........SAPPPPPPPPPA................",
  "..........SAPPPPPPPPA.................",
  ".........SAPPPLLLPPPA.................",
  ".........SAPPP.VV.PPPA................",
  ".........SAPPP.EV.PPPA................",
  ".........SAPPPP.EPPPA.................",
  "..........APPPPPPPPPA.................",
  "..........APPP....PPA.................",
  "...........APP....PPA.................",
  "..........APPPP..PPPPA...............",
  "........APPPPPPPPPPPPPPA.............",
  "......APPPPPPPPPPPPPPPPPA............",
  "....SAPPPPPPPPPPPPPPPPPPPAS..........",
  "...SAPPLPPPPPPPPPPPPPPPLPPAS.........",
  "..SAPPLL..PPPPPPPPPP..LLPPAS........",
  ".SAPPLL....PPPPPPPP....LLPPAS.......",
  ".SAPPL......PPPPPP......LPPAS.......",
  ".SAPPL......PPPPPP......LPPAS.......",
  ".SAPPL.......PPPP.......LPPAS.......",
  "..............PPPP...................",
  ".............PPPPPP..................",
  ".............PPPPPP..................",
  "............PPPPPPPP.................",
  "............PPPP.PPPP................",
  "...........PPPP...PPPP...............",
  "..........PPPPP...PPPPP..............",
  ".........PPPPP.....PPPPP.............",
  "........PPPPPP.....PPPPPP............",
];

const WARDEN_PALETTE: PixelColorMap = {
  S: "#040810", // Darkest shadow / spike edges
  A: "#0C1221", // Armor deep shadow
  P: "#1A2438", // Plate mid-tone
  L: "#2C3B5A", // Plate edge catching lantern light
  V: "#080E1A", // Visor recess (darker than armor)
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
      style={{ ...style }}
      aria-hidden="true"
    >
      <style jsx>{`
        .warden-bob {
          animation: wardenBob 2.2s steps(2, jump-none) infinite;
        }
        .warden-eyes {
          animation: wardenEyeGaze 3.2s infinite ease-in-out;
        }
        @keyframes wardenBob {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-3px); }
        }
        @keyframes wardenEyeGaze {
          0%, 100% {
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

      {/* Ground shadow */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: "-6px",
          left: "50%",
          transform: "translateX(-50%)",
          width: `${scale * 22}px`,
          height: `${scale * 4}px`,
          background: "radial-gradient(ellipse, rgba(6, 10, 20, 0.8) 0%, transparent 70%)",
          borderRadius: "50%",
        }}
        aria-hidden="true"
      />

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

      <div className="warden-bob warden-eyes relative z-10">
        <SpriteRenderer
          grid={WARDEN_GRID}
          colorMap={WARDEN_PALETTE}
          scale={scale}
        />
      </div>
    </div>
  );
};
