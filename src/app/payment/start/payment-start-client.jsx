"use client";

import { useEffect, useState } from "react";

/**
 * در صورت متفاوت بودن hostname لینک واقعی پارس‌پال،
 * hostname دقیق را به این لیست اضافه کن.
 *
 * نمونه:
 * "payment.parspal.com"
 */
const EXTRA_ALLOWED_GATEWAY_HOSTS = new Set([
  // "payment.parspal.com",
]);

function isAllowedParspalUrl(rawUrl) {
  try {
    const parsedUrl = new URL(rawUrl);

    const hostname = parsedUrl.hostname.toLowerCase();

    const isParspalDomain =
      hostname === "parspal.com" || hostname.endsWith(".parspal.com");

    const isExtraAllowedDomain =
      EXTRA_ALLOWED_GATEWAY_HOSTS.has(hostname);

    return (
      parsedUrl.protocol === "https:" &&
      (isParspalDomain || isExtraAllowedDomain)
    );
  } catch {
    return false;
  }
}

export default function PaymentStartClient({ paymentUrl }) {
  const [error, setError] = useState("");

  useEffect(() => {
    if (!paymentUrl) {
      setError("لینک پرداخت ارسال نشده یا نامعتبر است.");
      return;
    }

    if (!isAllowedParspalUrl(paymentUrl)) {
      setError("آدرس درگاه پرداخت معتبر نیست.");
      return;
    }

    // یک تاخیر بسیار کوتاه اختیاری است تا متن انتقال دیده شود.
    const timeoutId = window.setTimeout(() => {
      window.location.replace(paymentUrl);
    }, 350);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [paymentUrl]);

  return (
    <main
      dir="rtl"
      className="flex min-h-screen items-center justify-center bg-slate-50 px-4"
    >
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">
        {error ? (
          <>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-2xl text-rose-600">
              !
            </div>

            <h1 className="mt-5 text-xl font-black text-rose-600">
              شروع پرداخت ناموفق بود
            </h1>

            <p className="mt-4 text-sm leading-7 text-slate-600">{error}</p>

            <a
              href="/"
              className="mt-6 inline-flex rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white"
            >
              بازگشت به صفحه اصلی
            </a>
          </>
        ) : (
          <>
            <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-cyan-100 border-t-cyan-600" />

            <h1 className="mt-6 text-xl font-black text-slate-900">
              در حال انتقال به درگاه پرداخت
            </h1>

            <p className="mt-3 text-sm leading-7 text-slate-500">
              لطفاً چند لحظه صبر کنید و این صفحه را نبندید.
            </p>
          </>
        )}
      </section>
    </main>
  );
}
