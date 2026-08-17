"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import ProtectedRoute from "../../components/ProtectedRoute";

// تب پیشخوان (همیشه اول)
const DASHBOARD_TAB = { href: "/profile/dashboard", label: "پیشخوان" };

// تب‌های انتهایی (همیشه آخر)
const END_TABS = [
  { href: "/profile/notification-settings", label: "تنظیمات نوتیفیکیشن" },
  { href: "/profile/logout", label: "خروج" },
];

const USER_TABS = [
  { href: "/profile/edit-profile", label: "ویرایش اطلاعات" },
  { href: "/profile/my-requests", label: "درخواست‌های من" },
  { href: "/profile/my-offers", label: "پیشنهادهای من" },
  { href: "/profile/transactions", label: "تراکنش‌ها" },
  { href: "/profile/supplier-request", label: "درخواست تامین‌کننده شدن" },
];

const PARTNER_TABS = [
  // { href: "/profile/partner/dashboard", label: "پیشخوان همکار" },
  { href: "/profile/partner/users", label: "کاربران زیرمجموعه" },
  { href: "/profile/partner/wallet", label: "کیف پول پورسانت" },
  { href: "/profile/partner/wallet/transactions", label: "تراکنش‌های پورسانت" },
  { href: "/profile/partner/withdrawals", label: "درخواست‌های برداشت" },
  { href: "/profile/partner/withdrawals/new", label: "ثبت برداشت" },
];

const ADMIN_TABS = [
  { href: "/profile/admin/partners", label: "جزئیات همکاران" },
  { href: "/profile/admin/users", label: "همه کاربران" },
  { href: "/profile/admin/offers", label: "پیشنهاد ها" },
  { href: "/profile/admin/requests", label: "مدیریت درخواست ها" },
  { href: "/profile/admin/withdrawals", label: "درخواست‌های برداشت" },
  { href: "/profile/admin/categories", label: "دسته‌بندی‌ها" },
  { href: "/profile/admin/provinces", label: "استان‌ها" },
  { href: "/profile/admin/city", label: "شهرها" },
  { href: "/profile/admin/unit", label: "واحدها" },
  { href: "/profile/admin/supplier-requests", label: "درخواست‌های تامین‌کننده" },
  { href: "/profile/admin/tariffs", label: "تعرفه‌ها" },
  { href: "/profile/admin/transactions", label: "تراکنش‌ها" },
];

export default function ProfileLayout({ children }) {
  const { user } = useAuth();
  const pathname = usePathname();

  const isAdmin = user?.status === "ADMIN";
  const isPartner = user?.status === "PARTNER";

  const roleTabs = isAdmin
    ? ADMIN_TABS
    : isPartner
    ? PARTNER_TABS
    : USER_TABS;

  // ترتیب نهایی: پیشخوان → تب‌های نقش → تنظیمات نوتیفیکیشن → خروج
  const tabs = [DASHBOARD_TAB, ...roleTabs, ...END_TABS];

  // انتخاب طولانی‌ترین مسیر منطبق تا فقط یک تب فعال باشد
  const activeHref = tabs.reduce((best, tab) => {
    const matches =
      pathname === tab.href || pathname.startsWith(tab.href + "/");
    if (!matches) return best;
    if (!best || tab.href.length > best.length) return tab.href;
    return best;
  }, null);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-100 p-4 md:p-6" dir="rtl">
        <div className="mx-auto grid max-w-7xl grid-cols-12 gap-4 md:gap-6">
          <aside className="col-span-12 rounded-2xl bg-white p-4 shadow-sm md:col-span-3 md:p-5">
            <div className="mb-5 border-b border-slate-200 pb-4">
              <h2 className="text-base font-black text-slate-900 md:text-lg">
                {user?.name || "کاربر"}
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                {isAdmin ? "مدیر سیستم" : isPartner ? "همکار" : "کاربر پلتفرم"}
              </p>
            </div>

            <nav className="flex gap-2 overflow-x-auto pb-2 md:flex-col md:overflow-visible md:pb-0 no-scrollbar">
              {tabs.map((tab) => {
                const active = tab.href === activeHref;

                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className={`shrink-0 whitespace-nowrap rounded-xl px-4 py-3 text-sm font-bold transition ${
                      active
                        ? "bg-cyan-500 text-white shadow-sm"
                        : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {tab.label}
                  </Link>
                );
              })}
            </nav>
          </aside>

          <main className="col-span-12 rounded-2xl bg-white p-5 shadow-sm md:col-span-9 md:p-8">
            {children}
          </main>
        </div>

        <style jsx global>{`
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
      </div>
    </ProtectedRoute>
  );
}
