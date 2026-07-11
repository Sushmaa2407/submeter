import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Nothing useful for a crawler in these — /api is data, not
      // pages, and /admin + /customer are behind login anyway.
      disallow: ["/api/", "/admin/", "/customer/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
