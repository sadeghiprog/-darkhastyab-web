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
  const [page, setPage] = useState(1);

  const [activeCategoryName, setActiveCategoryName] = useState(
    initialCategoryName
  );

  const [activeProvinceName, setActiveProvinceName] = useState(
    initialProvinceName
  );

  const [loadingFiltered, setLoadingFiltered] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingLatest, setLoadingLatest] = useState(false);

  // ۱. وقتی فیلترها از آدرس تغییر می‌کنند، همه‌چیز را برای نتایج جدید ریست می‌کنیم.
  useEffect(() => {
    setFilteredRequests(initialRequests);
    setTotal(initialTotal);
    setActiveCategoryName(initialCategoryName);
    setActiveProvinceName(initialProvinceName);
    setPage(1); // برگشت به صفحه اول
  }, [
    queryString, // هر زمان پارامترهای جستجو عوض شد
    initialRequests,
    initialTotal,
    initialCategoryName,
    initialProvinceName,
  ]);

  useEffect(() => {
    setLatestRequests(initialLatestRequests);
  }, [initialLatestRequests]);

  // ۲. این متد برای دکمه «مشاهده بیشتر» درخواست صفحه بعدی را می‌فرستد.
  const handleLoadMore = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;

    try {
      const params = new URLSearchParams(queryString);
      params.set("page", nextPage.toString());
      params.set("limit", "20");

      const response = await fetch(`${API_BASE}/purchase-requests?${params.toString()}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Load more failed with status ${response.status}`);
      }

      const data = await response.json();
      const newRequests = getRequests(data);

      // اضافه کردن درخواست‌های جدید به انتهای لیست قبلی
      setFilteredRequests((prev) => [...prev, ...newRequests]);
      setTotal(getTotal(data, newRequests));
      setPage(nextPage);
    } catch (error) {
      console.error("Load more requests error:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  // ۳. این افکت برای زمانی است که کلاینت مستقیماً فیلترها را از طریق سایدبار تغییر می‌دهد
  // و می‌خواهیم اولین صفحه از نتایج فیلتر جدید را دریافت کنیم.
  useEffect(() => {
    // برای تغییرات صفحه اول، از رفتار پیش‌فرضِ سِت شده در افکت اول استفاده می‌کنیم.
    if (page !== 1) return; 

    const controller = new AbortController();

    const fetchFirstPage = async () => {
      setLoadingFiltered(true);
      try {
        const params = new URLSearchParams(queryString);
        params.set("page", "1");
        params.set("limit", "20");

        const response = await fetch(`${API_BASE}/purchase-requests?${params.toString()}`, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Fetch failed with status ${response.status}`);
        }

        const data = await response.json();
        const requests = getRequests(data);

        setFilteredRequests(requests);
        setTotal(getTotal(data, requests));
        setActiveCategoryName(data?.activeCategoryName || "");
        setActiveProvinceName(data?.activeProvinceName || "");
      } catch (error) {
        if (error.name === "AbortError") return;
        console.error("Filtered requests error:", error);
      } finally {
        if (!controller.signal.aborted) {
          setLoadingFiltered(false);
        }
      }
    };

    fetchFirstPage();

    return () => {
      controller.abort();
    };
  }, [queryString]);

  const pageTitle = useMemo(() => {
    return buildPageTitle(activeCategoryName, activeProvinceName);
  }, [activeCategoryName, activeProvinceName]);

  // چک کردن اینکه آیا آیتم بیشتری برای لود کردن وجود دارد یا خیر
  const hasMore = filteredRequests.length < total;

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
                    className={`grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3 transition-opacity ${
                      loadingFiltered ? "opacity-60" : ""
                    }`}
                  >
                    {filteredRequests.map((request, idx) => (
                      // ترکیب ID و Index برای کلید یکتا در هنگام اضافه شدن صفحات
                      <RequestCard
                        key={`${request.id}-${idx}`}
                        request={request}
                      />
                    ))}
                  </div>

                  {/* دکمه مشاهده بیشتر */}
                  {hasMore && (
                    <div className="mt-6 flex justify-center">
                      <button
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400 text-white px-8 py-3.5 text-sm font-bold shadow-md transition-all hover:shadow-lg active:scale-95 duration-200"
                      >
                        {loadingMore ? (
                          <>
                            <svg
                              className="h-5 w-5 animate-spin text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            در حال بارگذاری...
                          </>
                        ) : (
                          "مشاهده درخواست‌های بیشتر"
                        )}
                      </button>
                    </div>
                  )}

                  {!hasMore && filteredRequests.length > 20 && (
                    <p className="mt-8 text-center text-xs text-slate-400">
                      همهٔ درخواست‌ها نمایش داده شدند.
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
