"use client";

import { useEffect, useState } from "react";
import { Users, FileText, Send, Phone, Wallet } from "lucide-react";
import Image from "next/image";

const API = process.env.NEXT_PUBLIC_API_URL;

const ROLE_LABELS = {
  ADMIN: "مدیر سیستم",
  USER: "کاربر",
  SUPPLIER: "تأمین‌کننده",
};
const getRoleLabel = (role) => {
  return ROLE_LABELS[role] || "نامشخص";
};

export default function DashboardPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`${API}/dashboard/me`, { credentials: "include" })
      .then(res => res.json())
      .then(setData);
  }, []);

  if (!data) {
    return (
      <div className="p-10 text-center text-sm text-slate-500">
        در حال بارگذاری پیشخوان...
      </div>
    );
  }

  const { baseInfo, stats, type } = data;
  const baseAvatar = process.env.NEXT_PUBLIC_AVATAR_URL;
  const avatarSrc = data.baseInfo.avatar
    ? `${baseAvatar}${data.baseInfo.avatar}`
    : `${baseAvatar}/uploads/avatars/avatar.webp`;

  return (
    <div className="mx-auto max-w-6xl p-6 space-y-8" dir="rtl">
      
      {/* ✅ اطلاعات پایه */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-6">
        <div className="relative h-20 w-20 rounded-2xl overflow-hidden bg-slate-100">
          {baseInfo.avatar ? (
            <img
              src={avatarSrc}
              alt="avatar"
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-400 text-xs">
              بدون تصویر
            </div>
          )}
        </div>

        <div className="flex-1 space-y-2 text-sm">
          <div className="font-black text-lg text-slate-800">
            {baseInfo.name || "بدون نام"}
          </div>
          <div className="text-slate-500">📞 {baseInfo.phone}</div>
          <div className="text-slate-500">
             نوع کاربری: {getRoleLabel(baseInfo.role)}
          </div>
          <div className="flex items-center gap-2 font-bold text-cyan-700">
            <Wallet size={16} />
            موجودی: {baseInfo.balance.toLocaleString()} اعتبار
          </div>
        </div>
      </div>

      {/* ✅ آمار */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        {/* اگر کاربر عادی است */}
        {type === "USER" && (
          <>
            <StatCard icon={<FileText />} title="تعداد درخواست‌ها" value={stats.requestsCount} />
            <StatCard icon={<Send />} title="تعداد پیشنهادها" value={stats.offersCount} />
            <StatCard icon={<Phone />} title="تماس‌های گرفته‌شده" value={stats.takenContactsCount} />
            <StatCard icon={<Phone />} title="تماس‌های دریافتی" value={stats.receivedContactsCount} />
          </>
        )}

        {/* اگر ادمین است */}
        {type === "ADMIN" && (
          <>
            <StatCard icon={<Wallet />} title="مجموع واریزی‌ها" value={`${stats.totalTopUpsAmount.toLocaleString()} تومان`} />
            <StatCard icon={<Users />} title="کل کاربران" value={stats.totalUsers} />
            <StatCard icon={<FileText />} title="کل درخواست‌ها" value={stats.totalRequests} />
            <StatCard icon={<FileText />} title="درخواست‌های تایید نشده" value={stats.unapprovedRequestsCount} />
            <StatCard icon={<Send />} title="کل پیشنهادها" value={stats.totalOffers} />
            <StatCard icon={<Send />} title="کل اعتبار مصرف شده" value={stats.totalConsumedCreditsAmount} />
          </>
        )}

      </div>
    </div>
  );
}

function StatCard({ icon, title, value }) {
  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between text-slate-600 text-xs font-bold">
        <span>{title}</span>
        <div className="text-cyan-600">{icon}</div>
      </div>
      <div className="mt-4 text-2xl font-black text-slate-800">
        {value}
      </div>
    </div>
  );
}
