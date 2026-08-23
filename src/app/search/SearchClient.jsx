"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import RequestCard from "../../components/common/RequestCard";

const CLIENT_API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://api.darkhastyab.com";

function normalizeListResponse(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.requests)) return data.requests;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.items)) return data.items;
  return [];
}

export default function SearchClient({ initialResults, q }) {
  const router = useRouter();

  const [searchInput, setSearchInput] = useState(q || "");
  const [results, setResults] = useState(initialResults || []);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(
    (initialResults || []).length === 20
  );

  useEffect(() => {
    setResults(initialResults || []);
    setPage(1);
    setSearchInput(q || "");
    setHasMore((initialResults || []).length === 20);
  }, [initialResults, q]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();

    const query = searchInput.trim();

    router.push(
      query ? `/search?q=${encodeURIComponent(query)}` : "/search"
    );
  };

  const handleLoadMore = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    const nextPage = page + 1;

    try {
      const url = `${CLIENT_API_BASE}/purchase-requests/search?q=${encodeURIComponent(
        q || ""
      )}&page=${nextPage}&limit=20`;

      const res = await fetch(url);

      if (!res.ok) {
        throw new Error("خطا در بارگذاری اطلاعات از سرور");
      }

      const data = await res.json();
      const newItems = normalizeListResponse(data);

      if (newItems.length > 0) {
        setResults((prev) => [...prev, ...newItems]);
        setPage(nextPage);

        if (newItems.length < 20) {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("خطا در بارگذاری صفحات بعدی:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* باکس مینیمال جستجو و آمار */}
      <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="truncate text-lg font-black text-slate-800">
              نتایج جستجو
            </h1>

            <p className="mt-0.5 truncate text-xs text-slate-500">
              {q ? `برای «${q}»` : "تمام درخواست‌ها"}
            </p>
          </div>

          <span className="shrink-0 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
            {results.length} مورد
          </span>
        </div>

        <form
          onSubmit={handleSearchSubmit}
          className="flex gap-2 rounded-xl bg-slate-50 p-1.5"
        >
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3">
            <Search size={16} className="shrink-0 text-slate-400" />

            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="جستجوی کالا..."
              className="w-full min-w-0 bg-transparent py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400"
            />
          </div>

          <button
            type="submit"
            className="shrink-0 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-cyan-700"
          >
            جستجو
          </button>
        </form>
      </section>

      {/* نمایش نتایج */}
      {results.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3">
            {results.map((req, index) => (
              <RequestCard
                key={req.id ?? index}
                request={req}
                highlight={q}
              />
            ))}
          </div>

          {hasMore && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="rounded-2xl bg-blue-600 px-8 py-3 font-bold text-white shadow transition-all duration-200 hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                {loading ? "در حال بارگذاری..." : "مشاهده بیشتر"}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-20 text-center">
          <h2 className="mb-2 text-lg font-bold text-slate-600">
            موردی یافت نشد
          </h2>

          <p className="text-sm text-slate-400">
            متأسفانه درخواستی برای عبارت &quot;{q}&quot; پیدا نکردیم.
          </p>
        </div>
      )}
    </>
  );
}
