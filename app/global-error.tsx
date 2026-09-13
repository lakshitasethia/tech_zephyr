"use client";

/**
 * Last resort boundary. Catches failures in the root layout itself, where
 * app/error.tsx cannot help because the layout never rendered. It must supply
 * its own html and body, and it cannot rely on the app's fonts or stylesheet,
 * so the styling here is deliberately inline and self contained.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#06070B",
          color: "#F2ECE2",
          fontFamily: "system-ui, sans-serif",
          padding: "24px",
        }}
      >
        <div style={{ maxWidth: "26rem" }}>
          <p
            style={{
              margin: 0,
              fontSize: "12px",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#C98A7F",
            }}
          >
            The lantern went out
          </p>
          <h1 style={{ margin: "8px 0 0", fontSize: "30px", lineHeight: 1.15 }}>
            Lanternkeep could not start
          </h1>
          <p
            style={{
              margin: "12px 0 0",
              fontSize: "15px",
              lineHeight: 1.6,
              color: "#9D9385",
            }}
          >
            Your data is safe on the server. Reload to try again.
          </p>
          {error.digest && (
            <p style={{ marginTop: "14px", fontSize: "12px", color: "#9D9385" }}>
              Reference: {error.digest}
            </p>
          )}
          <button
            onClick={reset}
            style={{
              marginTop: "26px",
              background: "#F0A44C",
              color: "#06070B",
              border: "none",
              padding: "12px 24px",
              fontSize: "12px",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
