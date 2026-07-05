"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

function TariffSkeleton() {
  return (
    <div className="animate-pulse rounded-3xl border border-slate-100/40 bg-white/70 p-8 shadow-xl shadow-slate-100/20">
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="mx-auto h-6 w-1/3 rounded-lg bg-slate-200/50" />
        </div>
        <div className="h-20 rounded-2xl bg-slate-100/60" />
        <div className="h-16 rounded-2xl bg-slate-100/60" />
        <div className="space-y-3 pt-4 border-t border-slate-200/30">
          <div className="h-4 w-1/4 rounded-lg bg-slate-200/40 mr-auto" />
          <div className="h-8 w-1/2 rounded-lg bg-slate-200/40 mr-auto" />
          <div className="h-12 w-full rounded-2xl bg-slate-200/40" />
        </div>
      </div>
    </div>
  );
}

export default function TariffsPublicPage() {
  const [tariffs, setTariffs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/tariffs`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setTariffs(data.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  async function handleBuy(tariffId) {
    alert(`درخواست خرید تعرفه با شناسه ${tariffId} ارسال شد. اتصال به درگاه پرداخت...`);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8" dir="rtl">
      {/* هدر صفحه */}
      <div className="relative mb-20 text-center space-y-4">
        <div className="absolute inset-x-0 -top-16 -z-10 flex justify-center">
          <div className="h-40 w-[420px] rounded-full bg-cyan-200/30 blur-3xl" />
        </div>

        <h1 className="text-4xl font-black tracking-tight text-slate-800">
          ارتقای اعتبار حساب کاربری
        </h1>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-slate-500">
          یکی از بسته‌های زیر را برای دسترسی مستقیم به اطلاعات تماس تامین‌کنندگان
          و ثبت پیشنهادات نامحدود انتخاب کنید.
        </p>
      </div>

      {/* گرید تعرفه‌ها */}
      <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => <TariffSkeleton key={i} />)
          : tariffs.map((tariff) => {
              const hasDiscount = tariff.discountPercent > 0;

              return (
                <div
                  key={tariff.id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-[28px] border border-white/60 bg-white/85 p-8 shadow-xl shadow-slate-200/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-cyan-200/40"
                >
                  {/* افکت بک‌گراند */}
                  <div className="absolute inset-0 -z-10 bg-gradient-to-br from-cyan-50 via-white to-slate-50" />
                  <div className="absolute -top-16 left-1/2 -z-10 h-32 w-32 -translate-x-1/2 rounded-full bg-cyan-300/20 blur-3xl opacity-0 transition duration-700 group-hover:opacity-100" />

                  {/* تگ تخفیف */}
                  {hasDiscount && (
                    <span className="absolute right-6 top-6 flex items-center gap-1 rounded-full bg-gradient-to-l from-rose-500 to-rose-400 px-3 py-1.5 text-xs font-bold text-white shadow-lg shadow-rose-300/40">
                      <Sparkles size={14} />
                      {tariff.discountPercent}% تخفیف
                    </span>
                  )}

                  <div className="space-y-6">
                    {/* عنوان */}
                    <div className="text-center">
                      <h3 className="text-xl font-extrabold text-slate-800 transition group-hover:text-cyan-600">
                        {tariff.title}
                      </h3>
                    </div>

                    {/* باکس اعتبار */}
                    <div className="flex items-center gap-4 rounded-2xl border border-cyan-100 bg-gradient-to-br from-cyan-50 via-white to-slate-50 p-5 shadow-inner">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-600 text-white shadow-lg shadow-cyan-200/40">
                        <Sparkles size={20} />
                      </div>

                      <div className="leading-tight">
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black text-slate-900">
                            {tariff.creditCount}
                          </span>
                          <span className="text-xs font-bold text-slate-500">
                            اعتبار
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          برای مشاهده اطلاعات تماس تامین‌کنندگان
                        </span>
                      </div>
                    </div>

                    {/* توضیح اصلی بسته */}
                    <div className="rounded-2xl border border-slate-200/70 bg-gradient-to-br from-slate-50 via-white to-cyan-50/50 p-4 shadow-sm">
                      <p className="text-sm leading-7 text-slate-600">
                        {tariff.description || "بدون توضیح ثبت شده برای این بسته"}
                      </p>
                    </div>
                  </div>

                  {/* قیمت و دکمه */}
                  <div className="mt-8 space-y-5 border-t border-slate-200/50 pt-6">
                    <div className="flex flex-col items-start gap-1">
                      {hasDiscount && (
                        <span className="text-sm text-slate-400 line-through">
                          {Number(tariff.price).toLocaleString()} تومان
                        </span>
                      )}

                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-extrabold text-slate-900">
                          {tariff.discountedPrice.toLocaleString()}
                        </span>
                        <span className="text-xs font-bold text-slate-500">
                          تومان
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleBuy(tariff.id)}
                      className="w-full rounded-2xl bg-gradient-to-r from-cyan-600 to-cyan-500 py-3.5 text-sm font-black text-white shadow-lg shadow-cyan-300/40 transition-all duration-300 hover:from-cyan-700 hover:to-cyan-600 active:scale-[0.97]"
                    >
                      خرید بسته
                    </button>
                  </div>
                </div>
              );
            })}
      </div>
    </div>
  );
}
