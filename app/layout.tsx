import type { Metadata } from "next";
import { Pixelify_Sans, Silkscreen, Instrument_Sans } from "next/font/google";
import "./globals.css";

const pixelifySans = Pixelify_Sans({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-pixelify",
  display: "swap",
});

const silkscreen = Silkscreen({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-silkscreen",
  display: "swap",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-instrument",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Life RPG. Buy the Light Back",
  description:
    "Life RPG turns real-life tasks into an RPG. Complete quests, earn gold, and buy the light back for a darkened world.",
  keywords: ["Life RPG", "Productivity", "Habit Tracker", "Gamification"],
  authors: [{ name: "Life RPG" }],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#06070B",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${pixelifySans.variable} ${silkscreen.variable} ${instrumentSans.variable}`}
    >
      <head>
        <meta name="theme-color" content="#06070B" />
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(sessionStorage.getItem("liferpg_cinematic_seen")==="true"){document.documentElement.classList.add("skip-intro");}}catch(e){}`,
          }}
        />
        <noscript>
          <style>{`#intro-overlay{display:none!important;}`}</style>
        </noscript>
      </head>
      <body className="antialiased selection:bg-amber selection:text-void">
        {/* Dynamic interpolated background layer */}
        <div id="global-background-canvas" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
