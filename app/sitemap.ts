import type { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://serviceops-ai-site.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/solutions", "/integrations", "/modules", "/case-studies", "/book-demo", "/thank-you"];

  return routes.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: path === "" ? 1 : path === "/book-demo" ? 0.9 : 0.8,
  }));
}
