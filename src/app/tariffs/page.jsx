"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { authSession } from "../../lib/auth-session";

function TariffSkeleton() {
  return (
    <div className="animate-pulse rounded-3xl border border-slate-100/40 bg-white/70 p-8 shadow-xl shadow-slate-100/20">
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="mx-auto h-6 w-1/3 rounded-lg bg-slate-200/50" />
        </div>
        <div className="h-20 rounded-2xl bg-slate-100/60" />
        <div className="h-16 rounded-2xl bg-slate-100/60" />
        <div className="space-y-3 border-t border-slate-200/30 pt-4">
          <div className="mr-auto h-4 w-1/4 rounded-lg bg-slate-200/40" />
          <div className="mr-auto h-8 w-1/2 rounded-lg bg-slate-200/40" />
          <div className="h-12 w-full rounded-2xl bg-slate-200/40" />
        </div>
      </div>
    </div>
  );
}

function formatPrice(value) {
  return Number(value || 0).toLocaleString("fa-IR");
}

function getDiscountedPrice(tariff) {
  if (
    typeof tariff?.discountedPrice !== "undefined" &&
    tariff?.discountedPrice !== null
  ) {
    return Number(tariff.discountedPrice);
  }

  const price = Number(tariff?.price || 0);
  const discountPercent = Number(tariff?.discountPercent || 0);

  if (!discountPercent) return price;

  return Math.round(price * (1 - discountPercent / 100));
}

async function parseJsonSafely(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export default function TariffsPublicPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [tariffs, setTariffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [buyingId, setBuyingId] = useState(null);

  const apiBaseUrl = useMemo(() => {
    return process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "";
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadTariffs() {
      try {
        setLoading(true);
        setPageError("");

        const response = await fetch(`${apiBaseUrl}/tariffs`, {
          method: "GET",
          cache: "no-store",
        });

        const result = await parseJsonSafely(response);

        if (!response.ok || !result?.success) {
          throw new Error(result?.message || "دریافت تعرفه‌ها ناموفق بود");
        }

        if (!isMounted) return;
        setTariffs(Array.isArray(result.data) ? result.data : []);
      } catch (error) {
        if (!isMounted) return;
        setPageError(error.message || "خطا در دریافت تعرفه‌ها");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadTariffs();

    return () => {
      isMounted = false;
    };
  }, [apiBaseUrl]);

  const redirectToLogin = () => {
    authSession.setRedirectAfterLogin(
      window.location.pathname + window.location.search
    );
    router.push("/auth/login");
  };

  const handleBuy = async (tariffId) => {
    if (!isAuthenticated) {
      redirectToLogin();
      return;
    }

    try {
      setBuyingId(tariffId);

      const response = await fetch(`${apiBaseUrl}/payments/tariffs/buy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ tariffId }),
      });

      const result = await parseJsonSafely(response);

      if (response.status === 401) {
        redirectToLogin();
        return;
      }

      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "ایجاد لینک پرداخت ناموفق بود");
      }

      const paymentUrl = result?.data?.paymentUrl;

      if (!paymentUrl) {
        throw new Error("لینک پرداخت از سمت سرور دریافت نشد");
      }

      window.location.href = paymentUrl;
    } catch (error) {
      alert(error.message || "خطا در اتصال به درگاه پرداخت");
    } finally {
      setBuyingId(null);
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8" dir="rtl">
      <header className="relative mb-20 space-y-4 text-center">
        <div className="absolute inset-x-0 -top-16 -z-10 flex justify-center">
          <div className="h-40 w-[420px] rounded-full bg-cyan-200/30 blur-3xl" />
        </div>

        <h1 className="text-4xl font-black tracking-tight text-slate-800">
          ارتقای اعتبار حساب کاربری
        </h1>

        <p className="mx-auto max-w-md text-sm leading-relaxed text-slate-500">
          یکی از بسته‌های زیر را برای دسترسی مستقیم به اطلاعات تماس تامین‌کنندگان
          و ثبت پیشنهادات انتخاب کنید.
        </p>
      </header>

      {pageError ? (
        <div className="mb-8 rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700 shadow-sm">
          {pageError}
        </div>
      ) : null}

      {!loading && !pageError && tariffs.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white/80 px-6 py-10 text-center text-sm text-slate-500 shadow-sm">
          در حال حاضر هیچ تعرفه‌ای برای نمایش وجود ندارد.
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
        {loading
          ? Array.from({ length: 3 }).map((_, index) => (
              <TariffSkeleton key={index} />
            ))
          : tariffs.map((tariff) => {
              const hasDiscount = Number(tariff.discountPercent || 0) > 0;
              const finalPrice = getDiscountedPrice(tariff);
              const isBuying = buyingId === tariff.id;

              return (
                <section
                  key={tariff.id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-[28px] border border-white/60 bg-white/85 p-8 shadow-xl shadow-slate-200/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-cyan-200/40"
                >
                  <div className="absolute inset-0 -z-10 bg-gradient-to-br from-cyan-50 via-white to-slate-50" />
                  <div className="absolute left-1/2 -top-16 -z-10 h-32 w-32 -translate-x-1/2 rounded-full bg-cyan-300/20 blur-3xl opacity-0 transition duration-700 group-hover:opacity-100" />

                  {hasDiscount ? (
                    <span className="absolute right-6 top-6 flex items-center gap-1 rounded-full bg-gradient-to-l from-rose-500 to-rose-400 px-3 py-1.5 text-xs font-bold text-white shadow-lg shadow-rose-300/40">
                      <Sparkles size={14} aria-hidden="true" />
                      {tariff.discountPercent}% تخفیف
                    </span>
                  ) : null}

                  <div className="space-y-6">
                    <div className="text-center">
                      <h2 className="text-xl font-extrabold text-slate-800 transition group-hover:text-cyan-600">
                        {tariff.title}
                      </h2>
                    </div>

                    <div className="flex items-center gap-4 rounded-2xl border border-cyan-100 bg-gradient-to-br from-cyan-50 via-white to-slate-50 p-5 shadow-inner">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-600 text-white shadow-lg shadow-cyan-200/40">
                        <Sparkles size={20} aria-hidden="true" />
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

                    <div className="rounded-2xl border border-slate-200/70 bg-gradient-to-br from-slate-50 via-white to-cyan-50/50 p-4 shadow-sm">
                      <p className="text-sm leading-7 text-slate-600">
                        {tariff.description ||
                          "بدون توضیح ثبت شده برای این بسته"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 space-y-5 border-t border-slate-200/50 pt-6">
                    <div className="flex flex-col items-start gap-1">
                      {hasDiscount ? (
                        <span className="text-sm text-slate-400 line-through">
                          {formatPrice(tariff.price)} تومان
                        </span>
                      ) : null}

                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-extrabold text-slate-900">
                          {formatPrice(finalPrice)}
                        </span>
                        <span className="text-xs font-bold text-slate-500">
                          تومان
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleBuy(tariff.id)}
                      disabled={isBuying}
                      aria-label={`خرید بسته ${tariff.title}`}
                      className="w-full rounded-2xl bg-gradient-to-r from-cyan-600 to-cyan-500 py-3.5 text-sm font-black text-white shadow-lg shadow-cyan-300/40 transition-all duration-300 hover:from-cyan-700 hover:to-cyan-600 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isBuying ? "در حال اتصال به درگاه..." : "خرید بسته"}
                    </button>
                  </div>
                </section>
              );
            })}
      </div>
    </main>
  );
}
