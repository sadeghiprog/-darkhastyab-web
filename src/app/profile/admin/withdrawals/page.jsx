"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "../../../../lib/api2";
import PageHeader from "../../../../components/ui/PageHeader";
import EmptyState from "../../../../components/ui/EmptyState";
import Pagination from "../../../../components/ui/Pagination";

const STATUS_LABEL = {
  PENDING: {
    text: "در انتظار",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-100",
    dot: "bg-amber-500",
  },
  PAID: {
    text: "پرداخت شده",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    dot: "bg-emerald-500",
  },
  REJECTED: {
    text: "رد شده",
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-100",
    dot: "bg-red-500",
  },
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function getCardNumber(withdrawal) {
  return (
    withdrawal.cardNumber ||
    withdrawal.bankCardNumber ||
    withdrawal.card?.cardNumber ||
    withdrawal.bankCard?.cardNumber ||
    withdrawal.destinationCard?.cardNumber ||
    "—"
  );
}

function getCardHolderName(withdrawal) {
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

function getPartnerName(withdrawal) {
  return (
    withdrawal.partner?.name ||
    withdrawal.user?.name ||
    withdrawal.partner?.fullName ||
    withdrawal.user?.fullName ||
    `#${withdrawal.userId || withdrawal.partnerId || "—"}`
  );
}

function formatAmount(value) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "۰ تومان";
  }

  return `${amount.toLocaleString("fa-IR")} تومان`;
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getStatusMeta(status) {
  return STATUS_LABEL[status] || {
    text: status || "نامشخص",
    color: "text-slate-600",
    bg: "bg-slate-50",
    border: "border-slate-200",
    dot: "bg-slate-400",
  };
}

/* -------------------------------------------------------------------------- */
/* UI Components                                                              */
/* -------------------------------------------------------------------------- */

function StatusBadge({ status }) {
  const meta = getStatusMeta(status);

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${meta.bg} ${meta.color} ${meta.border}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.text}
    </span>
  );
}

function InfoItem({ label, value, dir = "rtl", mono = false }) {
  return (
    <div className="min-w-0 rounded-xl bg-slate-50 px-3 py-2.5">
      <div className="mb-1 text-[11px] text-slate-400">{label}</div>

      <div
        dir={dir}
        className={`break-all text-sm font-bold text-slate-700 ${
          mono ? "font-mono" : ""
        }`}
      >
        {value || "—"}
      </div>
    </div>
  );
}

function WithdrawalCard({
  withdrawal,
  onApprove,
  onReject,
}) {
  const isPending = withdrawal.status === "PENDING";

  return (
    <article className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm transition duration-200 hover:border-cyan-200 hover:shadow-md sm:p-5">
      {/* Header کارت */}
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-xl">
            💳
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-base font-black text-slate-800">
              {getPartnerName(withdrawal)}
            </h3>

            <p className="mt-1 text-xs text-slate-400">
              درخواست برداشت در تاریخ {formatDate(withdrawal.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
          <StatusBadge status={withdrawal.status} />

          <div className="text-left">
            <div className="text-[11px] text-slate-400">مبلغ درخواست</div>
            <div className="mt-0.5 whitespace-nowrap text-base font-black text-emerald-700">
              {formatAmount(withdrawal.amount)}
            </div>
          </div>
        </div>
      </div>

      {/* اطلاعات کارت */}
      <div className="grid gap-2 pt-4 sm:grid-cols-2 xl:grid-cols-4">
        <InfoItem
          label="شماره کارت"
          value={getCardNumber(withdrawal)}
          dir="ltr"
          mono
        />

        <InfoItem
          label="نام صاحب کارت"
          value={getCardHolderName(withdrawal)}
        />

        <InfoItem
          label="شماره رهگیری"
          value={withdrawal.trackingCode || "—"}
          dir="ltr"
          mono
        />

        <InfoItem
          label="تاریخ ثبت درخواست"
          value={formatDate(withdrawal.createdAt)}
        />
      </div>

      {/* یادداشت ادمین */}
      {withdrawal.adminNote && (
        <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
          <div className="mb-1 text-[11px] text-slate-400">
            یادداشت ادمین
          </div>
          <p className="break-words text-sm leading-6 text-slate-700">
            {withdrawal.adminNote}
          </p>
        </div>
      )}

      {/* عملیات */}
      <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
        {isPending ? (
          <>
            <button
              type="button"
              onClick={() => onApprove(withdrawal)}
              className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 active:scale-[0.98]"
            >
              تأیید و پرداخت
            </button>

            <button
              type="button"
              onClick={() => onReject(withdrawal)}
              className="rounded-xl border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-bold text-red-700 transition hover:bg-red-100 active:scale-[0.98]"
            >
              رد درخواست
            </button>
          </>
        ) : (
          <div className="rounded-xl bg-slate-50 px-4 py-2.5 text-center text-xs font-medium text-slate-400">
            این درخواست قبلاً بررسی شده است
          </div>
        )}
      </div>
    </article>
  );
}

function WithdrawalModal({
  activeModal,
  trackingCode,
  adminNote,
  processing,
  error,
  onTrackingCodeChange,
  onAdminNoteChange,
  onSubmit,
  onClose,
}) {
  if (!activeModal) return null;

  const { action, item } = activeModal;
  const isApprove = action === "approve";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/45 p-4 backdrop-blur-[2px]"
      onClick={() => !processing && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="my-8 w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          className={`border-b px-5 py-4 sm:px-6 ${
            isApprove
              ? "border-emerald-100 bg-emerald-50/70"
              : "border-red-100 bg-red-50/70"
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-800">
                {isApprove
                  ? "تأیید و پرداخت درخواست"
                  : "رد درخواست برداشت"}
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                اطلاعات درخواست را بررسی و عملیات موردنظر را ثبت کنید.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={processing}
              className="rounded-lg px-2 py-1 text-xl leading-none text-slate-400 transition hover:bg-white hover:text-slate-700 disabled:opacity-50"
              aria-label="بستن"
            >
              ×
            </button>
          </div>
        </div>

        {/* اطلاعات درخواست */}
        <div className="space-y-2 p-5 sm:p-6">
          <div className="grid gap-2 sm:grid-cols-2">
            <InfoItem label="همکار" value={getPartnerName(item)} />

            <InfoItem
              label="مبلغ"
              value={formatAmount(item.amount)}
            />

            <InfoItem
              label="شماره کارت"
              value={getCardNumber(item)}
              dir="ltr"
              mono
            />

            <InfoItem
              label="صاحب کارت"
              value={getCardHolderName(item)}
            />
          </div>

          <form onSubmit={onSubmit} className="mt-5 space-y-4">
            {isApprove && (
              <div>
                <label
                  htmlFor="trackingCode"
                  className="mb-1.5 block text-xs font-bold text-slate-600"
                >
                  شماره رهگیری پرداخت
                  <span className="mr-1 font-normal text-slate-400">
                    (اختیاری)
                  </span>
                </label>

                <input
                  id="trackingCode"
                  type="text"
                  dir="ltr"
                  value={trackingCode}
                  onChange={(event) =>
                    onTrackingCodeChange(event.target.value)
                  }
                  placeholder="مثال: 1234567890"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-left text-sm outline-none transition placeholder:text-slate-300 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="adminNote"
                className="mb-1.5 block text-xs font-bold text-slate-600"
              >
                {isApprove ? "توضیحات داخلی" : "دلیل رد درخواست"}
                <span className="mr-1 font-normal text-slate-400">
                  (اختیاری)
                </span>
              </label>

              <textarea
                id="adminNote"
                value={adminNote}
                onChange={(event) => onAdminNoteChange(event.target.value)}
                rows={4}
                placeholder={
                  isApprove
                    ? "یادداشت داخلی ادمین…"
                    : "دلیل رد درخواست را وارد کنید…"
                }
                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-300 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-sm leading-6 text-red-700">
                {error}
              </div>
            )}

            <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row">
              <button
                type="button"
                onClick={onClose}
                disabled={processing}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-1"
              >
                انصراف
              </button>

              <button
                type="submit"
                disabled={processing}
                className={`rounded-xl px-5 py-3 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-50 sm:flex-[1.5] ${
                  isApprove
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {processing
                  ? "در حال پردازش…"
                  : isApprove
                  ? "تأیید و پرداخت"
                  : "تأیید رد درخواست"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main Page                                                                  */
/* -------------------------------------------------------------------------- */

export default function AdminWithdrawalsPage() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState("PENDING");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeModal, setActiveModal] = useState(null);
  const [trackingCode, setTrackingCode] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [processing, setProcessing] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
      });

      if (status) {
        params.set("status", status);
      }

      const response = await apiFetch(`/admin/withdrawals?${params}`);
      const data = response?.data ?? response;

      setItems(
        data?.requests ||
          data?.items ||
          data?.withdrawals ||
          []
      );

      setTotalPages(
        data?.pagination?.totalPages ||
          data?.totalPages ||
          1
      );
    } catch (requestError) {
      console.error("LOAD ERROR:", requestError);
      setError(requestError?.message || String(requestError));
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => {
    load();
  }, [load]);

  const openModal = (action, item) => {
    setActiveModal({ action, item });
    setTrackingCode("");
    setAdminNote("");
    setError("");
  };

  const closeModal = () => {
    if (processing) return;

    setActiveModal(null);
    setTrackingCode("");
    setAdminNote("");
  };

  const submit = async (event) => {
    event.preventDefault();

    if (!activeModal) return;

    const { action, item } = activeModal;
    const path = action === "approve" ? "approve" : "reject";

    try {
      setProcessing(true);
      setError("");

      await apiFetch(`/admin/withdrawals/${item.id}/${path}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...(action === "approve" && trackingCode.trim()
            ? { trackingCode: trackingCode.trim() }
            : {}),
          ...(adminNote.trim()
            ? { adminNote: adminNote.trim() }
            : {}),
        }),
      });

      setActiveModal(null);
      setTrackingCode("");
      setAdminNote("");

      await load();
    } catch (requestError) {
      console.error("WITHDRAWAL ACTION ERROR:", requestError);
      setError(requestError?.message || String(requestError));
    } finally {
      setProcessing(false);
    }
  };

  const pendingCount = items.filter(
    (item) => item.status === "PENDING"
  ).length;

  return (
    <div dir="rtl" className="space-y-6">
      <PageHeader
        title="درخواست‌های برداشت"
        description="مدیریت و پرداخت درخواست‌های برداشت همکاران"
      />

      {/* فیلترها و خلاصه */}
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-black text-slate-800">
            لیست درخواست‌ها
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            {pendingCount > 0
              ? `${pendingCount.toLocaleString("fa-IR")} درخواست در این صفحه نیاز به بررسی دارد`
              : "درخواستی برای بررسی در این صفحه وجود ندارد"}
          </p>
        </div>

        <select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50 sm:w-52"
        >
          <option value="">همه وضعیت‌ها</option>
          <option value="PENDING">در انتظار</option>
          <option value="PAID">پرداخت شده</option>
          <option value="REJECTED">رد شده</option>
        </select>
      </div>

      {error && !activeModal && (
        <div className="flex flex-col gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between">
          <span>{error}</span>

          <button
            type="button"
            onClick={load}
            className="w-fit rounded-lg px-3 py-1.5 text-xs font-bold text-red-800 transition hover:bg-red-100"
          >
            تلاش مجدد
          </button>
        </div>
      )}

      {loading ? (
        <div className="rounded-3xl border border-slate-100 bg-white py-20 text-center text-sm text-slate-400">
          در حال بارگذاری درخواست‌ها…
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-3xl border border-slate-100 bg-white">
          <EmptyState title="درخواستی یافت نشد" />
        </div>
      ) : (
        <>
          {/* لیست کارتی */}
          <div className="space-y-4">
            {items.map((withdrawal) => (
              <WithdrawalCard
                key={withdrawal.id}
                withdrawal={withdrawal}
                onApprove={(item) => openModal("approve", item)}
                onReject={(item) => openModal("reject", item)}
              />
            ))}
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            onChange={setPage}
          />
        </>
      )}

      <WithdrawalModal
        activeModal={activeModal}
        trackingCode={trackingCode}
        adminNote={adminNote}
        processing={processing}
        error={error}
        onTrackingCodeChange={setTrackingCode}
        onAdminNoteChange={setAdminNote}
        onSubmit={submit}
        onClose={closeModal}
      />
    </div>
  );
}
