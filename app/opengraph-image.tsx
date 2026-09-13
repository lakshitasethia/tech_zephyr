import { ImageResponse } from "next/og";

/**
 * Social preview card, generated at build time rather than shipped as a file.
 * Drawn with the product's own palette so a shared link looks like the app.
 */
export const alt = "Lanternkeep. Your life is already an RPG.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#06070B",
          backgroundImage:
            "radial-gradient(900px 520px at 82% -8%, rgba(240,164,76,0.30), transparent 68%), radial-gradient(600px 420px at 2% 108%, rgba(125,143,179,0.16), transparent 70%)",
          padding: "72px 88px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 16, height: 16, background: "#F0A44C" }} />
          <div
            style={{
              fontSize: 22,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: "#F0A44C",
            }}
          >
            Lanternkeep
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 34,
            fontSize: 86,
            lineHeight: 1.02,
            color: "#F2ECE2",
            fontWeight: 700,
          }}
        >
          <span>Your life is</span>
          <span>already an RPG.</span>
        </div>

        <div
          style={{
            marginTop: 34,
            fontSize: 28,
            lineHeight: 1.45,
            color: "#9D9385",
            maxWidth: 780,
          }}
        >
          Turn real tasks into quests. Earn gold from work you actually did,
          and buy the light back for a world that starts in the dark.
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 44 }}>
          {["#3A3A3A", "#8A6A3A", "#C98A7F", "#FFC46B"].map((c, i) => (
            <div
              key={i}
              style={{ width: 86, height: 10, background: c }}
            />
          ))}
        </div>
      </div>
    ),
    size,
  );
}
