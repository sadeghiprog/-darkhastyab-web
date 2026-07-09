import { absoluteUrl, sitemapIndexXml, xmlResponse } from "../sitemaps/_lib";

export const dynamic = "force-dynamic";

export async function GET() {
  const now = new Date();

  const sitemaps = [
    {
      loc: absoluteUrl("/sitemaps/static.xml"),
      lastmod: now,
    },
    {
      loc: absoluteUrl("/sitemaps/requests.xml"),
      lastmod: now,
    },
    {
      loc: absoluteUrl("/sitemaps/searches.xml"),
      lastmod: now,
    },
    {
      loc: absoluteUrl("/sitemaps/filters.xml"),
      lastmod: now,
    },
    {
      loc: absoluteUrl("/sitemaps/suppliers.xml"),
      lastmod: now,
    },
    
  ];

  return xmlResponse(sitemapIndexXml(sitemaps));
}
