import { redirect } from "next/navigation";

const ALLOWED_GATEWAY_HOSTS = [
  "parspal.com",

  // اگر لینک واقعی درگاه از دامنه دیگری است، اینجا اضافه کن:
  // "payment.parspal.com",
  // "pec.shaparak.ir",
  // "sep.shaparak.ir",
  // "ikc.shaparak.ir",
];

function parsePaymentUrl(rawUrl) {
  if (typeof rawUrl !== "string" || !rawUrl.trim()) {
    return null;
  }

  const value = rawUrl.trim();

  // ابتدا بدون decode بررسی می‌کنیم؛ چون Next معمولاً searchParams را decode می‌کند.
  try {
    return new URL(value);
  } catch {
    // فقط اگر URL مستقیم معتبر نبود، یک بار decode می‌کنیم.
    try {
      return new URL(decodeURIComponent(value));
    } catch {
      return null;
    }
  }
}

function isAllowedPaymentUrl(parsedUrl) {
  if (!parsedUrl) {
    return false;
  }

  if (parsedUrl.protocol !== "https:") {
    return false;
  }

  const hostname = parsedUrl.hostname.toLowerCase();

  return ALLOWED_GATEWAY_HOSTS.some((allowedHost) => {
    const normalizedAllowedHost = allowedHost.toLowerCase();

    return (
      hostname === normalizedAllowedHost ||
      hostname.endsWith(`.${normalizedAllowedHost}`)
    );
  });
}

export default async function PaymentStartPage({ searchParams }) {
  /*
   * در Next.js جدید searchParams ممکن است Promise باشد.
   * await با نسخه‌های قبلی هم مشکلی ایجاد نمی‌کند.
   */
  const params = await searchParams;

  const rawPaymentUrl =
    typeof params?.url === "string" ? params.url : "";

  const parsedPaymentUrl = parsePaymentUrl(rawPaymentUrl);

  if (!rawPaymentUrl) {
    return (
      <main
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-slate-50 px-4"
      >
        <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">
          <h1 className="text-xl font-black text-rose-600">
            شروع پرداخت ناموفق بود
          </h1>

          <p className="mt-4 text-sm leading-7 text-slate-600">
            لینک پرداخت ارسال نشده است.
          </p>

          <a
            href="/"
            className="mt-6 inline-flex rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white"
          >
            بازگشت به صفحه اصلی
          </a>
        </section>
      </main>
    );
  }

  if (!parsedPaymentUrl) {
    return (
      <main
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-slate-50 px-4"
      >
        <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">
          <h1 className="text-xl font-black text-rose-600">
            لینک پرداخت نامعتبر است
          </h1>

          <p className="mt-4 text-sm leading-7 text-slate-600">
            ساختار لینک پرداخت صحیح نیست.
          </p>

          <pre
            dir="ltr"
            className="mt-5 overflow-auto whitespace-pre-wrap break-all rounded-xl bg-slate-100 p-4 text-left text-xs text-slate-700"
          >
            {rawPaymentUrl}
          </pre>

          <a
            href="/"
            className="mt-6 inline-flex rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white"
          >
            بازگشت به صفحه اصلی
          </a>
        </section>
      </main>
    );
  }

  if (!isAllowedPaymentUrl(parsedPaymentUrl)) {
    return (
      <main
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-slate-50 px-4"
      >
        <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">
          <h1 className="text-xl font-black text-rose-600">
            آدرس درگاه مجاز نیست
          </h1>

          <p className="mt-4 text-sm leading-7 text-slate-600">
            دامنه لینک پرداخت در فهرست درگاه‌های مجاز قرار ندارد.
          </p>

          <div
            dir="ltr"
            className="mt-5 rounded-xl bg-slate-100 p-4 text-left text-xs"
          >
            <p>
              <strong>Hostname:</strong>{" "}
              {parsedPaymentUrl.hostname}
            </p>

            <p className="mt-2 break-all">
              <strong>URL:</strong>{" "}
              {parsedPaymentUrl.toString()}
            </p>
          </div>

          <a
            href="/"
            className="mt-6 inline-flex rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white"
          >
            بازگشت به صفحه اصلی
          </a>
        </section>
      </main>
    );
  }

  // ریدایرکت مستقیم سمت سرور
  redirect(parsedPaymentUrl.toString());
}
