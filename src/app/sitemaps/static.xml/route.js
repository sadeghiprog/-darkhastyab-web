import { absoluteUrl, sitemapUrl, sitemapXml, xmlResponse } from "../_lib";

export const dynamic = "force-dynamic";

export async function GET() {
  const now = new Date();

  const pages = [
    {
      path: "/",
      changefreq: "daily",
      priority: "1.0",
    },
    {
      path: "/filter",
      changefreq: "hourly",
      priority: "0.9",
    },
    {
      path: "/search",
      changefreq: "daily",
      priority: "0.8",
    },
    {
      path: "/suppliers",
      changefreq: "daily",
      priority: "0.8",
    },
    {
      path: "/contact",
      changefreq: "monthly",
      priority: "0.5",
    },
    {
      path: "/help",
      changefreq: "monthly",
      priority: "0.4",
    },
  ];

  const urls = pages.map((page) =>
    sitemapUrl({
      loc: absoluteUrl(page.path),
      lastmod: now,
      changefreq: page.changefreq,
      priority: page.priority,
    })
  );

  return xmlResponse(sitemapXml(urls));
}
