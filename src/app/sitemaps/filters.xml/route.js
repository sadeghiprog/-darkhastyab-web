import {
  apiUrl,
  buildUrl,
  sitemapUrl,
  sitemapXml,
  xmlResponse,
  fetchJson,
} from "../_lib";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await fetchJson(`${apiUrl}/purchase-requests/seo-landings`, {
    searches: [],
    filters: [],
    filtersWithHits: [],
  });

  console.log("FILTER SITEMAP API RESPONSE:", JSON.stringify(data, null, 2));

  const rawFilters = Array.isArray(data?.filtersWithHits)
    ? data.filtersWithHits
    : Array.isArray(data?.filters)
    ? data.filters
    : [];

  const uniqueMap = new Map();

  for (const item of rawFilters) {
    const categoryId = item?.categoryId ?? null;
    const provinceId = item?.provinceId ?? null;

    if (!categoryId && !provinceId) continue;

    const key = `${categoryId || "null"}:${provinceId || "null"}`;
    if (uniqueMap.has(key)) continue;

    uniqueMap.set(key, item);
  }

  const urls = Array.from(uniqueMap.values()).map((item) =>
    sitemapUrl({
      loc: buildUrl("/filter", {
        categoryId: item.categoryId ?? undefined,
        provinceId: item.provinceId ?? undefined,
      }),
      lastmod: item.updatedAt || item.createdAt || new Date().toISOString(),
      changefreq: "weekly",
      priority: item.hits >= 10 ? "0.75" : "0.55",
    })
  );

  console.log("FILTER SITEMAP URL COUNT:", urls.length);

  return xmlResponse(sitemapXml(urls));
}
