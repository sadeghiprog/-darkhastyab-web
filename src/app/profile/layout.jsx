"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import ProtectedRoute from "../../components/ProtectedRoute";

const USER_TABS = [
  { href: "/profile/dashboard", label: "پیشخوان" },
  { href: "/profile/edit-profile", label: "ویرایش اطلاعات" },
  { href: "/profile/my-requests", label: "درخواست‌های من" },
  { href: "/profile/my-offers", label: "پیشنهادهای من" },
  { href: "/profile/transactions", label: "تراکنش‌ها" },
  { href: "/profile/supplier-request", label: "درخواست تامین کننده شدن" },
  { href: "/profile/notification-settings", label: "تنظیمات نوتیفیکیشن" },
  { href: "/profile/logout", label: "خروج" },
];

const ADMIN_TABS = [
  { href: "/profile/dashboard", label: "پیشخوان" },
  { href: "/profile/admin/categories", label: "دسته‌بندی‌ها" },
  { href: "/profile/admin/provinces", label: "استان‌ها" },
  { href: "/profile/admin/city", label: "شهر ها" },
  { href: "/profile/admin/unit", label: "واحد ها" },
  { href: "/profile/admin/requests", label: "همه درخواست‌ها" },
  { href: "/profile/admin/offers", label: "همه پیشنهادها" },
  { href: "/profile/admin/supplier-requests", label: "درخواست های تامین کننده شدن" },
  { href: "/profile/admin/users", label: "همه کاربران" },
  { href: "/profile/admin/tariffs", label: " تعرفه ها" },
  { href: "/profile/admin/transactions", label: "تراکنش ها" },
  { href: "/profile/notification-settings", label: "تنظیمات نوتیفیکیشن" },
  { href: "/profile/logout", label: "خروج" },
];

export default function ProfileLayout({ children }) {
  const { user } = useAuth();
  const pathname = usePathname();

  const isAdmin = user?.status === "ADMIN";
  const tabs = isAdmin ? ADMIN_TABS : USER_TABS;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50 p-4 md:p-6" dir="rtl">
        <div className="mx-auto max-w-7xl grid grid-cols-12 gap-4 md:gap-6">

          {/* سایدبار دسکتاپ / منوی اسکرولی موبایل */}
          <aside className="col-span-12 md:col-span-3 bg-white rounded-3xl p-4 md:p-5 shadow-sm">

            {/* اطلاعات کاربر (در موبایل پنهان یا کوچک‌تر می‌شود) */}
            <div className="hidden md:block mb-6 border-b pb-4">
              <h2 className="text-lg font-black text-slate-800">
                {user?.name || "کاربر"}
              </h2>
              <span className="text-xs text-slate-400 mt-1 block">
                {isAdmin ? "مدیر سیستم" : "کاربر پلتفرم"}
              </span>
            </div>

            {/* منو: در موبایل اسکرول افقی بدون نمایش نوار اسکرول زشت، در دسکتاپ لیست عمودی */}
            <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-x-visible no-scrollbar pb-3 md:pb-0 scroll-smooth snap-x">
              {tabs.map((tab) => {
                const active = pathname === tab.href;

                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className={`shrink-0 snap-align-start rounded-xl px-4 py-2.5 md:py-3 text-xs md:text-sm font-bold transition whitespace-nowrap ${
                      active
                        ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/10"
                        : "bg-slate-50 md:bg-transparent text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {tab.label}
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* محتوا */}
          <main className="col-span-12 md:col-span-9 bg-white rounded-3xl p-5 md:p-8 shadow-sm">
            {children}
          </main>

        </div>
      </div>

      {/* استایل کمکی برای حذف اسکرول‌بار مرورگر در موبایل */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </ProtectedRoute>
  );
}
