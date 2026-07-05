"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import RequestCard from "../../components/common/RequestCard";
import RequestCard2 from "../../components/common/RequestCard2";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  console.log("/////////////",q);

  const [results, setResults] = useState([]);
  const [latestRequests, setLatestRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // ۱. دریافت نتایج جستجو
        const searchRes = await fetch(`${API_BASE}/purchase-requests/search?q=${encodeURIComponent(q)}&limit=15`);
        const searchData = await searchRes.json();
        setResults(searchData.requests || []);

        // ۲. دریافت جدیدترین‌ها برای سایدبار
        const latestRes = await fetch(`${API_BASE}/purchase-requests?limit=3`);
        const latestData = await latestRes.json();
        setLatestRequests(latestData.requests || []);
      } catch (error) {
        console.error("Search Page Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [q]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8" dir="rtl">
      <div className="mx-auto max-w-[1600px]">
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">
          
          {/* ستون اصلی نتایج */}
          <main className="flex flex-col gap-6 xl:col-span-9">
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

            {loading ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-64 animate-pulse rounded-3xl bg-white" />
                ))}
              </div>
            ) : results.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3">
                {results.map((req) => (
                  <RequestCard key={req.id} request={req} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-20 text-center border border-dashed border-slate-300">
                <p className="text-slate-400 font-bold">متأسفانه موردی یافت نشد.</p>
              </div>
            )}
          </main>

          {/* سایدبار جدیدترین‌ها */}
          <aside className="flex flex-col gap-6 xl:col-span-3">
            <h2 className="text-xl font-black text-slate-800">جدیدترین درخواست‌ها</h2>
            <div className="flex flex-col gap-4">
              {latestRequests.map((req) => (
                <RequestCard2 key={req.id} request={req} />
              ))}
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center">در حال بارگذاری...</div>}>
      <SearchResultsContent />
    </Suspense>
  );
}
