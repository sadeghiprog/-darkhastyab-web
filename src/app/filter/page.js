"use client";

import React, { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import FilterBar from "../../components/common/FilterBar";
import RequestCard from "../../components/common/RequestCard";
import RequestCard2 from "../../components/common/RequestCard2";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";

function SearchResults() {
  const searchParams = useSearchParams();

  const queryString = searchParams.toString();

  const [filteredRequests, setFilteredRequests] = useState([]);
  const [latestRequests, setLatestRequests] = useState([]);

  const [loadingFiltered, setLoadingFiltered] = useState(true);
  const [loadingLatest, setLoadingLatest] = useState(true);

  const apiQueryString = useMemo(() => {
    const params = new URLSearchParams();

    searchParams.forEach((value, key) => {
      if (value && value.trim() !== "") {
        params.set(key, value);
      }
    });

    params.set("page", "1");
    params.set("limit", "20");

    return params.toString();
  }, [queryString, searchParams]);

  useEffect(() => {
    const fetchFilteredRequests = async () => {
      setLoadingFiltered(true);

      try {
        const url = `${API_BASE}/purchase-requests?${apiQueryString}`;

        console.log("SEARCH PAGE QUERY STRING:", queryString);
        console.log("FILTERED API URL:", url);

        const res = await fetch(url, {
          cache: "no-store",
        });

        console.log("FILTERED API STATUS:", res.status);

        if (!res.ok) {
          throw new Error(`Filtered requests fetch failed: ${res.status}`);
        }

        const data = await res.json();

        console.log("FILTERED API DATA:", data);
        console.log("APPLIED FILTERS FROM API:", data?.filters);

        setFilteredRequests(Array.isArray(data?.requests) ? data.requests : []);
      } catch (error) {
        console.error("Filtered requests error:", error);
        setFilteredRequests([]);
      } finally {
        setLoadingFiltered(false);
      }
    };

    fetchFilteredRequests();
  }, [queryString, apiQueryString]);

  useEffect(() => {
    const fetchLatestRequests = async () => {
      setLoadingLatest(true);

      try {
        const url = `${API_BASE}/purchase-requests?limit=3`;

        console.log("LATEST API URL:", url);

        const res = await fetch(url, {
          cache: "no-store",
        });

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
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-[1600px]">
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">
          {/* ستون اصلی */}
          <main className="flex flex-col gap-6 xl:col-span-9">
            {/* فیلتر فقط بالای نتایج */}
            <section className="w-full">
              <FilterBar />
            </section>

            <section className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-800">
                  نتایج جستجو
                </h2>

                <span className="rounded-full border border-slate-200 bg-white px-4 py-1 text-sm font-medium text-slate-500">
                  {filteredRequests.length} مورد
                </span>
              </div>

              {loadingFiltered ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="h-[400px] animate-pulse rounded-3xl bg-white"
                    />
                  ))}
                </div>
              ) : filteredRequests.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3">
                  {filteredRequests.map((req) => (
                    <RequestCard key={req.id} request={req} />
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
                  <p className="font-bold text-slate-400">
                    موردی با این فیلترها یافت نشد.
                  </p>
                </div>
              )}
            </section>
          </main>

          {/* سایدبار */}
          <aside className="flex flex-col gap-6 xl:col-span-3">
            <h2 className="text-2xl font-black text-slate-800">
              جدیدترین‌ها
            </h2>

            {loadingLatest ? (
              <div className="flex flex-col gap-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-[320px] animate-pulse rounded-3xl bg-white"
                  />
                ))}
              </div>
            ) : latestRequests.length > 0 ? (
              <div className="flex flex-col gap-6">
                {latestRequests.map((req) => (
                  <RequestCard2 key={req.id} request={req} />
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-400">
                درخواستی یافت نشد.
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center">در حال بارگذاری...</div>}>
      <SearchResults />
    </Suspense>
  );
}
