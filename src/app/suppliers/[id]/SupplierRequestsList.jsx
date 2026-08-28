// components/common/SupplierRequestsList.jsx
"use client";

import { useEffect, useState } from "react";
import RequestCard from "../../../components/common/RequestCard";
import { ChevronRight, ChevronLeft, Loader2 } from "lucide-react";

export default function SupplierRequestsList({ supplierId }) {
  const [requests, setRequests] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchRequests() {
      setLoading(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
        const res = await fetch(
          `${apiUrl}/supplier-profile/${supplierId}/requests?page=${page}&limit=12`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch requests");

        const data = await res.json();

        if (isMounted) {
          setRequests(data.requests || []);
          setPagination(data.pagination || null);
        }
      } catch (error) {
        console.error("Error fetching supplier requests:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchRequests();

    return () => {
      isMounted = false;
    };
  }, [supplierId, page]);

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-lg text-slate-800">
          درخواست‌های ثبت‌شده{" "}
          {pagination?.total ? (
            <span className="text-sm font-normal text-slate-500">
              ({pagination.total.toLocaleString("fa-IR")} مورد)
            </span>
          ) : null}
        </h2>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm text-slate-500 gap-3">
          <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
          <span className="text-sm">در حال بارگذاری درخواست‌ها...</span>
        </div>
      ) : requests.length > 0 ? (
        <div className="space-y-6">
          {/* گرید ۴ ستونه */}
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {requests.map((req) => (
              <RequestCard key={req.id} request={req} />
            ))}
          </div>

          {/* نوار صفحه‌بندی (Pagination) */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                type="button"
                disabled={!pagination.hasPreviousPage}
                onClick={() => {
                  setPage((prev) => Math.max(prev - 1, 1));
                  window.scrollTo({ top: 300, behavior: "smooth" });
                }}
                className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <ChevronRight className="w-4 h-4" />
                صفحه قبل
              </button>

              <span className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl">
                صفحه {pagination.page?.toLocaleString("fa-IR")} از{" "}
                {pagination.totalPages?.toLocaleString("fa-IR")}
              </span>

              <button
                type="button"
                disabled={!pagination.hasNextPage}
                onClick={() => {
                  setPage((prev) => prev + 1);
                  window.scrollTo({ top: 300, behavior: "smooth" });
                }}
                className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                صفحه بعد
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 text-slate-500 bg-white rounded-2xl border border-slate-100 shadow-sm">
          هیچ درخواستی توسط این تامین‌کننده ثبت نشده است.
        </div>
      )}
    </div>
  );
}
