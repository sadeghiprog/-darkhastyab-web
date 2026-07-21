import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Home,
  RefreshCw,
  XCircle,
} from "lucide-react";

const PAYMENT_ERROR_MESSAGES = {
  PAYMENT_NOT_COMPLETED: {
    title: "پرداخت تکمیل نشد",
    description:
      "پرداخت لغو شده یا فرآیند پرداخت تا انتها انجام نشده است. در این حالت مبلغی به کیف پول اضافه نمی‌شود.",
  },
  GATEWAY_REJECTED: {
    title: "پرداخت توسط درگاه تایید نشد",
    description:
      "درگاه پرداخت تراکنش را ناموفق اعلام کرده است. اگر وجهی از حساب شما کسر شده باشد، معمولاً توسط بانک برگشت داده می‌شود.",
  },
  AMOUNT_NOT_MATCH: {
    title: "مبلغ پرداخت صحیح نیست",
    description:
      "مبلغ پرداخت‌شده با مبلغ سفارش مطابقت ندارد. کیف پول شارژ نشده است. در صورت کسر وجه، لطفاً با پشتیبانی تماس بگیرید.",
  },
  INVALID_RECEIPT: {
    title: "رسید پرداخت معتبر نیست",
    description:
      "شماره رسید برگشتی از درگاه معتبر نیست و پرداخت توسط سیستم تایید نشد.",
  },
  RECEIPT_NOT_FOUND: {
    title: "رسید پرداخت پیدا نشد",
    description:
      "رسید پرداخت در سامانه درگاه پیدا نشد. در صورت کسر وجه، لطفاً با پشتیبانی تماس بگیرید.",
  },
  PAYMENT_NOT_FOUND: {
    title: "اطلاعات پرداخت پیدا نشد",
    description:
      "اطلاعات پرداخت در درگاه پیدا نشد و امکان تایید تراکنش وجود ندارد.",
  },
  ALREADY_VERIFIED: {
    title: "پرداخت قبلاً بررسی شده است",
    description:
      "این تراکنش قبلاً بررسی شده است. لطفاً وضعیت کیف پول خود را بررسی کنید.",
  },
  RECEIPT_NUMBER_MISSING: {
    title: "شماره رسید دریافت نشد",
    description:
      "اطلاعات بازگشتی از درگاه کامل نیست و شماره رسید پرداخت دریافت نشده است.",
  },
  CALLBACK_IDENTIFIERS_MISSING: {
    title: "اطلاعات بازگشتی ناقص است",
    description:
      "شناسه‌های لازم برای پیدا کردن تراکنش از سمت درگاه دریافت نشد.",
  },
  TRANSACTION_NOT_FOUND: {
    title: "تراکنش پیدا نشد",
    description:
      "تراکنش مربوط به این پرداخت در سیستم پیدا نشد. در صورت کسر وجه، لطفاً با پشتیبانی تماس بگیرید.",
  },
  VERIFY_REQUEST_FAILED: {
    title: "ارتباط با درگاه ناموفق بود",
    description:
      "در زمان تایید نهایی پرداخت، ارتباط با درگاه برقرار نشد. لطفاً کمی بعد وضعیت کیف پول خود را بررسی کنید.",
  },
  VERIFY_FAILED: {
    title: "تایید پرداخت ناموفق بود",
    description:
      "پرداخت توسط درگاه تایید نهایی نشد. در صورت کسر وجه، لطفاً با پشتیبانی تماس بگیرید.",
  },
  INTERNAL_ERROR: {
    title: "خطا در بررسی پرداخت",
    description:
      "بررسی نتیجه پرداخت با خطای داخلی مواجه شد. لطفاً کمی بعد وضعیت کیف پول خود را بررسی کنید.",
  },
};

function getPaymentResult(status, errorCode) {
  if (status === "success") {
    return {
      isSuccess: true,
      icon: CheckCircle2,
      title: "پرداخت موفق بود",
      description: "کیف پول شما با موفقیت شارژ شد.",
      badge: "موفق",
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
      iconClass: "bg-emerald-50 text-emerald-600",
    };
  }

  const errorInfo = PAYMENT_ERROR_MESSAGES[errorCode] || {
    title: "پرداخت ناموفق بود",
    description:
      "پرداخت تکمیل یا تایید نشد. در صورت کسر وجه، لطفاً با پشتیبانی تماس بگیرید.",
  };

  return {
    isSuccess: false,
    icon: errorCode === "AMOUNT_NOT_MATCH" ? AlertTriangle : XCircle,
    title: errorInfo.title,
    description: errorInfo.description,
    badge: "ناموفق",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
    iconClass:
      errorCode === "AMOUNT_NOT_MATCH"
        ? "bg-amber-50 text-amber-600"
        : "bg-rose-50 text-rose-600",
  };
}

export default async function PaymentResultPage({ searchParams }) {
  const params = await searchParams;

  const status = params?.status || "";
  const transactionId = params?.transactionId || "";
  const errorCode = params?.errorCode || "";

  const result = getPaymentResult(status, errorCode);
  const Icon = result.icon;

  return (
    <main
      className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center px-4 py-20 sm:px-6 lg:px-8"
      dir="rtl"
    >
      <section className="w-full overflow-hidden rounded-[32px] border border-white/70 bg-white/90 p-8 text-center shadow-2xl shadow-slate-200/70">
        <div className="mx-auto mb-6 flex justify-center">
          <div
            className={`flex h-20 w-20 items-center justify-center rounded-3xl ${result.iconClass}`}
          >
            <Icon size={42} aria-hidden="true" />
          </div>
        </div>

        <div
          className={`mx-auto mb-5 inline-flex rounded-full border px-4 py-1.5 text-xs font-black ${result.badgeClass}`}
        >
          {result.badge}
        </div>

        <h1 className="text-2xl font-black text-slate-900">{result.title}</h1>

        <p className="mx-auto mt-4 max-w-md text-sm leading-8 text-slate-600">
          {result.description}
        </p>

        {transactionId ? (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <span className="font-bold text-slate-800">شناسه پیگیری: </span>
            <span dir="ltr">{transactionId}</span>
          </div>
        ) : null}

        {errorCode && status !== "success" ? (
          <div className="mt-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-500">
            <span className="font-bold">کد خطا: </span>
            <span dir="ltr">{errorCode}</span>
          </div>
        ) : null}

        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Link
            href="/tariffs"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50"
          >
            <RefreshCw size={18} aria-hidden="true" />
            بازگشت به تعرفه‌ها
          </Link>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-cyan-200 transition hover:bg-cyan-700"
          >
            <Home size={18} aria-hidden="true" />
            صفحه اصلی
          </Link>
        </div>
      </section>
    </main>
  );
}
