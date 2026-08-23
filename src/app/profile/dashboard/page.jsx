"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Users,
  FileText,
  Send,
  Phone,
  Wallet,
  AlertCircle,
  Loader2,
} from "lucide-react";
import Image from "next/image";

const API = process.env.NEXT_PUBLIC_API_URL;
const AVATAR_BASE = process.env.NEXT_PUBLIC_AVATAR_URL;

const ROLE_LABELS = {
  ADMIN: "مدیر سیستم",
  USER: "کاربر",
  SUPPLIER: "تأمین‌کننده",
};

function getRoleLabel(role) {
  return ROLE_LABELS[role] || "نامشخص";
}

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`${API}/dashboard/me`, {
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("خطا در دریافت اطلاعات داشبورد");
        }

        const json = await res.json();

        if (mounted) {
          setData(json);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || "خطای نامشخص");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  const avatarSrc = useMemo(() => {
    const avatar = data?.baseInfo?.avatar;
    if (avatar) {
      return `${AVATAR_BASE}${avatar}`;
    }
    return `${AVATAR_BASE}/uploads/avatars/avatar.webp`;
  }, [data]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-10 text-slate-500">
        <div className="flex items-center gap-3 text-sm font-medium">
          <Loader2 className="h-5 w-5 animate-spin text-cyan-600" />
          در حال بارگذاری پیشخوان...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-10">
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { baseInfo, stats, type } = data;

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6" dir="rtl">
      {/* اطلاعات پایه */}
      <div className="flex items-center gap-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="relative h-20 w-20 overflow-hidden rounded-2xl bg-slate-100 flex-shrink-0">
          <Image
            src={avatarSrc}
            alt="avatar"
            fill
            className="object-cover"
            sizes="80px"
            unoptimized
          />
        </div>

        <div className="flex-1 space-y-2 text-sm">
          <div className="text-lg font-black text-slate-800">
            {baseInfo?.name || "بدون نام"}
          </div>

          <div className="text-slate-500">📞 {baseInfo?.phone || "-"}</div>

          <div className="text-slate-500">
            نوع کاربری: {getRoleLabel(baseInfo?.role)}
          </div>

          <div className="flex items-center gap-2 font-bold text-cyan-700">
            <Wallet size={16} />
            موجودی: {(baseInfo?.balance || 0).toLocaleString()} اعتبار
          </div>
        </div>
      </div>

      {/* آمار شخصی */}
      <SectionTitle
        title="آمار شخصی"
        subtitle="مربوط به فعالیت‌های همین حساب کاربری"
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<FileText />}
          title="تعداد درخواست‌ها"
          value={stats?.requestsCount || 0}
        />

        <StatCard
          icon={<Send />}
          title="تعداد پیشنهادها"
          value={stats?.offersCount || 0}
        />

        <StatCard
          icon={<Phone />}
          title="تماس‌های گرفته‌شده از پیشنهادها"
          value={stats?.takenOfferContactsCount || 0}
        />

        <StatCard
          icon={<Phone />}
          title="تماس‌های گرفته‌شده از درخواست‌ها"
          value={stats?.takenRequestContactsCount || 0}
        />

        <StatCard
          icon={<Phone />}
          title="مجموع تماس‌های گرفته‌شده"
          value={stats?.takenContactsCount || 0}
        />

        <StatCard
          icon={<Phone />}
          title="تماس‌های دریافتی از پیشنهادها"
          value={stats?.receivedOfferContactsCount || 0}
        />

        <StatCard
          icon={<Phone />}
          title="تماس‌های دریافتی از درخواست‌ها"
          value={stats?.receivedRequestContactsCount || 0}
        />

        <StatCard
          icon={<Phone />}
          title="مجموع تماس‌های دریافتی"
          value={stats?.receivedContactsCount || 0}
        />
      </div>

      {/* آمار مدیریتی */}
      {type === "ADMIN" && (
        <>
          <SectionTitle
            title="آمار مدیریتی"
            subtitle="ویژه مدیریت سیستم"
          />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={<Users />}
              title="کل کاربران"
              value={stats?.totalUsers || 0}
            />

            <StatCard
              icon={<FileText />}
              title="کل درخواست‌ها"
              value={stats?.totalRequests || 0}
            />

            <StatCard
              icon={<FileText />}
              title="درخواست‌های تایید نشده"
              value={stats?.unapprovedRequestsCount || 0}
            />

            <StatCard
              icon={<Send />}
              title="کل پیشنهادها"
              value={stats?.totalOffers || 0}
            />

            <StatCard
              icon={<Wallet />}
              title="مجموع واریزی‌ها"
              value={`${(stats?.totalTopUpsAmount || 0).toLocaleString()} تومان`}
            />

            <StatCard
              icon={<Wallet />}
              title="کل اعتبار مصرف‌شده"
              value={`${(stats?.totalConsumedCreditsAmount || 0).toLocaleString()} اعتبار`}
            />
          </div>
        </>
      )}
    </div>
  );
}

function SectionTitle({ title, subtitle }) {
  return (
    <div className="space-y-1">
      <h2 className="text-lg font-black text-slate-800">{title}</h2>
      {subtitle ? <p className="text-sm text-slate-500">{subtitle}</p> : null}
    </div>
  );
}

function StatCard({ icon, title, value }) {
  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between text-xs font-bold text-slate-600">
        <span>{title}</span>
        <div className="text-cyan-600">{icon}</div>
      </div>

      <div className="mt-4 text-2xl font-black text-slate-800">{value}</div>
    </div>
  );
}
