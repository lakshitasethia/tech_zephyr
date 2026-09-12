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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  // metadataBase resolves the Open Graph and Twitter image URLs to absolute
  // ones. Without it Next warns and social scrapers get a relative path.
  metadataBase: new URL(siteUrl),
  title: {
    default: "Life RPG. Buy the Light Back",
    // Sub pages set their own title and inherit this frame.
    template: "%s | Life RPG",
  },
  description:
    "Life RPG turns real tasks into quests. Earn XP and gold from work you actually did, level four attributes, hold a streak, and buy the light back for a world that starts in the dark.",
  applicationName: "Life RPG",
  keywords: [
    "gamified to do list",
    "habit tracker",
    "RPG productivity app",
    "quest tracker",
    "XP task manager",
    "Life RPG",
  ],
  authors: [{ name: "Life RPG" }],
  creator: "Life RPG",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Life RPG",
    url: siteUrl,
    title: "Life RPG. Buy the Light Back",
    description:
      "Turn real tasks into quests. Earn gold from work you actually did, and buy the light back for a world that starts in the dark.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Life RPG. Buy the Light Back",
    description:
      "Turn real tasks into quests. Earn gold from work you actually did, and buy the light back for a world that starts in the dark.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
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
