import { siteUrl } from "../sitemaps/_lib";

export const dynamic = "force-dynamic";

export async function GET() {
  const content = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
