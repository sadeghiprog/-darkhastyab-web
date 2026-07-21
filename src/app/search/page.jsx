import React from "react";
import RequestCard2 from "../../components/common/RequestCard2";
import SearchClient from "./SearchClient";

const API_BASE =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://api.darkhastyab.com";

async function fetchJson(url, options = {}) {
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      console.error("Fetch failed status:", res.status, "for URL:", url);
      return null;
    }
    return await res.json();
  } catch (error) {
    console.error("Fetch error on URL:", url, error);
    return null;
  }
}

function normalizeListResponse(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.requests)) return data.requests;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.items)) return data.items;
  return [];
}

async function getSearchResults(query) {
  const url = `${API_BASE}/purchase-requests/search?q=${encodeURIComponent(
    query || ""
  )}&page=1&limit=20`;

  const data = await fetchJson(url, { cache: "no-store" });
  return normalizeListResponse(data);
}

async function getLatestRequests() {
  const url = `${API_BASE}/purchase-requests?limit=3`;
  const data = await fetchJson(url, {
    next: { revalidate: 60 },
  });
  return normalizeListResponse(data);
}

export async function generateMetadata({ searchParams }) {
  const resolvedParams = await searchParams;
  const q = resolvedParams?.q || "";

  const title = q
    ? `درخواست‌های خرید و تامین ${q} | درخواست یاب`
    : "جستجوی درخواست‌های خرید و استعلام قیمت | درخواست یاب";

  const description = q
    ? `جدیدترین درخواست‌های خرید، تامین و استعلام قیمت مرتبط با "${q}".`
    : "جستجو و فیلتر کردن درخواست‌های خرید و استعلام قیمت کالاها در سراسر ایران.";

  return {
    title,
    description,
    alternates: {
      canonical: `https://darkhastyab.com/search${q ? `?q=${encodeURIComponent(q)}` : ""}`,
    },
    openGraph: {
      title,
      description,
      url: `https://darkhastyab.com/search${q ? `?q=${encodeURIComponent(q)}` : ""}`,
      siteName: "درخواست یاب",
      locale: "fa_IR",
      type: "website",
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function SearchPage({ searchParams }) {
  const resolvedParams = await searchParams;
  const q = resolvedParams?.q || "";

  const [initialResults, latestRequests] = await Promise.all([
    getSearchResults(q),
    getLatestRequests(),
  ]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8" dir="rtl">
      <div className="mx-auto max-w-[1600px]">
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">
          {/* بخش نتایج پویا */}
          <main className="flex flex-col gap-6 xl:col-span-9">
            <SearchClient 
              initialResults={initialResults} 
              q={q} 
            />
          </main>

          {/* سایدبار */}
          <aside className="flex flex-col gap-6 xl:col-span-3">
            <h2 className="text-xl font-black text-slate-800">جدیدترین درخواست‌ها</h2>
            <div className="flex flex-col gap-4">
              {latestRequests.length > 0 ? (
                latestRequests.map((req, index) => (
                  <RequestCard2 key={req.id ?? index} request={req} />
                ))
              ) : (
                <p className="text-slate-400 text-xs bg-white rounded-2xl p-4">
                  درخواستی موجود نیست.
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
