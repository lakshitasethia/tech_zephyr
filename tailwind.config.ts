import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        void: "var(--void)",
        ink: "var(--ink)",
        deep: "var(--deep)",
        slate: "var(--slate)",
        plum: "var(--plum)",
        warm: "var(--warm)",
        ember: "var(--ember)",
        closing: "var(--closing)",
        cream: "var(--cream)",
        muted: "var(--muted)",
        amber: "var(--amber)",
        gold: "var(--gold)",
        sage: "var(--sage)",
        rose: "var(--rose)",
        steel: "var(--steel)",
      },
      fontFamily: {
        display: ["var(--font-pixelify)", "system-ui", "sans-serif"],
        micro: ["var(--font-silkscreen)", "monospace"],
        sans: ["var(--font-instrument)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        micro: "0.14em",
      },
      borderRadius: {
        none: "0px",
        pixel: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
