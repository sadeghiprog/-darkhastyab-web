"use client";

import React, { useEffect, useState } from "react";

/**
 * Props:
 *  - serverParams: { status, transactionId, errorCode }
 *
 * اهداف:
 *  - پارامترها را از serverParams و در صورت نیاز از window.location بدست آورد.
 *  - پنل دیباگ کامل برای گوشی/ویندوز نمایش دهد.
 *  - دکمه بازگشت به اپلیکیشن را نگهدارد.
 */

export default function PaymentResultClient({ serverParams = {} }) {
  // مقادیر اولیه از سرور (ممکن است خالی باشند)
  const [status, setStatus] = useState(serverParams.status || "");
  const [transactionId, setTransactionId] = useState(serverParams.transactionId || "");
  const [errorCode, setErrorCode] = useState(serverParams.errorCode || "");

  // حالت‌های دیباگ و Hydration
  const [mounted, setMounted] = useState(false);
  const [heartbeat, setHeartbeat] = useState(0);
  const [browserReady, setBrowserReady] = useState(false);
  const [browserUserAgent, setBrowserUserAgent] = useState("");
  const [browserHref, setBrowserHref] = useState("");
  const [browserProtocol, setBrowserProtocol] = useState("");
  const [scriptCount, setScriptCount] = useState(0);
  const [loadedScripts, setLoadedScripts] = useState([]);
  const [earlyErrors, setEarlyErrors] = useState([]);
  const [logs, setLogs] = useState([]);
  const [isLocalhostNotice, setIsLocalhostNotice] = useState(false);

  const addLog = (type, title, details = null) => {
    const time = new Date().toLocaleTimeString("fa-IR");
    setLogs((prev) => [{ time, type, title, details }, ...prev]);
  };

  useEffect(() => {
    // mounted + JS active
    setMounted(true);
    setBrowserReady(true);

    // خواندن پارامترها از window.location اگر سرور چیزی نفرستاده
    try {
      const url = typeof window !== "undefined" ? new URL(window.location.href) : null;
      if (url) {
        const sp = url.searchParams;
        const s = sp.get("status");
        const tx = sp.get("transactionId");
        const ec = sp.get("errorCode");

        if (s) setStatus((prev) => prev || s);
        if (tx) setTransactionId((prev) => prev || tx);
        if (ec) setErrorCode((prev) => prev || ec);

        setBrowserHref(window.location.href);
        setBrowserProtocol(window.location.protocol);
        setBrowserUserAgent(window.navigator.userAgent || "");
      }

      // نادیده گرفتن خطای استفاده از navigator در SSR چون این useEffect فقط در کلاینت اجرا می‌شود
    } catch (e) {
      addLog("error", "خطا در خواندن URL کلاینت", { message: e.message });
    }

    // بررسی اسکریپت‌های صفحه
    try {
      const scripts = Array.from(document.scripts || []);
      setScriptCount(scripts.length);
      setLoadedScripts(
        scripts.map((s) => ({
          src: s.src || "inline",
          async: !!s.async,
          defer: !!s.defer,
        }))
      );
    } catch (e) {
      addLog("error", "خطا در خواندن تگ‌های script", { message: e.message });
    }

    // خواندن errorهای اولیه که ممکن است توسط inline script سرور ثبت شده باشند
    if (typeof window !== "undefined" && window.__EARLY_DEBUG__) {
      setEarlyErrors(window.__EARLY_DEBUG__.errors || []);
      addLog("info", "Early debug found", window.__EARLY_DEBUG__);
    }

    // بررسی localhost: اگر URL شامل localhost بود، بنر نمایش بده تا IP تست شود
    if (typeof window !== "undefined" && /localhost|127\\.0\\.0\\.1/.test(window.location.host)) {
      setIsLocalhostNotice(true);
      addLog("warn", "در حال استفاده از localhost — ممکن است دستگاه‌های دیگر نتوانند به این آدرس متصل شوند");
    }

    addLog("success", "کامپوننت کلاینت مانت شد (Hydration)");

    // شنونده‌ها برای خطاها
    const onError = (ev) => {
      addLog("error", "Runtime Error", {
        message: ev.message,
        filename: ev.filename,
        lineno: ev.lineno,
        colno: ev.colno,
      });
    };
    const onRejection = (ev) => {
      addLog("error", "Unhandled Rejection", { reason: ev.reason ? ev.reason.message || String(ev.reason) : String(ev.reason) });
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);

    // Heartbeat
    const t = setInterval(() => {
      setHeartbeat((h) => h + 1);
    }, 1000);

    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
      clearInterval(t);
    };
  }, [serverParams]);

  // دکمه بازگشت به اپلیکیشن (deep link)
  const appDeepLink = `darkhastyab://payment-result?status=${encodeURIComponent(
    status || ""
  )}&transactionId=${encodeURIComponent(transactionId || "")}&errorCode=${encodeURIComponent(errorCode || "")}`;

  const handleOpenApp = () => {
    addLog("info", "تلاش برای باز کردن اپلیکیشن", { link: appDeepLink });
    if (typeof window !== "undefined") {
      window.location.href = appDeepLink;
    }
  };

  // رندر پنل دیباگ و دکمه‌ها
  return (
    <div className="mt-6">
      {/* اگر localhost است، بنر هشدار */}
      {isLocalhostNotice && (
        <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-800">
          این صفحه روی localhost اجرا شده — از یک آدرس IP محلی (مثلاً http://10.162.57.121:3001) استفاده کنید تا گوشی بتواند به سرور متصل شود.
        </div>
      )}

      <div className="mt-4 flex flex-col gap-3">
        <button
          onClick={handleOpenApp}
          className="w-full rounded-lg bg-blue-600 px-4 py-3 text-white font-bold"
        >
          بازگشت به اپلیکیشن درخواستیاب
        </button>

        <div className="rounded-lg border p-3 bg-gray-50 text-sm">
          <div className="flex justify-between">
            <div>Heartbeat:</div>
            <div className="font-mono">{heartbeat}</div>
          </div>

          <div className="flex justify-between mt-2">
            <div>وضعیت اجرای جاوااسکریپت:</div>
            <div className={browserReady ? "text-emerald-600" : "text-rose-600"}>
              {browserReady ? "✓ فعال و Hydrate شده" : "✕ فقط SSR (JS غیرفعال)"}
            </div>
          </div>

          <div className="flex justify-between mt-2">
            <div>React Mounted:</div>
            <div className="font-mono">{mounted ? "true" : "false"}</div>
          </div>

          <div className="flex justify-between mt-2">
            <div>پروتکل:</div>
            <div className="font-mono">{browserProtocol || "در حال بررسی..."}</div>
          </div>

          <div className="flex justify-between mt-2">
            <div>تعداد Script تگ‌ها:</div>
            <div className="font-mono">{scriptCount}</div>
          </div>

          <div className="mt-2">
            <div className="text-xs text-gray-600">User Agent:</div>
            <div className="font-mono text-xs break-all">{browserUserAgent || "در حال رندر اولیه سمت سرور..."}</div>
          </div>

          <div className="mt-2">
            <div className="text-xs text-gray-600">آدرس فعلی (window.location):</div>
            <div className="font-mono text-xs break-all">{browserHref || "در حال رندر اولیه سمت سرور..."}</div>
          </div>

          {earlyErrors.length > 0 && (
            <div className="mt-3 rounded-md bg-red-50 p-2 text-red-700">
              <div className="font-bold">خطاهای اولیه:</div>
              <pre className="text-xs font-mono whitespace-pre-wrap overflow-x-auto">{JSON.stringify(earlyErrors, null, 2)}</pre>
            </div>
          )}

          {logs.length > 0 && (
            <div className="mt-3">
              <div className="font-bold">لاگ‌های کلاینت:</div>
              <div className="max-h-40 overflow-y-auto text-xs font-mono">
                {logs.map((l, i) => (
                  <div key={i} className="border-b py-1">
                    <div className="flex justify-between">
                      <div className={l.type === "error" ? "text-red-600" : l.type === "warn" ? "text-amber-600" : "text-green-600"}>
                        [{l.type}] {l.title}
                      </div>
                      <div className="text-gray-500">{l.time}</div>
                    </div>
                    {l.details && <div className="text-xs text-gray-600 mt-1">{JSON.stringify(l.details)}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {loadedScripts.length > 0 && (
            <details className="mt-2">
              <summary className="cursor-pointer text-xs">نمایش لیست اسکریپت‌های لود شده ({loadedScripts.length})</summary>
              <div className="mt-2 text-xs font-mono max-h-32 overflow-y-auto">
                {loadedScripts.map((s, idx) => (
                  <div key={idx} className="truncate">
                    {idx + 1}. {s.src}
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}
