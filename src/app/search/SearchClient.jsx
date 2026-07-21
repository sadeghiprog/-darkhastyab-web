"use client";

import React, { useState, useEffect } from "react";
import RequestCard from "../../components/common/RequestCard";

// استفاده ایمن از آدرس کلاینت برای جلوگیری از بلاک شدن CORS
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
  const [results, setResults] = useState(initialResults || []);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState((initialResults || []).length === 20);

  // رفع مشکل تغییر عبارت جستجو: با تغییر مقدار جستجو، وضعیت کلاینت کاملا ریست می‌شود
  useEffect(() => {
    setResults(initialResults || []);
    setPage(1);
    setHasMore((initialResults || []).length === 20);
  }, [initialResults, q]);

  const handleLoadMore = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    const nextPage = page + 1;

    try {
      const url = `${CLIENT_API_BASE}/purchase-requests/search?q=${encodeURIComponent(
        q || ""
      )}&page=${nextPage}&limit=20`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("خطا در بارگذاری اطلاعات از سرور");

      const data = await res.json();
      const newItems = normalizeListResponse(data);

      if (newItems.length > 0) {
        setResults((prev) => [...prev, ...newItems]);
        setPage(nextPage);
        // اگر موارد بازگشتی کمتر از حد نصاب باشد یعنی صفحه بعدی وجود ندارد
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
      <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-800">نتایج جستجو</h1>
          <p className="text-slate-500 text-sm mt-1">
            {q ? `نمایش نتایج برای: "${q}"` : "تمام درخواست‌ها"}
          </p>
        </div>
        <span className="bg-slate-100 text-slate-600 px-4 py-2 rounded-2xl text-sm font-bold">
          {results.length} مورد یافت شد
        </span>
      </div>

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

          {/* دکمه لود بیشتر */}
          {hasMore && (
            <div className="flex justify-center mt-8">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold rounded-2xl shadow transition-all duration-200"
              >
                {loading ? "در حال بارگذاری..." : "مشاهده بیشتر"}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-3xl p-20 text-center border border-dashed border-slate-300">
          <h2 className="text-slate-600 font-bold text-lg mb-2">موردی یافت نشد</h2>
          <p className="text-slate-400 text-sm">
            متأسفانه درخواستی برای عبارت &quot;{q}&quot; پیدا نکردیم.
          </p>
        </div>
      )}
    </>
  );
}
