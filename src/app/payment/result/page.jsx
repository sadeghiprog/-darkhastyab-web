import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Home,
  RefreshCw,
  XCircle,
} from "lucide-react";

import PaymentResultClient from "../payment-result-client";

const PAYMENT_ERROR_MESSAGES = {
  PAYMENT_NOT_COMPLETED: {
    title: "پرداخت تکمیل نشد",
    description:
      "پرداخت لغو شده یا فرآیند پرداخت تا انتها انجام نشده است. مبلغی به کیف پول اضافه نشد.",
  },
  GATEWAY_REJECTED: {
    title: "پرداخت توسط درگاه تایید نشد",
    description:
      "درگاه پرداخت تراکنش را ناموفق اعلام کرده است. در صورت کسر وجه از حساب، معمولاً ظرف ۷۲ ساعت توسط بانک بازگردانده می‌شود.",
  },
  AMOUNT_NOT_MATCH: {
    title: "مبلغ پرداخت صحیح نیست",
    description:
      "مبلغ پرداخت‌شده با فاکتور مطابقت ندارد. در صورت کسر وجه، لطفاً با پشتیبانی تماس بگیرید.",
  },
  INVALID_RECEIPT: {
    title: "رسید پرداخت معتبر نیست",
    description:
      "شماره رسید برگشتی از درگاه معتبر نبوده و تایید نشد.",
  },
  RECEIPT_NOT_FOUND: {
    title: "رسید پرداخت پیدا نشد",
    description:
      "رسید پرداخت در سامانه پیدا نشد. در صورت کسر وجه با پشتیبانی در تماس باشید.",
  },
  PAYMENT_NOT_FOUND: {
    title: "اطلاعات پرداخت پیدا نشد",
    description:
      "اطلاعات پرداخت در درگاه یافت نشد و امکان تایید تراکنش وجود ندارد.",
  },
  ALREADY_VERIFIED: {
    title: "پرداخت قبلاً بررسی شده است",
    description:
      "این تراکنش قبلاً پردازش شده است. لطفاً موجودی کیف پول خود را بررسی کنید.",
  },
  RECEIPT_NUMBER_MISSING: {
    title: "شماره رسید دریافت نشد",
    description:
      "اطلاعات بازگشتی از درگاه کامل نیست و شماره رسید پرداخت دریافت نگردید.",
  },
  CALLBACK_IDENTIFIERS_MISSING: {
    title: "اطلاعات بازگشتی ناقص است",
    description:
      "شناسه‌های لازم جهت پیگیری تراکنش از سمت بانک ارسال نشد.",
  },
  TRANSACTION_NOT_FOUND: {
    title: "تراکنش پیدا نشد",
    description:
      "تراکنش مربوط به این پرداخت در سامانه ثبت نشده است.",
  },
  VERIFY_REQUEST_FAILED: {
    title: "ارتباط با درگاه ناموفق بود",
    description:
      "در زمان تایید نهایی، ارتباط با سرور بانک برقرار نشد. لطفاً وضعیت کیف پول را بررسی کنید.",
  },
  VERIFY_FAILED: {
    title: "تایید پرداخت ناموفق بود",
    description:
      "پرداخت توسط درگاه بانکی تایید نگردید. در صورت کسر وجه، مبلغ برگشت خواهد خورد.",
  },
  INTERNAL_ERROR: {
    title: "خطا در بررسی پرداخت",
    description:
      "بررسی نتیجه پرداخت با خطای سیستمی مواجه شد. لطفاً وضعیت کیف پول را بررسی کنید.",
  },
};

function getPaymentResult(status, errorCode) {
  const isSuccess = status === "success" || status === "paid" || status === "ok";

  if (isSuccess) {
    return {
      isSuccess: true,
      icon: CheckCircle2,
      title: "پرداخت با موفقیت انجام شد",
      description: "حساب کاربری / کیف پول شما با موفقیت شارژ گردید.",
      badge: "پرداخت موفق",
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
      iconClass: "bg-emerald-50 text-emerald-600",
    };
  }

  const errorInfo = PAYMENT_ERROR_MESSAGES[errorCode] || {
    title: "پرداخت انجام نشد",
    description:
      "فرآیند پرداخت ناموفق بود یا توسط کاربر لغو شد. در صورت کسر وجه، مبلغ بازگردانده می‌شود.",
  };

  return {
    isSuccess: false,
    icon: errorCode === "AMOUNT_NOT_MATCH" ? AlertTriangle : XCircle,
    title: errorInfo.title,
    description: errorInfo.description,
    badge: "پرداخت ناموفق",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
    iconClass:
      errorCode === "AMOUNT_NOT_MATCH"
        ? "bg-amber-50 text-amber-600"
        : "bg-rose-50 text-rose-600",
  };
}

export default async function PaymentResultPage({ searchParams }) {
  // سازگار با Next.js 15 و نسخه‌های قبل‌تر
  const params = await searchParams;
  const status = params?.status || "";
  const transactionId = params?.transactionId || "";
  const errorCode = params?.errorCode || "";

  const result = getPaymentResult(status, errorCode);
  const Icon = result.icon;

  return (
    <main
      className="mx-auto flex min-h-[75vh] max-w-xl items-center justify-center px-4 py-12 sm:px-6"
      dir="rtl"
    >
      <section className="w-full overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 sm:p-10 text-center shadow-2xl shadow-slate-200/60">
        {/* آیکون نتیجه */}
        <div className="mx-auto mb-5 flex justify-center">
          <div
            className={`flex h-20 w-20 items-center justify-center rounded-3xl ${result.iconClass}`}
          >
            <Icon size={44} aria-hidden="true" />
          </div>
        </div>

        {/* بج وضعیت */}
        <div
          className={`mx-auto mb-4 inline-flex rounded-full border px-4 py-1 text-xs font-black ${result.badgeClass}`}
        >
          {result.badge}
        </div>

        {/* عنوان */}
        <h1 className="text-xl sm:text-2xl font-black text-slate-900">
          {result.title}
        </h1>

        {/* توضیحات */}
        <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-600">
          {result.description}
        </p>

        {/* اطلاعات تراکنش */}
        {(transactionId || (errorCode && !result.isSuccess)) && (
          <div className="mt-6 divide-y divide-slate-100 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-xs sm:text-sm">
            {transactionId && (
              <div className="flex items-center justify-between py-2 text-slate-600">
                <span className="font-bold text-slate-700">شناسه پیگیری:</span>
                <span className="font-mono text-slate-900 select-all" dir="ltr">
                  {transactionId}
                </span>
              </div>
            )}

            {errorCode && !result.isSuccess && (
              <div className="flex items-center justify-between py-2 text-slate-600">
                <span className="font-bold text-slate-700">کد خطا:</span>
                <span className="font-mono text-rose-600" dir="ltr">
                  {errorCode}
                </span>
              </div>
            )}
          </div>
        )}

        {/* بخش کلاینت و باز کردن خودکار / دستی اپلیکیشن */}
        <PaymentResultClient serverParams={{ status, transactionId, errorCode }} />

        {/* لینک‌های کمکی وب‌سایت */}
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Link
            href="/tariffs"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
          >
            <RefreshCw size={15} />
            مشاهده تعرفه‌ها
          </Link>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
          >
            <Home size={15} />
            صفحه اصلی سایت
          </Link>
        </div>
      </section>
    </main>
  );
}
