"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import RequestCard2 from "../../../../components/common/RequestCard2";

const API = process.env.NEXT_PUBLIC_API_URL;

const STATUS_OPTIONS = [
  { label: "همه", value: "ALL" },
  { label: "منتشر شده", value: "PUBLISHED" },
  { label: "در حال بررسی", value: "UNDER_REVIEW" },
  { label: "نیاز به ویرایش", value: "NEEDS_EDIT" },
  { label: "منقضی شده", value: "EXPIRED" },
];

const EXTEND_OPTIONS = [
  { label: "۱ روز", value: "1" },
  { label: "۳ روز", value: "3" },
  { label: "۷ روز", value: "7" },
  { label: "۱۴ روز", value: "14" },
  { label: "۳۰ روز", value: "30" },
  { label: "بدون انقضا", value: "100000" },
];

export default function AdminRequestsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const status = searchParams.get("status") || "ALL";
  const page = Math.max(Number(searchParams.get("page")) || 1, 1);

  const [requests, setRequests] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [extendDays, setExtendDays] = useState("30");
  const [extendLoading, setExtendLoading] = useState(false);

  const currentListUrl = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (!params.get("status")) {
      params.set("status", status);
    }

    if (!params.get("page")) {
      params.set("page", String(page));
    }

    return `${pathname}?${params.toString()}`;
  }, [pathname, searchParams, status, page]);

  const updateQuery = useCallback(
    (nextStatus, nextPage) => {
      const params = new URLSearchParams(searchParams.toString());

      params.set("status", nextStatus);
      params.set("page", String(nextPage));

      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const fetchRequests = useCallback(
    async (signal) => {
      setLoading(true);

      try {
        const res = await fetch(
          `${API}/purchase-requests2/admin?status=${encodeURIComponent(
            status
          )}&page=${page}&_t=${Date.now()}`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
            headers: {
              "Cache-Control": "no-cache, no-store, must-revalidate",
              Pragma: "no-cache",
              Expires: "0",
            },
            signal,
          }
        );

        if (!res.ok) {
          throw new Error(`Failed to fetch requests: ${res.status}`);
        }

        const data = await res.json();

        setRequests(Array.isArray(data.items) ? data.items : []);
        setTotalPages(Math.max(Number(data.totalPages) || 1, 1));
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("fetchRequests error:", error);
          setRequests([]);
          setTotalPages(1);
        }
      } finally {
        setLoading(false);
      }
    },
    [status, page]
  );

  const handleExtendExpired = useCallback(async () => {
    const days = Number(extendDays);

    if (!days || days < 1) {
      alert("تعداد روز نامعتبر است.");
      return;
    }

    const selectedOption =
      EXTEND_OPTIONS.find((option) => option.value === extendDays)?.label ||
      `${days} روز`;

    const confirmed = window.confirm(
      `آیا مطمئن هستید که می‌خواهید همه درخواست‌های منقضی‌شده ${selectedOption} تمدید شوند؟`
    );

    if (!confirmed) {
      return;
    }

    setExtendLoading(true);

    try {
      const res = await fetch(`${API}/purchase-requests2/admin/extend-expired`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
        body: JSON.stringify({
          days,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "خطا در تمدید درخواست‌های منقضی‌شده");
      }

      alert(data?.message || "درخواست‌های منقضی‌شده با موفقیت تمدید شدند.");
      setRefreshKey((prev) => prev + 1);

      if (status !== "EXPIRED") {
        updateQuery("EXPIRED", 1);
      }
    } catch (error) {
      console.error("extendExpiredRequests error:", error);
      alert(error.message || "عملیات تمدید انجام نشد.");
    } finally {
      setExtendLoading(false);
    }
  }, [extendDays, status, updateQuery]);

  useEffect(() => {
    const controller = new AbortController();
    fetchRequests(controller.signal);
    return () => controller.abort();
  }, [fetchRequests, refreshKey]);

  useEffect(() => {
    const refresh = () => {
      setRefreshKey((prev) => prev + 1);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refresh();
      }
    };

    window.addEventListener("focus", refresh);
    window.addEventListener("pageshow", refresh);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("pageshow", refresh);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (!searchParams.get("status") || !searchParams.get("page")) {
      const params = new URLSearchParams(searchParams.toString());

      if (!searchParams.get("status")) {
        params.set("status", status);
      }

      if (!searchParams.get("page")) {
        params.set("page", String(page));
      }

      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [router, pathname, searchParams, status, page]);

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold">مدیریت درخواست‌ها</h1>
          <p className="text-sm text-gray-500 mt-1">
            مشاهده و مدیریت درخواست‌های ثبت‌شده
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={extendDays}
            onChange={(e) => setExtendDays(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
            disabled={extendLoading}
          >
            {EXTEND_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleExtendExpired}
            disabled={extendLoading}
            className="px-4 py-2 rounded-lg bg-black text-white text-sm disabled:opacity-50"
          >
            {extendLoading ? "در حال تمدید..." : "تمدید درخواست‌های منقضی‌شده"}
          </button>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        {STATUS_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => updateQuery(option.value, 1)}
            className={`px-4 py-1.5 rounded-full text-xs border transition ${
              status === option.value
                ? "bg-black text-white border-black"
                : "bg-white text-gray-600 border-gray-200 hover:border-black"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6">
        {loading ? (
          <div className="text-center text-sm text-gray-400 py-12">
            در حال بارگذاری...
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center text-sm text-gray-400 py-12">
            موردی یافت نشد
          </div>
        ) : (
          requests.map((request) => (
            <Link
              key={request.id}
              href={`/request/${request.slug}?returnTo=${encodeURIComponent(
                currentListUrl
              )}`}
              className="block"
            >
              <RequestCard2 request={request} adminView />
            </Link>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => updateQuery(status, page - 1)}
            className="px-3 py-1 text-xs border rounded disabled:opacity-30"
          >
            قبلی
          </button>

          <span className="text-xs px-3 py-1">
            صفحه {page} از {totalPages}
          </span>

          <button
            type="button"
            disabled={page === totalPages}
            onClick={() => updateQuery(status, page + 1)}
            className="px-3 py-1 text-xs border rounded disabled:opacity-30"
          >
            بعدی
          </button>
        </div>
      )}
    </div>
  );
}
