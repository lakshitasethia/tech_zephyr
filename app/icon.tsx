import { ImageResponse } from "next/og";

/**
 * Favicon: a lit pixel lantern on the void.
 *
 * Generated at build rather than shipped as an .ico, so it stays in the same
 * palette as the rest of the product and there is no binary asset to keep in
 * sync. Built as nested flex rows rather than absolutely positioned cells,
 * because Satori, which renders this, handles flex reliably and absolute
 * positioning poorly.
 */
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// 8x8. The detail has to survive being drawn at 32 pixels wide.
// H handle, F frame, G glass, C flame.
const GRID = [
  "..HHHH..",
  ".H....H.",
  "..FFFF..",
  ".FGGGGF.",
  ".FGCCGF.",
  ".FGCCGF.",
  ".FGGGGF.",
  "..FFFF..",
];

const PALETTE: Record<string, string> = {
  ".": "#06070B",
  H: "#9D9385",
  F: "#8A7550",
  G: "#F0A44C",
  C: "#FFF3D6",
};

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#06070B",
        }}
      >
        {GRID.map((row, y) => (
          <div key={y} style={{ display: "flex", flex: 1 }}>
            {row.split("").map((ch, x) => (
              <div
                key={x}
                style={{ flex: 1, background: PALETTE[ch] }}
              />
            ))}
          </div>
        ))}
      </div>
    ),
    size,
  );
}
