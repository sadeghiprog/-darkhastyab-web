"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "../../../../lib/api2";
import StatCard from "../../../../components/ui/StatCard";
import PageHeader from "../../../../components/ui/PageHeader";

export default function PartnerDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    balance: 0,
    totalCommission: 0,
    totalWithdrawal: 0,
    pendingWithdrawal: 0,
    usersCount: 0,
  });

  useEffect(() => {
    async function load() {
      try {
        // گرفتن آمار از endpointهای واقعی به‌صورت موازی
        const [walletRes, usersRes, withdrawalsRes] = await Promise.all([
          apiFetch("/partner/wallet"),
          apiFetch("/partner/users"),
          apiFetch("/partner/withdrawals"),
        ]);

        const wallet = walletRes.data || walletRes;
        const users = usersRes.data || usersRes;
        const withdrawals = withdrawalsRes.data || withdrawalsRes;

        // ساختار wallet ممکنه مستقیم باشه یا داخل data
        const w = wallet.wallet || wallet;

        // تعداد کاربران: ممکنه آرایه باشه یا { items, total }
        const usersList = Array.isArray(users)
          ? users
          : users.items || users.users || [];
        const usersCount =
          users.total ?? usersList.length ?? 0;

        // برداشت‌های در انتظار
        const withdrawalsList = Array.isArray(withdrawals)
          ? withdrawals
          : withdrawals.items || withdrawals.withdrawals || [];
        const pendingWithdrawal = withdrawalsList.filter(
          (x) => x.status === "PENDING"
        ).length;

        setStats({
          balance: w.balance ?? w.availableBalance ?? 0,
          totalCommission: w.totalCommission ?? 0,
          totalWithdrawal: w.totalWithdrawal ?? w.totalWithdrawn ?? 0,
          pendingWithdrawal,
          usersCount,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return <div className="p-6 text-gray-500">در حال بارگذاری...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">خطا: {error}</div>;
  }

  const formatMoney = (n) =>
    new Intl.NumberFormat("fa-IR").format(Number(n) || 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="داشبورد همکار"
        description="نمای کلی از عملکرد و درآمد شما"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="موجودی قابل برداشت"
          value={`${formatMoney(stats.balance)} تومان`}
        />
        <StatCard
          label="مجموع پورسانت"
          value={`${formatMoney(stats.totalCommission)} تومان`}
        />
        <StatCard
          label="مجموع برداشت"
          value={`${formatMoney(stats.totalWithdrawal)} تومان`}
        />
        <StatCard
          label="کاربران زیرمجموعه"
          value={formatMoney(stats.usersCount)}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/profile/partner/users"
          className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-700"
        >
          مدیریت کاربران
        </Link>
        <Link
          href="/profile/partner/wallet"
          className="rounded-lg border border-cyan-600 px-4 py-2 text-sm font-medium text-cyan-600 hover:bg-cyan-50"
        >
          کیف پول
        </Link>
        <Link
          href="/profile/partner/withdrawals/new"
          className="rounded-lg border border-cyan-600 px-4 py-2 text-sm font-medium text-cyan-600 hover:bg-cyan-50"
        >
          ثبت درخواست برداشت
        </Link>
      </div>
    </div>
  );
}
