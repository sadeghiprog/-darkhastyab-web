"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function PaymentResultClient() {
  const searchParams = useSearchParams();
  const [redirected, setRedirected] = useState(false);

  useEffect(() => {
    if (redirected) return;

    const status = searchParams.get("status") || "";
    const transactionId = searchParams.get("transactionId") || "";
    const errorCode = searchParams.get("errorCode") || "";

    const params = new URLSearchParams();

    if (status) {
      params.set("status", status);
    }

    if (transactionId) {
      params.set("transactionId", transactionId);
    }

    if (errorCode) {
      params.set("errorCode", errorCode);
    }

    const queryString = params.toString();

    const deepLink = `darkhastyab://payment-result${
      queryString ? `?${queryString}` : ""
    }`;

    const timer = setTimeout(() => {
      setRedirected(true);

      // بازگشت نتیجه پرداخت به اپلیکیشن
      window.location.href = deepLink;
    }, 1800);

    return () => clearTimeout(timer);
  }, [searchParams, redirected]);

  return (
    <div className="mt-8 text-center text-sm text-slate-500">
      در حال بازگشت به اپلیکیشن...
    </div>
  );
}
