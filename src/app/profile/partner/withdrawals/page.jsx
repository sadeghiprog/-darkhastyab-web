"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { apiFetch } from "../../../../lib/api2";
import PageHeader from "../../../../components/ui/PageHeader";
import EmptyState from "../../../../components/ui/EmptyState";
import Pagination from "../../../../components/ui/Pagination";

const PAGE_SIZE = 10;

const STATUS_LABEL = {
  PENDING: {
    text: "در انتظار بررسی",
    color: "text-amber-700",
    bg: "bg-amber-50",
  },
  PAID: {
    text: "پرداخت شده",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
  },
  REJECTED: {
    text: "رد شده",
    color: "text-red-700",
    bg: "bg-red-50",
  },
  CANCELLED: {
    text: "لغو شده",
    color: "text-slate-700",
    bg: "bg-slate-100",
  },
};

/**
 * استخراج پاسخ لیست برداشت‌ها
 *
 * ساختار اصلی سرویس بک‌اند:
 *
 * {
 *   requests: [...],
 *   pagination: {
 *     page: 1,
 *     limit: 10,
 *     total: 5,
 *     totalPages: 1
 *   }
 * }
 *
 * در صورت wrapper شدن پاسخ:
 *
 * {
 *   data: {
 *     requests: [...],
 *     pagination: {...}
 *   }
 * }
 */
function extractWithdrawalsResponse(response) {
  const root = response || {};

  /*
   * اگر apiFetch از Axios استفاده کند، ممکن است response.data
   * همان بدنه واقعی پاسخ باشد.
   *
   * اگر apiFetch خودش response.data را برگرداند، root همان بدنه است.
   */
  const body = root?.data ?? root;

  const requests = Array.isArray(body?.requests)
    ? body.requests
    : Array.isArray(body?.items)
      ? body.items
      : Array.isArray(body?.withdrawals)
        ? body.withdrawals
        : Array.isArray(body)
          ? body
          : [];

  const pagination = body?.pagination || {};

  const totalPages = Math.max(
    1,
    Number(
      pagination?.totalPages ??
        body?.totalPages ??
        root?.pagination?.totalPages ??
        root?.totalPages ??
        1
    ) || 1
  );

  const currentPage = Math.max(
    1,
    Number(pagination?.page ?? body?.page ?? 1) || 1
  );

  const total = Math.max(
    0,
    Number(pagination?.total ?? body?.total ?? requests.length) || 0
  );

  return {
    requests,
    pagination: {
      page: currentPage,
      total,
      totalPages,
    },
  };
}

function formatAmount(amount) {
  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount)) {
    return "—";
  }

  return `${numericAmount.toLocaleString("fa-IR")} تومان`;
}

function formatDate(date) {
  if (!date) {
    return "—";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return parsedDate.toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(date) {
  if (!date) {
    return "";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return parsedDate.toLocaleTimeString("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusMeta(status) {
  return (
    STATUS_LABEL[status] || {
      text: status || "نامشخص",
      color: "text-slate-700",
      bg: "bg-slate-100",
    }
  );
}

function getRowKey(withdrawal, index) {
  return (
    withdrawal?.id ||
    withdrawal?.createdAt ||
    withdrawal?.trackingCode ||
    `withdrawal-${index}`
  );
}

export default function PartnerWithdrawalsPage() {
  const router = useRouter();

  const [requests, setRequests] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadWithdrawals = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      });

      if (status) {
        params.set("status", status);
      }

      const response = await apiFetch(
        `/partner/withdrawals?${params.toString()}`
      );

      const result = extractWithdrawalsResponse(response);

      setRequests(result.requests);
      setTotalPages(result.pagination.totalPages);
      setTotal(result.pagination.total);
    } catch (err) {
      console.error("Load partner withdrawals error:", err);

      setRequests([]);
      setTotalPages(1);
      setTotal(0);

      setError(
        err?.message || "دریافت درخواست‌های برداشت با خطا مواجه شد."
      );
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => {
    loadWithdrawals();
  }, [loadWithdrawals]);

  function handleStatusChange(event) {
    setStatus(event.target.value);
    setPage(1);
  }

  function handleNewWithdrawal() {
    router.push("/profile/partner/withdrawals/new");
  }

  function handleShowDetail(id) {
    if (!id) {
      return;
    }

    router.push(`/profile/partner/withdrawals/${id}`);
  }

  const hasRequests = Array.isArray(requests) && requests.length > 0;

  return (
    <div dir="rtl" className="space-y-5">
      <PageHeader
        title="درخواست‌های برداشت"
        description="سوابق درخواست‌های برداشت پورسانت شما"
        action={
          <button
            type="button"
            onClick={handleNewWithdrawal}
            className="rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-cyan-600"
          >
            + درخواست برداشت
          </button>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <label
            htmlFor="withdrawal-status"
            className="text-sm font-medium text-slate-600"
          >
            وضعیت:
          </label>

          <select
            id="withdrawal-status"
            value={status}
            onChange={handleStatusChange}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
          >
            <option value="">همه وضعیت‌ها</option>
            <option value="PENDING">در انتظار بررسی</option>
            <option value="PAID">پرداخت شده</option>
            <option value="REJECTED">رد شده</option>
            <option value="CANCELLED">لغو شده</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          {!loading && total > 0 && (
            <span className="text-xs text-slate-400">
              {total.toLocaleString("fa-IR")} درخواست
            </span>
          )}

          <button
            type="button"
            onClick={loadWithdrawals}
            disabled={loading}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "در حال دریافت…" : "به‌روزرسانی"}
          </button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <span>{error}</span>

          <button
            type="button"
            onClick={loadWithdrawals}
            className="shrink-0 rounded-lg px-2 py-1 text-xs font-bold text-red-800 transition hover:bg-red-100"
          >
            تلاش مجدد
          </button>
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-slate-100 bg-white py-20 text-center text-sm text-slate-400">
          در حال بارگذاری درخواست‌های برداشت…
        </div>
      ) : !hasRequests ? (
        <EmptyState
          title="درخواستی یافت نشد"
          description={
            status
              ? "درخواستی با وضعیت انتخاب‌شده وجود ندارد."
              : "هنوز درخواست برداشتی ثبت نکرده‌اید."
          }
        />
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-right text-xs text-slate-500">
                    <th className="px-4 py-3 font-bold">مبلغ</th>
                    <th className="px-4 py-3 font-bold">وضعیت</th>
                    <th className="px-4 py-3 font-bold">شماره کارت</th>
                    <th className="px-4 py-3 font-bold">شماره رهگیری</th>
                    <th className="px-4 py-3 font-bold">تاریخ درخواست</th>
                    <th className="px-4 py-3 font-bold">عملیات</th>
                  </tr>
                </thead>

                <tbody>
                  {requests.map((withdrawal, index) => {
                    const statusMeta = getStatusMeta(withdrawal?.status);

                    return (
                      <tr
                        key={getRowKey(withdrawal, index)}
                        className="border-b border-slate-100 transition last:border-b-0 hover:bg-slate-50/70"
                      >
                        <td className="whitespace-nowrap px-4 py-4 font-black text-slate-800">
                          {formatAmount(withdrawal?.amount)}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${statusMeta.bg} ${statusMeta.color}`}
                          >
                            {statusMeta.text}
                          </span>
                        </td>

                        <td
                          dir="ltr"
                          className="whitespace-nowrap px-4 py-4 text-left font-mono text-xs text-slate-600"
                        >
                          {withdrawal?.cardNumber || "—"}
                        </td>

                        <td
                          dir="ltr"
                          className="whitespace-nowrap px-4 py-4 text-left font-mono text-xs text-slate-600"
                        >
                          {withdrawal?.trackingCode || "—"}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-slate-500">
                          <div>{formatDate(withdrawal?.createdAt)}</div>

                          {formatTime(withdrawal?.createdAt) && (
                            <div className="mt-1 text-xs text-slate-400">
                              {formatTime(withdrawal?.createdAt)}
                            </div>
                          )}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4">
                          {withdrawal?.id ? (
                            <button
                              type="button"
                              onClick={() =>
                                handleShowDetail(withdrawal.id)
                              }
                              className="rounded-lg px-2 py-1 text-xs font-bold text-cyan-600 transition hover:bg-cyan-50 hover:text-cyan-800"
                            >
                              مشاهده جزئیات
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400">
                              —
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              onChange={setPage}
            />
          )}
        </>
      )}
    </div>
  );
}
