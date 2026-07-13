const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://darkhastyab.com";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://darkhastyab.com/api";

export const siteUrl = SITE_URL.replace(/\/$/, "");
export const apiUrl = API_URL.replace(/\/$/, "");

export function xmlResponse(xml) {
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
      "Pragma": "no-cache",
      "Expires": "0",
    },
  });
}

export function buildUrl(path, paramsObj = {}) {
  const url = new URL(absoluteUrl(path));

  Object.entries(paramsObj).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
}

export function escapeXml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function absoluteUrl(path = "") {
  if (path.startsWith("http")) return path;
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export function sitemapUrl({ loc, lastmod, changefreq = "weekly", priority = "0.7" }) {
  return `
  <url>
    <loc>${escapeXml(loc)}</loc>
    ${lastmod ? `<lastmod>${new Date(lastmod).toISOString()}</lastmod>` : ""}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

export function sitemapXml(urls) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;
}

export function sitemapIndexXml(sitemaps) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps
  .map(
    (item) => `
  <sitemap>
    <loc>${escapeXml(item.loc)}</loc>
    <lastmod>${new Date(item.lastmod || Date.now()).toISOString()}</lastmod>
  </sitemap>`
  )
  .join("\n")}
</sitemapindex>`;
}

export async function fetchJson(url, fallback = null) {
  try {
    const res = await fetch(url, {
      next: { revalidate: 60 },
    });

    if (!res.ok) return fallback;

    return await res.json();
  } catch {
    return fallback;
  }
}
