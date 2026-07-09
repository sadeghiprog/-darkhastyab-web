import { absoluteUrl, apiUrl, fetchJson, sitemapUrl, sitemapXml, xmlResponse } from "../_lib";

export const dynamic = "force-dynamic";

export async function GET() {
    console.log("requests sitemap route hit");

  const data = await fetchJson(
    `${apiUrl}/purchase-requests/request_sitemap`,
    { requests: [] }
  );
  console.log("eeeeeeeeeee",data)
  
  const requests = data.requests || [];

  const urls = requests
    .filter((request) => request.slug)
    .map((request) =>
      sitemapUrl({
        loc: absoluteUrl(`/request/${encodeURIComponent(request.slug)}`),
        lastmod: request.updatedAt || request.createdAt,
        changefreq: "daily",
        priority: "0.9",
      })
    );

  return xmlResponse(sitemapXml(urls));
}
