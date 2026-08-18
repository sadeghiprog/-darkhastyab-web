"use client";

import React, { useEffect, useState } from "react";

export default function PaymentResultClient({ serverParams = {} }) {
  const [status, setStatus] = useState(serverParams.status || "");
  const [transactionId, setTransactionId] = useState(serverParams.transactionId || "");
  const [errorCode, setErrorCode] = useState(serverParams.errorCode || "");

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
    setMounted(true);
    setBrowserReady(true);

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
    } catch (e) {
      addLog("error", "خطا در خواندن URL کلاینت", { message: e.message });
    }

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

    if (typeof window !== "undefined" && window.__EARLY_DEBUG__) {
      setEarlyErrors(window.__EARLY_DEBUG__.errors || []);
      addLog("info", "Early debug found", window.__EARLY_DEBUG__);
    }

    if (typeof window !== "undefined" && /localhost|127\\.0\\.0\\.1/.test(window.location.host)) {
      setIsLocalhostNotice(true);
    }

    addLog("success", "کامپوننت کلاینت مانت شد (Hydration)");

    const onError = (ev) => {
      addLog("error", "Runtime Error", { message: ev.message });
    };
    const onRejection = (ev) => {
      addLog("error", "Unhandled Rejection", { reason: ev.reason ? ev.reason.message || String(ev.reason) : String(ev.reason) });
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);

    const t = setInterval(() => {
      setHeartbeat((h) => h + 1);
    }, 1000);

    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
      clearInterval(t);
    };
  }, [serverParams]);

  /**
   * تابع اصلی برای باز کردن اپلیکیشن با استفاده از Intent برای اندروید
   */
  const handleOpenApp = () => {
    const isAndroid = /Android/i.test(navigator.userAgent);
    
    // ۱. ساخت لینک استاندارد (برای iOS یا مرورگرهای معمولی)
    const standardScheme = `darkhastyab://payment-result?status=${encodeURIComponent(status)}&transactionId=${encodeURIComponent(transactionId)}&errorCode=${encodeURIComponent(errorCode)}`;

    // ۲. ساخت لینک Intent (فوق‌العاده برای اندروید و مرورگرهای داخلی)
    // ساختار: intent://[path]#Intent;scheme=[scheme];package=[package_name];end
    // نکته: اگر Package Name اپلیکیشن خود را نمی‌دانید، این بخش را می‌توانید حذف کنید، اما با آن ۱۰۰٪ دقیق‌تر است.
    // فرض می‌کنیم پکیج شما com.darkhastyab.app است (اگر متفاوت است، در کد جایگزین کنید)
    const packageName = "com.darkhastyab.app"; // <--- حتما این را با Package Name واقعی اپلیکیشن خود جایگزین کنید
    const intentScheme = `intent://payment-result?status=${encodeURIComponent(status)}&transactionId=${encodeURIComponent(transactionId)}&errorCode=${encodeURIComponent(errorCode)}#Intent;scheme=darkhastyab;package=${packageName};end`;

    addLog("info", "Attempting to open app", { 
      isAndroid, 
      usedIntent: isAndroid, 
      link: isAndroid ? intentScheme : standardScheme 
    });

    try {
      if (isAndroid) {
        // در اندروید از Intent استفاده می‌کنیم
        window.location.href = intentScheme;
      } else {
        // در iOS یا سایر موارد از Scheme معمولی استفاده می‌کنیم
        window.location.href = standardScheme;
      }
    } catch (e) {
      addLog("error", "Redirect failed", { message: e.message });
    }
  };

  return (
    <div className="mt-6">
      {isLocalhostNotice && (
        <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-800 text-xs">
          ⚠️ در حال استفاده از localhost هستید.
        </div>
      )}

      <div className="mt-4 flex flex-col gap-3">
        <button
          onClick={handleOpenApp}
          className="w-full rounded-2xl bg-blue-600 px-4 py-4 text-white font-black text-lg shadow-lg shadow-blue-200 active:scale-95 transition-transform"
        >
          بازگشت به اپلیکیشن درخواستیاب
        </button>

        {/* پنل دیباگ */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-[10px] text-slate-500">
          <div className="font-bold mb-2 text-slate-700">DEBUG PANEL</div>
          <div className="flex justify-between"><span>Heartbeat:</span><span className="font-mono">{heartbeat}</span></div>
          <div className="flex justify-between"><span>JS Ready:</span><span className={browserReady ? "text-emerald-600" : "text-rose-600"}>{browserReady ? "YES" : "NO"}</span></div>
          <div className="flex justify-between"><span>Scripts:</span><span className="font-mono">{scriptCount}</span></div>
          <div className="mt-2 text-[9px] break-all"><span>UA:</span><br/>{browserUserAgent}</div>
          
          <div className="mt-4">
            <div className="font-bold mb-1 text-slate-700">LOGS:</div>
            <div className="max-h-32 overflow-y-auto">
              {logs.map((l, i) => (
                <div key={i} className="border-b border-slate-200 py-1">
                  <div className="flex justify-between">
                    <span className={l.type === "error" ? "text-red-500" : "text-blue-500"}>[{l.type}]</span>
                    <span>{l.time}</span>
                  </div>
                  <div className="opacity-70">{l.title}</div>
                  {l.details && <div className="text-[8px] break-all opacity-50">{JSON.stringify(l.details)}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
