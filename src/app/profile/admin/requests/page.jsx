"use client";

import { useEffect, useState } from "react";
import RequestCard2 from "../../../../components/common/RequestCard2";

const API = process.env.NEXT_PUBLIC_API_URL;

const STATUS_OPTIONS = [
  { label: "همه", value: "ALL" },
  { label: "منتشر شده", value: "PUBLISHED" },
  { label: "در حال بررسی", value: "UNDER_REVIEW" },
  { label: "نیاز به ویرایش", value: "NEEDS_EDIT" },
];

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchRequests = async () => {
    const res = await fetch(
      `${API}/purchase-requests2/admin?status=${status}&page=${page}`,
      { credentials: "include" }
    );

    const data = await res.json();

    setRequests(data.items);
    setTotalPages(data.totalPages);
  };

  useEffect(() => {
    fetchRequests();
  }, [status, page]);

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">
            مدیریت درخواست‌ها
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            مشاهده و مدیریت درخواست‌های ثبت‌شده
          </p>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex gap-3 flex-wrap">
        {STATUS_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => {
              setStatus(option.value);
              setPage(1);
            }}
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

      {/* Cards */}
      <div className="grid gap-6">
        {requests.length === 0 ? (
          <div className="text-center text-sm text-gray-400 py-12">
            موردی یافت نشد
          </div>
        ) : (
          requests.map((request) => (
            <RequestCard2
              key={request.id}
              request={request}
              adminView
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4">

          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 text-xs border rounded disabled:opacity-30"
          >
            قبلی
          </button>

          <span className="text-xs px-3 py-1">
            صفحه {page} از {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 text-xs border rounded disabled:opacity-30"
          >
            بعدی
          </button>

        </div>
      )}
    </div>
  );
}
