"use client";

import React, { useEffect, useState } from "react";
import { Users, FileText } from "lucide-react";

// تابع تبدیل اعداد انگلیسی به فارسی (سازگار با استانداردهای پروژه)
function toPersianDigits(num) {
  const id = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return num
    .toString()
    .replace(/[0-9]/g, (w) => id[+w])
    .replace(/\B(?=(\d{3})+(?!\d))/g, "،"); // اضافه کردن کامای جداکننده سه رقمی فارسی
}

export default function StatsCards() {
  const [data, setData] = useState({
    activeSuppliers: 0,
    activeRequests: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        // فراخوانی آدرس بک‌اند از متغیرهای محیطی
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/public/stats`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const result = await response.json();
        if (result.success && result.data) {
          setData({
            activeSuppliers: result.data.activeSuppliers || 0,
            activeRequests: result.data.activeRequests || 0,
          });
        }
      } catch (error) {
        console.error("Error fetching homepage stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const statsConfig = [
    {
      icon: Users,
      label: "تامین‌کننده فعال",
      value: data.activeSuppliers,
      description: "فعال در پلتفرم",
      bg: "from-orange-150 to-orange-200", // حفظ استایل گرادینت نارنجی اصلی شما
      iconBg: "bg-orange-500/10",
      iconColor: "text-orange-600",
    },
    {
      icon: FileText,
      label: "درخواست",
      value: data.activeRequests,
      description: "در حال انجام",
      bg: "from-emerald-50 to-green-100",
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-600",
    },
  ];

  return (
    <div className="h-full grid grid-cols-2 gap-3">
      {statsConfig.map((stat, index) => {
        const Icon = stat.icon;

        return (
          <div
            key={index}
            className={`
              h-full min-h-[96px]
              rounded-2xl border border-white/70
              bg-gradient-to-br ${stat.bg}
              shadow-sm
              px-4 py-3
              flex items-center gap-3
            `}
          >
            <div
              className={`
                w-11 h-11 rounded-xl
                flex items-center justify-center
                ${stat.iconBg}
                flex-shrink-0
              `}
            >
              <Icon size={23} strokeWidth={1.8} className={stat.iconColor} />
            </div>

            <div className="min-w-0 flex-1">
              {loading ? (
                // نمایش افکت بارگذاری در زمان دریافت اطلاعات از بک‌اند
                <div className="h-7 w-20 bg-slate-400/20 animate-pulse rounded-lg mt-0.5" />
              ) : (
                <div className="text-2xl font-black text-slate-800 leading-tight">
                  {toPersianDigits(stat.value)}
                </div>
              )}

              <div className="text-xs font-bold text-slate-700 mt-1 truncate">
                {stat.label}
              </div>

              <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                {stat.description}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
