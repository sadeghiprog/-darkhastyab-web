"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "../../../../../lib/api2";
import PageHeader from "../../../../../components/ui/PageHeader";

const STATUS_LABEL = {
  PENDING: { text: "در انتظار", color: "text-amber-600", bg: "bg-amber-50" },
  PAID: { text: "پرداخت شده", color: "text-emerald-600", bg: "bg-emerald-50" },
  REJECTED: { text: "رد شده", color: "text-red-500", bg: "bg-red-50" },
};

export default function WithdrawalDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await apiFetch(`/partner/withdrawals/${id}`);
      setItem(res.data || res);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <div className="py-20 text-center text-slate-400">در حال بارگذاری…</div>;
  if (error) return <div className="py-20 text-center text-red-500">{error}</div>;

  const meta = STATUS_LABEL[item.status] || STATUS_LABEL.PENDING;
  const bank = item.bankInfo || {};

  return (
    <div>
      <PageHeader
        title="جزئیات درخواست برداشت"
        description={`شماره درخواست: ${item.id}`}
        action={
          <button onClick={() => router.back()} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50">
            بازگشت
          </button>
        }
      />

      <div className="rounded-3xl bg-gradient-to-l from-slate-800 to-slate-900 p-6 text-white">
        <p className="text-sm opacity-80">مبلغ درخواستی</p>
        <p className="mt-2 text-3xl font-black">
          {Number(item.amount).toLocaleString("fa-IR")}
          <span className="mr-2 text-base opacity-80">تومان</span>
        </p>
        <span className={`mt-4 inline-block rounded-full px-3 py-1 text-xs font-bold ${meta.bg} ${meta.color}`}>
          {meta.text}
        </span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 p-4">
          <p className="text-xs text-slate-400">شماره رهگیری</p>
          <p className="mt-1 font-bold text-slate-700" dir="ltr">{item.trackingCode || "—"}</p>
        </div>
        <div className="rounded-2xl border border-slate-100 p-4">
          <p className="text-xs text-slate-400">تاریخ درخواست</p>
          <p className="mt-1 font-bold text-slate-700">
            {item.createdAt ? new Date(item.createdAt).toLocaleDateString("fa-IR") : "—"}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 p-4">
          <p className="text-xs text-slate-400">نام صاحب حساب</p>
          <p className="mt-1 font-bold text-slate-700">{item.cardHolderName || "—"}</p>
        </div>
        <div className="rounded-2xl border border-slate-100 p-4">
          <p className="text-xs text-slate-400">شماره کارت</p>
          <p className="mt-1 font-bold text-slate-700" dir="ltr">{item.cardNumber || "—"}</p>
        </div>
        {item.adminNote && (
          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 sm:col-span-2">
            <p className="text-xs text-slate-400">توضیحات ادمین</p>
            <p className="mt-1 text-sm font-medium text-slate-700">{item.adminNote}</p>
          </div>
        )}
      </div>
    </div>
  );
}
