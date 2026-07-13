import { buildUrl, apiUrl, fetchJson, sitemapUrl, sitemapXml, xmlResponse } from "../_lib";

export const dynamic = "force-dynamic";

export async function GET() {
  // این مسیر را با route واقعی backend خودت یکی کن
  const data = await fetchJson(`${apiUrl}/purchase-requests/seo-landings`, {
    searches: [],cache: "no-store",
  });

  const searches = Array.isArray(data?.searches) ? data.searches : [];
  console.log("22222",searches)
  const urls = searches
    .filter((item) => item?.keyword)
    .map((item) =>
      sitemapUrl({
        loc: buildUrl("/search", { q: item.keyword }),
        lastmod: item.updatedAt || item.createdAt || new Date(),
        changefreq: "weekly",
        priority: item.hits >= 10 ? "0.8" : "0.6",
      })
    );

  return xmlResponse(sitemapXml(urls));
}
