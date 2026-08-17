"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { apiFetch } from "../../../../../lib/api2";
import PageHeader from "../../../../../components/ui/PageHeader";
import StatCard from "../../../../../components/ui/StatCard";
import EmptyState from "../../../../../components/ui/EmptyState";

/* ------------------------------------------------------------------
 * استخراج پاسخ getPartnerDetails
 * ------------------------------------------------------------------ */
function extractPartnerDetailsResponse(response) {
  const root =
    response?.data && typeof response.data === "object"
      ? response.data
      : response || {};

  const partner = root.partner || {};
  const users = Array.isArray(root.users) ? root.users : [];
  const summary = root.summary || {};
  const stats = extractPartnerStats(root.stats);

  return {
    partner,
    users,
    summary: {
      totalUsers: Number(summary.totalUsers ?? users.length) || 0,
      totalPurchases: Number(summary.totalPurchases ?? 0) || 0,
      totalCommission: Number(summary.totalCommission ?? 0) || 0,
    },
    stats,
  };
}

/* ------------------------------------------------------------------
 * استخراج امن آمار ۹گانه پورسانت
 * ------------------------------------------------------------------ */
function extractPartnerStats(stats) {
  return {
    approvedSuppliersCount: Number(stats?.approvedSuppliersCount ?? 0) || 0,
    supplierRegistrationIncome:
      Number(stats?.supplierRegistrationIncome ?? 0) || 0,
    purchaseRequestsCount: Number(stats?.purchaseRequestsCount ?? 0) || 0,
    purchaseRequestIncome: Number(stats?.purchaseRequestIncome ?? 0) || 0,
    commissionCount: Number(stats?.commissionCount ?? 0) || 0,
    commissionIncome: Number(stats?.commissionIncome ?? 0) || 0,
    totalIncome: Number(stats?.totalIncome ?? 0) || 0,
    totalWithdrawals: Number(stats?.totalWithdrawals ?? 0) || 0,
    currentBalance: Number(stats?.currentBalance ?? 0) || 0,
  };
}

function extractWithdrawalsResponse(response) {
  const root =
    response?.data && typeof response.data === "object"
      ? response.data
      : response || {};

  if (Array.isArray(root.requests)) return root.requests;
  if (Array.isArray(root.withdrawals)) return root.withdrawals;
  if (Array.isArray(root.data)) return root.data;
  if (Array.isArray(root)) return root;

  return [];
}

function formatAmount(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) return "۰ تومان";
  return `${amount.toLocaleString("fa-IR")} تومان`;
}

function formatNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number.toLocaleString("fa-IR") : "۰";
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function statusConfig(status) {
  const statuses = {
    PAID: {
      label: "پرداخت شده",
      badgeClass:
        "bg-emerald-50 text-emerald-700 border border-emerald-100",
      dotClass: "bg-emerald-500",
    },
    REJECTED: {
      label: "رد شده",
      badgeClass: "bg-red-50 text-red-700 border border-red-100",
      dotClass: "bg-red-500",
    },
    PENDING: {
      label: "در انتظار",
      badgeClass: "bg-amber-50 text-amber-700 border border-amber-100",
      dotClass: "bg-amber-500",
    },
  };

  return (
    statuses[status] || {
      label: status || "—",
      badgeClass: "bg-slate-50 text-slate-600 border border-slate-200",
      dotClass: "bg-slate-400",
    }
  );
}

function statusBadge(status) {
  const item = statusConfig(status);

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${item.badgeClass}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${item.dotClass}`} />
      {item.label}
    </span>
  );
}

function supplierStatusLabel(status) {
  const statuses = {
    PENDING: "در انتظار تایید",
    APPROVED: "تایید شده",
    REJECTED: "رد شده",
  };

  return statuses[status] || "—";
}

function getWithdrawalCardNumber(withdrawal) {
  return (
    withdrawal.cardNumber ||
    withdrawal.bankCardNumber ||
    withdrawal.card?.cardNumber ||
    withdrawal.bankCard?.cardNumber ||
    withdrawal.destinationCard?.cardNumber ||
    "—"
  );
}

function getWithdrawalCardHolderName(withdrawal) {
  return (
    withdrawal.cardHolderName ||
    withdrawal.accountHolderName ||
    withdrawal.card?.cardHolderName ||
    withdrawal.card?.holderName ||
    withdrawal.bankCard?.cardHolderName ||
    withdrawal.bankCard?.holderName ||
    withdrawal.destinationCard?.cardHolderName ||
    withdrawal.destinationCard?.holderName ||
    "—"
  );
}

function InfoRow({ label, value, ltr = false }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl bg-slate-50/80 px-3 py-2">
      <span className="shrink-0 text-xs text-slate-400">{label}</span>
      <span
        dir={ltr ? "ltr" : undefined}
        className="min-w-0 text-left text-sm font-medium text-slate-700 break-all"
      >
        {value || "—"}
      </span>
    </div>
  );
}

function WithdrawalCard({
  withdrawal,
  actingId,
  onApprove,
  onReject,
}) {
  const isProcessing = actingId === withdrawal.id;
  const cardNumber = getWithdrawalCardNumber(withdrawal);
  const cardHolderName = getWithdrawalCardHolderName(withdrawal);
  const isPending = withdrawal.status === "PENDING";

  return (
    <div className="group rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:border-cyan-200 hover:shadow-md">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        {/* راست/بالا: هدر کارت */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-sm font-bold text-slate-800">
                  درخواست برداشت
                </h4>
                {statusBadge(withdrawal.status)}
              </div>

              <p className="mt-1 text-xs text-slate-400">
                ثبت شده در {formatDate(withdrawal.createdAt)}
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-2 text-left">
              <span className="block text-[11px] text-emerald-600">
                مبلغ درخواست
              </span>
              <span className="block text-sm font-black text-emerald-700 sm:text-base">
                {formatAmount(withdrawal.amount)}
              </span>
            </div>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            <InfoRow label="شماره کارت" value={cardNumber} ltr />
            <InfoRow label="نام صاحب کارت" value={cardHolderName} />
            <InfoRow
              label="شماره رهگیری"
              value={withdrawal.trackingCode || "—"}
              ltr
            />
            <InfoRow
              label="یادداشت ادمین"
              value={withdrawal.adminNote || "—"}
            />
            <InfoRow
              label="شناسه درخواست"
              value={withdrawal.id || "—"}
              ltr
            />
            <InfoRow
              label="وضعیت"
              value={statusConfig(withdrawal.status).label}
            />
          </div>
        </div>

        {/* چپ/پایین: اکشن‌ها */}
        <div className="flex w-full shrink-0 flex-col gap-2 lg:w-44">
          {isPending ? (
            <>
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => onApprove(withdrawal.id)}
                className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isProcessing ? "در حال پردازش…" : "تایید و پرداخت"}
              </button>

              <button
                type="button"
                disabled={isProcessing}
                onClick={() => onReject(withdrawal.id)}
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isProcessing ? "در حال پردازش…" : "رد درخواست"}
              </button>
            </>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-xs text-slate-400">
              برای این درخواست عملیاتی وجود ندارد
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminPartnerDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [partner, setPartner] = useState(null);
  const [users, setUsers] = useState([]);
  const [summary, setSummary] = useState({
    totalUsers: 0,
    totalPurchases: 0,
    totalCommission: 0,
  });
  const [stats, setStats] = useState({
    approvedSuppliersCount: 0,
    supplierRegistrationIncome: 0,
    purchaseRequestsCount: 0,
    purchaseRequestIncome: 0,
    commissionCount: 0,
    commissionIncome: 0,
    totalIncome: 0,
    totalWithdrawals: 0,
    currentBalance: 0,
  });
  const [withdrawals, setWithdrawals] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [withdrawalsLoading, setWithdrawalsLoading] = useState(false);
  const [withdrawalsError, setWithdrawalsError] = useState("");

  const [activeTab, setActiveTab] = useState("users");
  const [actingId, setActingId] = useState(null);

  const abortRef = useRef(null);

  const load = useCallback(async () => {
    if (!id) return;

    abortRef.current?.abort();

    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError("");
    setWithdrawalsLoading(true);
    setWithdrawalsError("");

    try {
      const [partnerResult, withdrawalsResult] = await Promise.allSettled([
        apiFetch(`/admin/partners/${id}`, {
          signal: controller.signal,
        }),
        apiFetch(`/admin/partners/${id}/withdrawals`, {
          signal: controller.signal,
        }),
      ]);

      if (partnerResult.status === "rejected") {
        throw partnerResult.reason;
      }

      const partnerData = extractPartnerDetailsResponse(partnerResult.value);

      setPartner(partnerData.partner);
      setUsers(partnerData.users);
      setSummary(partnerData.summary);
      setStats(partnerData.stats);

      if (withdrawalsResult.status === "fulfilled") {
        setWithdrawals(extractWithdrawalsResponse(withdrawalsResult.value));
      } else {
        setWithdrawals([]);
        setWithdrawalsError(
          withdrawalsResult.reason?.message || "خطا در دریافت درخواست‌های برداشت."
        );
      }
    } catch (requestError) {
      if (requestError?.name === "AbortError") return;

      console.error("Partner detail load error:", requestError);
      setError(requestError?.message || "خطا در دریافت اطلاعات همکار.");
    } finally {
      setLoading(false);
      setWithdrawalsLoading(false);

      if (abortRef.current === controller) {
        abortRef.current = null;
      }
    }
  }, [id]);

  useEffect(() => {
    load();

    return () => {
      abortRef.current?.abort();
    };
  }, [load]);

  const handleApprove = async (requestId) => {
    const trackingCode = window.prompt("شماره رهگیری پرداخت را وارد کنید:");

    if (!trackingCode?.trim()) {
      return;
    }

    setActingId(requestId);

    try {
      await apiFetch(`/admin/withdrawals/${requestId}/approve`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          trackingCode: trackingCode.trim(),
        }),
      });

      setWithdrawals((currentWithdrawals) =>
        currentWithdrawals.map((withdrawal) =>
          withdrawal.id === requestId
            ? {
                ...withdrawal,
                status: "PAID",
                trackingCode: trackingCode.trim(),
              }
            : withdrawal
        )
      );

      window.alert("درخواست برداشت با موفقیت تایید شد.");
    } catch (requestError) {
      console.error("Approve withdrawal error:", requestError);
      window.alert(requestError?.message || "خطا در تایید درخواست برداشت.");
    } finally {
      setActingId(null);
    }
  };

  const handleReject = async (requestId) => {
    const adminNote = window.prompt("علت رد درخواست را وارد کنید:");

    if (adminNote === null) {
      return;
    }

    setActingId(requestId);

    try {
      await apiFetch(`/admin/withdrawals/${requestId}/reject`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          adminNote: adminNote.trim() || "درخواست برداشت رد شد",
        }),
      });

      setWithdrawals((currentWithdrawals) =>
        currentWithdrawals.map((withdrawal) =>
          withdrawal.id === requestId
            ? {
                ...withdrawal,
                status: "REJECTED",
                adminNote: adminNote.trim() || "درخواست برداشت رد شد",
              }
            : withdrawal
        )
      );

      window.alert("درخواست برداشت رد شد و مبلغ به کیف پول بازگشت.");
    } catch (requestError) {
      console.error("Reject withdrawal error:", requestError);
      window.alert(requestError?.message || "خطا در رد درخواست برداشت.");
    } finally {
      setActingId(null);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400">
        در حال بارگذاری اطلاعات همکار…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <p className="text-red-600">{error}</p>

        <button
          type="button"
          onClick={load}
          className="rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-cyan-700"
        >
          تلاش مجدد
        </button>
      </div>
    );
  }

  const tabs = [
    {
      key: "users",
      label: `کاربران (${formatNumber(summary.totalUsers)})`,
    },
    {
      key: "withdrawals",
      label: `برداشت‌ها (${formatNumber(withdrawals.length)})`,
    },
  ];

  return (
    <div dir="rtl" className="space-y-6">
      <PageHeader
        title={partner?.name || "جزئیات همکار"}
        description={partner?.phone || "—"}
        action={
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
          >
            بازگشت
          </button>
        }
      />

      {/* آمار عملکرد */}
      <div>
        <h3 className="mb-3 text-sm font-bold text-slate-600">
          آمار عملکرد همکار
        </h3>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="موجودی کیف پول"
            value={formatAmount(stats.currentBalance)}
            icon="💰"
          />
          <StatCard
            title="مجموع درآمد"
            value={formatAmount(stats.totalIncome)}
            icon="📈"
          />
          <StatCard
            title="مجموع برداشت‌ها"
            value={formatAmount(stats.totalWithdrawals)}
            icon="💸"
          />
          <StatCard
            title="تأمین‌کنندگان تأییدشده"
            value={`${formatNumber(stats.approvedSuppliersCount)} نفر`}
            icon="🏭"
          />
          <StatCard
            title="درآمد ثبت تأمین‌کننده"
            value={formatAmount(stats.supplierRegistrationIncome)}
            icon="🏷️"
          />
          <StatCard
            title="درخواست‌های خرید"
            value={`${formatNumber(stats.purchaseRequestsCount)} درخواست`}
            icon="🛒"
          />
          <StatCard
            title="درآمد ثبت درخواست خرید"
            value={formatAmount(stats.purchaseRequestIncome)}
            icon="🧾"
          />
          <StatCard
            title="تعداد کمیسیون"
            value={`${formatNumber(stats.commissionCount)} مورد`}
            icon="🎯"
          />
          <StatCard
            title="درآمد کمیسیون خرید"
            value={formatAmount(stats.commissionIncome)}
            icon="💵"
          />
        </div>
      </div>

      {/* تب‌ها */}
      <div className="flex flex-wrap gap-2 border-b border-slate-100">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-t-xl px-4 py-2.5 text-sm font-bold transition ${
                isActive
                  ? "border-b-2 border-cyan-500 text-cyan-600"
                  : "border-b-2 border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "users" && (
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-right text-xs text-slate-500">
                  <th className="px-4 py-3 font-bold">نام</th>
                  <th className="px-4 py-3 font-bold">موبایل</th>
                  <th className="px-4 py-3 font-bold">وضعیت تامین‌کننده</th>
                  <th className="px-4 py-3 font-bold">تعداد خرید</th>
                  <th className="px-4 py-3 font-bold">پورسانت</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => {
                  const userCommission = (user.purchases || []).reduce(
                    (total, purchase) =>
                      total + (Number(purchase.commissionAmount) || 0),
                    0
                  );

                  return (
                    <tr
                      key={user.id}
                      className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50"
                    >
                      <td className="px-4 py-3 font-bold text-slate-800">
                        {user.name || "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-600" dir="ltr">
                        {user.phone || "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {supplierStatusLabel(user.supplierStatus)}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {formatNumber(user.purchasesCount ?? 0)}
                        <span className="mr-1 text-xs text-slate-400">خرید</span>
                      </td>
                      <td className="px-4 py-3 font-bold text-emerald-700">
                        {formatAmount(userCommission)}
                      </td>
                    </tr>
                  );
                })}

                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-400">
                      کاربری ثبت نشده است.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "withdrawals" && (
        <div className="space-y-4">
          {withdrawalsError && (
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <span>{withdrawalsError}</span>

              <button
                type="button"
                onClick={load}
                className="rounded-lg px-2 py-1 text-xs font-bold text-red-800 transition hover:bg-red-100"
              >
                تلاش مجدد
              </button>
            </div>
          )}

          {withdrawalsLoading ? (
            <div className="rounded-2xl border border-slate-100 bg-white py-16 text-center text-sm text-slate-400">
              در حال بارگذاری درخواست‌های برداشت…
            </div>
          ) : withdrawals.length === 0 ? (
            <div className="rounded-2xl border border-slate-100 bg-white">
              <EmptyState
                title="درخواستی ثبت نشده است"
                description="این همکار هنوز درخواست برداشتی نداشته است."
              />
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-700">
                    لیست درخواست‌های برداشت
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">
                    مدیریت، بررسی و انجام عملیات روی درخواست‌های ثبت‌شده
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500">
                  مجموع درخواست‌ها:{" "}
                  <span className="font-bold text-slate-700">
                    {formatNumber(withdrawals.length)}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {withdrawals.map((withdrawal) => (
                  <WithdrawalCard
                    key={withdrawal.id}
                    withdrawal={withdrawal}
                    actingId={actingId}
                    onApprove={handleApprove}
                    onReject={handleReject}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
