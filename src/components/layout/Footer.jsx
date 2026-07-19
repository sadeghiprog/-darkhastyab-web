"use client";

import Link from "next/link";
import { Phone, ChevronLeft } from "lucide-react";
import { COLORS } from "../../constants/colors";

const footerLinks = [
  { href: "/", label: "خانه" },
  { href: "/filter", label: "درخواست‌ها" },
  { href: "/suppliers", label: "تأمین‌کنندگان" },
  { href: "/tariffs", label: "تعرفه‌ها" },
  { href: "/help", label: "راهنما و قوانین" },
  { href: "/contact", label: "تماس با ما" },
];

export default function Footer() {
  return (
    <footer className="mt-16 mb-8" dir="rtl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-gradient-to-br from-white via-slate-50/80 to-cyan-50/40 shadow-[0_10px_40px_rgba(15,23,42,0.06)]">
          <div className="flex flex-col gap-6 px-5 py-6 sm:px-6 md:flex-row md:items-center md:justify-between">
            {/* برند */}
            <div className="max-w-md">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-2xl shadow-sm"
                  style={{
                    background: `linear-gradient(135deg, ${COLORS.accent} 0%, #0ea5e9 100%)`,
                  }}
                >
                  <div className="h-4 w-4 rotate-45 rounded-md border-2 border-white" />
                </div>

                <div>
                  <h3 className="text-sm font-black text-slate-900 sm:text-base">
                    درخواست یاب
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    ارتباط سریع خریدار و تأمین‌کننده، ساده و حرفه‌ای
                  </p>
                </div>
              </div>
            </div>

            {/* تماس + اینماد */}
            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
              <a
                href="tel:09190555510"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-900"
              >
                <Phone size={15} className="text-slate-500" />
                <span>پشتیبانی 09190555510</span>
              </a>

              <div
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-2 shadow-sm"
                dangerouslySetInnerHTML={{
                  __html: `
                    <a referrerpolicy='origin' target='_blank' href='https://trustseal.enamad.ir/?id=760188&Code=Mlh6dv46rTdSNwFoG4uIpPrH4EX6t9NW'><img referrerpolicy='origin' src='https://trustseal.enamad.ir/logo.aspx?id=760188&Code=Mlh6dv46rTdSNwFoG4uIpPrH4EX6t9NW' alt='' style='cursor:pointer' code='Mlh6dv46rTdSNwFoG4uIpPrH4EX6t9NW'></a>
                  `,
                }}
              />
            </div>
          </div>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

          {/* پایین فوتر */}
          <div className="flex flex-col gap-4 px-5 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              {footerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group inline-flex items-center gap-1 text-xs font-medium text-slate-600 transition hover:text-slate-900"
                >
                  <span>{link.label}</span>
                  <ChevronLeft
                    size={14}
                    className="transition group-hover:-translate-x-0.5"
                  />
                </Link>
              ))}
            </div>

            <div className="text-[11px] leading-5 text-slate-500">
              © {new Date().getFullYear()} درخواست یاب — تمامی حقوق محفوظ است.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
