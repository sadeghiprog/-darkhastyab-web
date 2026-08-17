"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../../../../lib/api2";
import PageHeader from "../../../../components/ui/PageHeader";
import StatCard from "../../../../components/ui/StatCard";

export default function PartnerWalletPage() {
  const router = useRouter();
  const [wallet, setWallet] = useState(null);
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const [walletRes, statsRes, txRes] = await Promise.all([
        apiFetch("/partner/wallet"),
        apiFetch("/partner/stats"),
        apiFetch("/partner/wallet/transactions?page=1&limit=5"),
      ]);

      setWallet(walletRes.data || walletRes);
      setStats(statsRes.data || statsRes);
      setRecent(txRes.data?.items || txRes.data?.transactions || txRes.data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading)
    return <div className="py-20 text-center text-slate-400">در حال بارگذاری…</div>;
  if (error) return <div className="py-20 text-center text-red-500">{error}</div>;

  const balance = wallet?.balance ?? stats?.currentBalance ?? 0;

  const fa = (value) => (Number(value) || 0).toLocaleString("fa-IR");

  return (
    <div>
      <PageHeader
        title="کیف پول پورسانت"
        description="موجودی پورسانت حاصل از خرید کاربران زیرمجموعه شما"
        action={
          <button
            onClick={() => router.push("/profile/partner/withdrawals/new")}
            className="rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-cyan-600"
          >
            ثبت درخواست برداشت
          </button>
        }
      />

      {/* کارت موجودی اصلی */}
      <div className="rounded-3xl bg-gradient-to-l from-cyan-500 to-emerald-400 p-6 text-white shadow-lg shadow-cyan-500/20">
        <p className="text-sm opacity-90">موجودی قابل برداشت</p>
        <p className="mt-2 text-3xl font-black md:text-4xl">
          {fa(balance)}
          <span className="mr-2 text-base font-medium opacity-90">تومان</span>
        </p>
      </div>

      {/* خلاصه مالی */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          title="مجموع درآمد"
          value={`${fa(stats?.totalIncome)} تومان`}
          icon="📈"
        />
        <StatCard
          title="مجموع برداشت"
          value={`${fa(stats?.totalWithdrawals)} تومان`}
          icon="🏦"
        />
        
      </div>

      {/* آمار تأمین‌کننده‌ها */}
      <div className="mt-6">
        <h3 className="mb-3 font-bold text-slate-800">آمار تأمین‌کننده‌ها</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <StatCard
            title="تأمین‌کننده تأییدشده"
            value={fa(stats?.approvedSuppliersCount)}
            icon="🏭"
          />
          <StatCard
            title="درآمد ثبت تأمین‌کننده"
            value={`${fa(stats?.supplierRegistrationIncome)} تومان`}
            icon="🤝"
          />
        </div>
      </div>

      {/* آمار درخواست‌های خرید */}
      <div className="mt-6">
        <h3 className="mb-3 font-bold text-slate-800">آمار درخواست‌های خرید</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <StatCard
            title="درخواست ثبت‌شده"
            value={fa(stats?.purchaseRequestsCount)}
            icon="📋"
          />
          <StatCard
            title="درآمد ثبت درخواست"
            value={`${fa(stats?.purchaseRequestIncome)} تومان`}
            icon="💰"
          />
        </div>
      </div>

      {/* آمار کمیسیون خرید */}
      <div className="mt-6">
        <h3 className="mb-3 font-bold text-slate-800">آمار کمیسیون خرید</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <StatCard
            title="تعداد کمیسیون"
            value={fa(stats?.commissionCount)}
            icon="🛒"
          />
          <StatCard
            title="درآمد کمیسیون"
            value={`${fa(stats?.commissionIncome)} تومان`}
            icon="🧾"
          />
        </div>
      </div>

      {/* آخرین تراکنش‌ها */}
      <div className="mt-6">
        <h3 className="mb-3 font-bold text-slate-800">آخرین تراکنش‌ها</h3>
        {recent.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-400">
            تراکنشی ثبت نشده است.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-100">
            {recent.map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between px-4 py-3"
              >
                <div>
                  <p className="text-sm font-bold text-slate-700">
                    {t.description || "پورسانت"}
                  </p>
                  <p className="text-xs text-slate-400">
                    {t.createdAt
                      ? new Date(t.createdAt).toLocaleDateString("fa-IR")
                      : ""}
                  </p>
                </div>
                <span
                  className={`text-sm font-black ${
                    t.amount >= 0 ? "text-emerald-600" : "text-red-500"
                  }`}
                >
                  {t.amount >= 0 ? "+" : "−"}
                  {Math.abs(t.amount).toLocaleString("fa-IR")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
