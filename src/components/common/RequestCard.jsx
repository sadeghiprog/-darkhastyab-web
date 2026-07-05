import React from "react";
import Link from "next/link";
import {
  Layers,
  Package,
  CreditCard,
  MapPin,
  ChevronLeft,
  CheckCircle2,
  CircleSlash,
  PackageSearch,
} from "lucide-react";

export default function RequestCard({ request }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("fa-IR").format(amount || 0);
  };

  const href = `/request/${request.slug}`;

  const isExpired = request?.expiresAt
    ? new Date(request.expiresAt) < new Date()
    : false;

  const offersCount = request?.offersCount ?? 0;

  return (
    <Link href={href} className="block">
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col gap-4 relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-cyan-200 hover:-translate-y-1">

        {/* عنوان + دسته‌بندی + وضعیت */}
        <div className="flex flex-col gap-3">
          <h3 className="text-lg font-bold text-slate-800 leading-tight">
            {request?.title}
          </h3>

          <div className="flex items-center justify-between gap-3">

            {/* دسته‌بندی */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">دسته‌بندی:</span>
              <div className="bg-cyan-50 text-cyan-600 px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-xs font-semibold">
                <Layers size={13} />
                <span>{request?.category?.name || "—"}</span>
              </div>
            </div>

            {/* وضعیت */}
            <div
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${
                isExpired
                  ? "bg-red-100 text-red-600"
                  : "bg-green-100 text-green-600"
              }`}
            >
              {isExpired ? (
                <CircleSlash size={14} />
              ) : (
                <CheckCircle2 size={14} />
              )}
              <span>{isExpired ? "منقضی شده" : "فعال"}</span>
            </div>

          </div>
        </div>

        <hr className="border-slate-100" />

        {/* شبکه اطلاعات */}
        <div className="grid grid-cols-2 gap-3">

          {/* بودجه پیشنهادی */}
          <div className="bg-slate-50/50 rounded-2xl p-3 border border-slate-100 flex items-center gap-3">
            <div className="bg-cyan-50 text-cyan-500 p-2 rounded-xl shrink-0">
              <CreditCard size={18} />
            </div>

            <div className="flex flex-col min-w-0">
              <span className="text-[10px] text-slate-400 mb-0.5">
                بودجه پیشنهادی
              </span>

              <div className="flex items-baseline gap-1 truncate">
                <span className="font-extrabold text-sm text-slate-700">
                  {formatCurrency(request?.budgetAmount)}
                </span>
                <span className="text-[9px] text-slate-400">ریال</span>
              </div>
            </div>
          </div>

          {/* مقدار / واحد */}
          <div className="bg-slate-50/50 rounded-2xl p-3 border border-slate-100 flex items-center gap-3">
            <div className="bg-cyan-50 text-cyan-500 p-2 rounded-xl shrink-0">
              <Package size={18} />
            </div>

            <div className="flex flex-col min-w-0">
              <span className="text-[10px] text-slate-400 mb-0.5">
                مقدار / واحد
              </span>

              <div className="flex items-baseline gap-1 truncate">
                <span className="font-extrabold text-sm text-slate-700">
                  {formatCurrency(request?.quantity)}
                </span>
                <span className="text-xs text-slate-500">
                  {request?.unit?.name || ""}
                </span>
              </div>
            </div>
          </div>

          {/* تعداد پیشنهادها */}
          <div className="bg-slate-50/50 rounded-2xl p-3 border border-slate-100 flex items-center gap-3">
            <div className="bg-cyan-50 text-cyan-500 p-2 rounded-xl shrink-0">
              <PackageSearch size={18} />
            </div>

            <div className="flex flex-col min-w-0">
              <span className="text-[10px] text-slate-400 mb-0.5">
                تعداد پیشنهادها
              </span>

              <span className="font-extrabold text-sm text-slate-700">
                {offersCount}
              </span>
            </div>
          </div>

          {/* محل تحویل */}
          <div className="bg-slate-50/50 rounded-2xl p-3 border border-slate-100 flex items-center gap-3">
            <div className="bg-cyan-50 text-cyan-500 p-2 rounded-xl shrink-0">
              <MapPin size={18} />
            </div>

            <div className="flex flex-col min-w-0">
              <span className="text-[10px] text-slate-400 mb-0.5">
                محل تحویل
              </span>

              <span className="font-extrabold text-sm text-slate-700 truncate">
                {request?.province?.name || "—"}
                {request?.city?.name ? `، ${request.city.name}` : ""}
              </span>
            </div>
          </div>

        </div>

        {/* فوتر */}
        <div className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 mt-1 text-sm transition-all">
          <span>مشاهده جزئیات</span>
          <ChevronLeft size={16} />
        </div>
      </div>
    </Link>
  );
}
