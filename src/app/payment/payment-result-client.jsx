"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ExternalLink, Smartphone } from "lucide-react";

/**
 * بر اساس AndroidManifest واقعی شما مقدار Scheme برابر "myb2bmobile" است.
 * در صورتی که بعداً با prebuild آن را به darkhastyab تغییر دادید، این ثابت را تغییر دهید.
 */
const SCHEME_NAME = "myb2bmobile";
const PACKAGE_NAME = "com.darkhastyab.app";

export default function PaymentResultClient({ serverParams = {} }) {
  const [status, setStatus] = useState(serverParams.status || "");
  const [transactionId, setTransactionId] = useState(serverParams.transactionId || "");
  const [errorCode, setErrorCode] = useState(serverParams.errorCode || "");
  const [redirecting, setRedirecting] = useState(true);

  const fallbackTimerRef = useRef(null);

  // پارامترهای نهایی URL برای Deep Link
  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (transactionId) params.set("transactionId", transactionId);
    if (errorCode) params.set("errorCode", errorCode);
    return params.toString();
  }, [status, transactionId, errorCode]);

  // ساخت لینک‌های مقصد
  const standardDeepLink = useMemo(
    () => `${SCHEME_NAME}://payment-result?${queryParams}`,
    [queryParams]
  );

  const intentDeepLink = useMemo(
    () =>
      `intent://payment-result?${queryParams}#Intent;scheme=${SCHEME_NAME};package=${PACKAGE_NAME};end`,
    [queryParams]
  );

  // تابع باز کردن اپلیکیشن
  const handleOpenApp = useCallback(() => {
    if (typeof window === "undefined") return;

    const isAndroid = /Android/i.test(navigator.userAgent);
    const targetUrl = isAndroid ? intentDeepLink : standardDeepLink;

    try {
      window.location.assign(targetUrl);
    } catch {
      window.location.href = targetUrl;
    }
  }, [intentDeepLink, standardDeepLink]);

  useEffect(() => {
    // خواندن پارامترها از کلاینت در صورتی که سرور به آنها دسترسی نداشت
    try {
      const url = new URL(window.location.href);
      const s = url.searchParams.get("status");
      const tx = url.searchParams.get("transactionId");
      const ec = url.searchParams.get("errorCode");

      if (s) setStatus((prev) => prev || s);
      if (tx) setTransactionId((prev) => prev || tx);
      if (ec) setErrorCode((prev) => prev || ec);
    } catch {
      // نادیده گرفتن خطا در خواندن کلاینت
    }

    // بررسی اینکه آیا برای این تراکنش انتقال خودکار قبلاً انجام شده یا خیر
    const storageKey = `darkhastyab_payment_redirect_${transactionId || "default"}`;
    const hasAttempted = window.sessionStorage.getItem(storageKey);

    let autoTimer = null;

    if (!hasAttempted) {
      window.sessionStorage.setItem(storageKey, "1");
      
      // تلاش برای انتقال خودکار پس از استقرار اولیه صفحه
      autoTimer = window.setTimeout(() => {
        handleOpenApp();
      }, 500);

      // تایمر فال‌بک: اگر بعد از ۲.۵ ثانیه صفحه باز ماند، وضعیت لودینگ را بردار
      fallbackTimerRef.current = window.setTimeout(() => {
        setRedirecting(false);
      }, 2500);
    } else {
      setRedirecting(false);
    }

    return () => {
      if (autoTimer) window.clearTimeout(autoTimer);
      if (fallbackTimerRef.current) window.clearTimeout(fallbackTimerRef.current);
    };
  }, [handleOpenApp, transactionId]);

  return (
    <div className="mt-8">
      {/* دکمه اصلی انتقال به اپلیکیشن */}
      <button
        type="button"
        onClick={handleOpenApp}
        className="group relative flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-base font-black text-white shadow-xl shadow-blue-500/20 transition-all duration-200 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98]"
      >
        <Smartphone size={22} className="transition-transform group-hover:scale-110" />
        <span>بازگشت به اپلیکیشن درخواستیاب</span>
        <ExternalLink size={18} className="opacity-70" />
      </button>

      {/* پیام وضعیت انتقال */}
      {redirecting ? (
        <p className="mt-3 text-xs text-slate-500 animate-pulse">
          در حال انتقال خودکار به برنامه...
        </p>
      ) : (
        <p className="mt-3 text-xs text-slate-400">
          اگر اپلیکیشن به صورت خودکار باز نشد، دکمه بالا را لمس کنید.
        </p>
      )}
    </div>
  );
}
