import type { MetadataRoute } from "next";

const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // The signed in application holds one person's private data and has
        // no crawlable content. Keep it out of the index.
        disallow: ["/play", "/auth/"],
      },
    ],
    sitemap: `${site}/sitemap.xml`,
  };
}
