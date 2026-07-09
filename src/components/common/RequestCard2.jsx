import React from "react";
import Link from "next/link";
import {
  MapPin,
  Wallet,
  Boxes,
  CheckCircle2,
  CircleSlash,
  PackageSearch,
  User,
  Clock3,
} from "lucide-react";

export default function HorizontalRequestCardPremium({ request }) {
  const formatNumber = (value) =>
    new Intl.NumberFormat("fa-IR").format(value || 0);

  const href = `/request/${request.slug}`;

  const isExpired = request?.isExpired;
  const offersCount = request?.offersCount ?? 0;
  const userName = request?.userName || "کاربر";
  const daysRemaining =
    typeof request?.daysRemaining === "number" ? request.daysRemaining : null;

  return (
    <Link href={href} className="block">
      <div className="group w-full rounded-3xl border border-slate-200/80 bg-white px-4 py-4 shadow-[0_6px_24px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-[0_10px_30px_rgba(6,182,212,0.10)] cursor-pointer">
        <div className="flex items-center gap-4">
          <div className="h-14 w-1.5 rounded-full bg-gradient-to-b from-cyan-400 to-blue-500" />

          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2 flex-wrap">
              <span
                className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold border ${
                  isExpired
                    ? "bg-red-50 text-red-700 border-red-100"
                    : "bg-green-50 text-green-700 border-green-100"
                }`}
              >
                {isExpired ? (
                  <CircleSlash size={12} />
                ) : (
                  <CheckCircle2 size={12} />
                )}
                {isExpired ? "منقضی شده" : "فعال"}
              </span>

              <span className="truncate text-[11px] text-slate-400">
                {request?.category?.name || "عمومی"}
              </span>
            </div>

            <h3 className="mb-2 truncate text-sm font-black text-slate-800 md:text-base">
              {request?.title}
            </h3>

            <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
              <div className="flex items-center gap-1">
                <User size={13} className="text-cyan-600" />
                <span>کاربر:</span>
                <span className="font-bold text-slate-700">{userName}</span>
              </div>

              <div className="flex items-center gap-1">
                <Clock3 size={13} className="text-cyan-600" />
                <span>انقضا:</span>
                <span className="font-bold text-slate-700">
                  {isExpired
                    ? "منقضی شده"
                    : daysRemaining !== null
                    ? `${formatNumber(daysRemaining)} روز`
                    : "نامشخص"}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-slate-500">
                <Wallet size={14} className="text-cyan-600" />
                <span>بودجه</span>
                <span className="font-extrabold text-slate-800">
                  {formatNumber(request?.budgetAmount)} تومان
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-slate-500">
                <Boxes size={14} className="text-cyan-600" />
                <span>مقدار</span>
                <span className="font-extrabold text-slate-800">
                  {formatNumber(request?.quantity)} {request?.unit?.name || ""}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-slate-500">
                <MapPin size={14} className="text-cyan-600" />
                <span>تحویل</span>
                <span className="font-extrabold text-slate-800">
                  {request?.province?.name || "—"}
                  {request?.city?.name ? `، ${request.city.name}` : ""}
                </span>
              </div>
            </div>
          </div>

          <div className="shrink-0 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-center">
            <PackageSearch size={16} className="mx-auto mb-1 text-cyan-600" />
            <div className="text-[10px] text-slate-400">تعداد پیشنهاد</div>
            <div className="mt-1 text-xs font-extrabold text-slate-700">
              {formatNumber(offersCount)}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
