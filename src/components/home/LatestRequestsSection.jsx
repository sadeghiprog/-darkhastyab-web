"use client";

import React, { useEffect, useState } from "react";
import RequestCard2 from "../common/RequestCard2";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";

export default function LatestRequestsSection() {
  const [latestRequests, setLatestRequests] = useState([]);
  const [loadingLatest, setLoadingLatest] = useState(true);

  useEffect(() => {
    const fetchLatestRequests = async () => {
      setLoadingLatest(true);

      try {
        const url = `${API_BASE}/purchase-requests?limit=6`;
        const res = await fetch(url, { cache: "no-store" });

        if (!res.ok) {
          throw new Error(`Latest requests fetch failed: ${res.status}`);
        }

        const data = await res.json();
        setLatestRequests(Array.isArray(data?.requests) ? data.requests : []);
      } catch (error) {
        console.error("Latest requests error:", error);
        setLatestRequests([]);
      } finally {
        setLoadingLatest(false);
      }
    };

    fetchLatestRequests();
  }, []);

  return (
    <section className="w-full px-4 pb-16 pt-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-black text-slate-800">
              جدیدترین درخواست‌ها
            </h2>
            <p className="text-sm text-slate-500">
              تازه‌ترین درخواست‌های ثبت‌شده را اینجا ببینید
            </p>
          </div>

          <a
            href="/filter"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-cyan-200 hover:text-cyan-700"
          >
            مشاهده همه
          </a>
        </div>

        {loadingLatest ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-[170px] animate-pulse rounded-3xl bg-white"
              />
            ))}
          </div>
        ) : latestRequests.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {latestRequests.map((req) => (
              <RequestCard2 key={req.id} request={req} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <p className="font-bold text-slate-400">درخواستی یافت نشد.</p>
          </div>
        )}
      </div>
    </section>
  );
}
