"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import FilterBar from "../../components/common/FilterBar";
import RequestCard from "../../components/common/RequestCard";
import RequestCard2 from "../../components/common/RequestCard2";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";

function buildPageTitle(categoryName, provinceName) {
  if (categoryName && provinceName) {
    return `درخواست های ${categoryName} در ${provinceName}`;
  }

  if (categoryName) {
    return `درخواست های ${categoryName}`;
  }

  if (provinceName) {
    return `درخواست های خرید در ${provinceName}`;
  }

  return "درخواست های خرید";
}

function getRequests(data) {
  if (Array.isArray(data?.requests)) {
    return data.requests;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
}

function getTotal(data, requests) {
  const candidates = [
    data?.total,
    data?.count,
    data?.totalCount,
    data?.pagination?.total,
    data?.pagination?.totalCount,
    data?.meta?.total,
    data?.meta?.totalCount,
  ];

  const total = candidates.find(
    (value) =>
      value !== null &&
      value !== undefined &&
      value !== "" &&
      Number.isFinite(Number(value))
  );

  return total !== undefined ? Number(total) : requests.length;
}

function SearchResults({
  initialRequests = [],
  initialTotal = 0,
  initialCategoryName = "",
  initialProvinceName = "",
  initialLatestRequests = [],
}) {
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();

  const [filteredRequests, setFilteredRequests] = useState(initialRequests);
  const [total, setTotal] = useState(initialTotal);
  const [latestRequests, setLatestRequests] = useState(initialLatestRequests);

  const [activeCategoryName, setActiveCategoryName] = useState(
    initialCategoryName
  );

  const [activeProvinceName, setActiveProvinceName] = useState(
    initialProvinceName
  );

  const [loadingFiltered, setLoadingFiltered] = useState(false);
  const [loadingLatest, setLoadingLatest] = useState(false);

  const apiQueryString = useMemo(() => {
    const params = new URLSearchParams(queryString);

    for (const [key, value] of [...params.entries()]) {
      if (!value || value.trim() === "") {
        params.delete(key);
      }
    }

    params.set("page", "1");
    params.set("limit", "20");

    return params.toString();
  }, [queryString]);

  useEffect(() => {
    setFilteredRequests(initialRequests);
    setTotal(initialTotal);
    setActiveCategoryName(initialCategoryName);
    setActiveProvinceName(initialProvinceName);
  }, [
    initialRequests,
    initialTotal,
    initialCategoryName,
    initialProvinceName,
  ]);

  useEffect(() => {
    setLatestRequests(initialLatestRequests);
  }, [initialLatestRequests]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchFilteredRequests = async () => {
      setLoadingFiltered(true);

      try {
        const url = `${API_BASE}/purchase-requests?${apiQueryString}`;

        const response = await fetch(url, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(
            `Filtered requests fetch failed with status ${response.status}`
          );
        }

        const data = await response.json();
        const requests = getRequests(data);

        setFilteredRequests(requests);
        setTotal(getTotal(data, requests));
        setActiveCategoryName(data?.activeCategoryName || "");
        setActiveProvinceName(data?.activeProvinceName || "");
      } catch (error) {
        if (error.name === "AbortError") {
          return;
        }

        console.error("Filtered requests error:", error);

        // اطلاعات رندرشده سمت سرور را در صورت خطای موقت حذف نمی‌کنیم.
      } finally {
        if (!controller.signal.aborted) {
          setLoadingFiltered(false);
        }
      }
    };

    fetchFilteredRequests();

    return () => {
      controller.abort();
    };
  }, [apiQueryString]);

  const pageTitle = useMemo(() => {
    return buildPageTitle(activeCategoryName, activeProvinceName);
  }, [activeCategoryName, activeProvinceName]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-[1600px]">
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">
          <main className="flex flex-col gap-6 xl:col-span-9">
            <section className="w-full">
              <FilterBar />
            </section>

            <section className="flex flex-col gap-6">
              <div className="flex items-center justify-between gap-4">
                <h1 className="text-2xl font-black text-slate-800">
                  {pageTitle}
                </h1>

                <span
                  className="shrink-0 rounded-full border border-slate-200 bg-white px-4 py-1 text-sm font-medium text-slate-500"
                  aria-live="polite"
                >
                  {loadingFiltered && filteredRequests.length === 0
                    ? "در حال بارگذاری..."
                    : `${total} مورد`}
                </span>
              </div>

              {loadingFiltered && filteredRequests.length === 0 ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3">
                  {[1, 2, 3, 4, 5, 6].map((item) => (
                    <div
                      key={item}
                      className="h-[400px] animate-pulse rounded-3xl bg-white"
                    />
                  ))}
                </div>
              ) : filteredRequests.length > 0 ? (
                <>
                  <div
                    className={`grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3 ${
                      loadingFiltered ? "opacity-60" : ""
                    }`}
                  >
                    {filteredRequests.map((request) => (
                      <RequestCard
                        key={request.id}
                        request={request}
                      />
                    ))}
                  </div>

                  {loadingFiltered && (
                    <p className="text-center text-sm text-slate-400">
                      در حال به‌روزرسانی نتایج...
                    </p>
                  )}
                </>
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
                  <p className="font-bold text-slate-400">
                    موردی با این فیلترها یافت نشد.
                  </p>
                </div>
              )}
            </section>
          </main>

          <aside className="flex flex-col gap-6 xl:col-span-3">
            <h2 className="text-2xl font-black text-slate-800">
              جدیدترین‌ها
            </h2>

            {loadingLatest && latestRequests.length === 0 ? (
              <div className="flex flex-col gap-6">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-[320px] animate-pulse rounded-3xl bg-white"
                  />
                ))}
              </div>
            ) : latestRequests.length > 0 ? (
              <div className="flex flex-col gap-6">
                {latestRequests.map((request) => (
                  <RequestCard2
                    key={request.id}
                    request={request}
                  />
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

export default function SearchPage(props) {
  return (
    <Suspense
      fallback={
        <div className="p-20 text-center">
          در حال بارگذاری...
        </div>
      }
    >
      <SearchResults {...props} />
    </Suspense>
  );
}
