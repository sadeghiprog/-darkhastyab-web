import {
  apiUrl,
  absoluteUrl,
  sitemapUrl,
  sitemapXml,
  xmlResponse,
  fetchJson,
} from "../_lib";

export const dynamic = "force-dynamic";

export async function GET() {
  // این endpoint نمونه است. با API واقعی خودت جایگزین کن.
  const data = await fetchJson(`${apiUrl}/admin/suppliers`, {
    suppliers: [],
  });

  const suppliers = Array.isArray(data?.suppliers) ? data.suppliers : [];

  const urls = suppliers
    .filter((item) => item?.id)
    .map((item) =>
      sitemapUrl({
        loc: absoluteUrl(`/suppliers/${encodeURIComponent(item.id)}`),
        lastmod: item.updatedAt || item.createdAt || new Date(),
        changefreq: "weekly",
        priority: "0.7",
      })
    );

  return xmlResponse(sitemapXml(urls));
}
