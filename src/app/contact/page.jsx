import { Mail, MapPin, Phone, UserRound, BadgeInfo } from "lucide-react";

export const metadata = {
  title: "تماس با ما | درخواست‌یاب",
  description:
    "اطلاعات تماس، نشانی دفتر مرکزی، شماره تلفن و راه‌های ارتباطی با پشتیبانی پلتفرم درخواست‌یاب جهت پیگیری درخواست‌ها و هماهنگی‌های بیشتر.",
  keywords: [
    "تماس با درخواست یاب",
    "پشتیبانی درخواست یاب",
    "آدرس درخواست یاب",
    "تلفن درخواست یاب",
    "ایمیل درخواست یاب",
    "سودابه غیاثی",
  ],
  alternates: {
    canonical: "https://darkhastyab.com/contact",
    languages: {
      "fa-IR": "https://darkhastyab.com/contact",
    },
  },
  openGraph: {
    type: "website",
    locale: "fa_IR",
    url: "https://darkhastyab.com/contact",
    siteName: "درخواست‌یاب",
    title: "تماس با ما | درخواست‌یاب",
    description:
      "اطلاعات تماس، شماره همراه، تلفن ثابت و نشانی پلتفرم B2B درخواست‌یاب جهت پشتیبانی و ارتباط مستقیم.",
  },
  twitter: {
    card: "summary",
    title: "تماس با ما | درخواست‌یاب",
    description: "راه‌های ارتباطی و آدرس دفتر پشتیبانی پلتفرم درخواست‌یاب.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

// ساختار داده نشانه گذاری محلی (Schema.org) برای افزایش رتبه سئوی محلی در گوگل
const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "درخواست‌یاب",
  "image": "https://darkhastyab.com/images/logo.png", // در صورت وجود، آدرس لوگو را جایگزین کنید
  "telephone": ["09190555510", "04137725075"],
  "email": "darkhastyab@gmail.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "عسگر آباد، بن‌بست نریمانی، پلاک 109",
    "addressLocality": "بناب",
    "addressRegion": "آذربایجان شرقی",
    "postalCode": "5551955134",
    "addressCountry": "IR"
  },
  "url": "https://darkhastyab.com",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+98-9190555510",
    "contactType": "customer support"
  }
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100" dir="rtl">
      {/* تزریق داده‌های ساختاریافته به خروجی موتورهای جستجو */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusinessSchema).replace(/</g, "\\u003c"),
        }}
      />

      <section className="mx-auto max-w-5xl px-4 py-14 md:px-6 md:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-bold text-slate-600 shadow-sm">
            ارتباط با درخواست‌یاب
          </span>

          <h1 className="mt-5 text-3xl font-extrabold leading-tight text-slate-900 md:text-5xl md:leading-[4rem]">
            تماس با ما
          </h1>

          <p className="mt-4 text-sm leading-8 text-slate-600 md:text-base">
            برای ارتباط با مجموعه درخواست‌یاب، دریافت پشتیبانی، پیگیری درخواست‌ها
            یا هماهنگی‌های بیشتر، از طریق اطلاعات زیر با ما در تماس باشید.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {/* ستون اول: اطلاعات ارتباطی */}
          <address className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm md:p-8 not-italic">
            <h2 className="mb-6 text-lg font-black text-slate-900">
              اطلاعات ارتباطی
            </h2>

            <div className="space-y-4">
              <div className="flex items-start gap-4 rounded-2xl bg-slate-50 p-4">
                <div className="rounded-2xl bg-slate-900/5 p-3 text-slate-700">
                  <UserRound size={20} aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500">نام مالک</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900 md:text-base">
                    سودابه غیاثی
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-2xl bg-slate-50 p-4">
                <div className="rounded-2xl bg-slate-900/5 p-3 text-slate-700">
                  <Phone size={20} aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500">شماره همراه</p>
                  <a
                    href="tel:09190555510"
                    dir="ltr"
                    className="mt-1 block text-sm font-semibold text-slate-900 transition hover:text-sky-700 md:text-base"
                  >
                    09190555510
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-2xl bg-slate-50 p-4">
                <div className="rounded-2xl bg-slate-900/5 p-3 text-slate-700">
                  <Phone size={20} aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500">تلفن ثابت</p>
                  <a
                    href="tel:04137725075"
                    dir="ltr"
                    className="mt-1 block text-sm font-semibold text-slate-900 transition hover:text-sky-700 md:text-base"
                  >
                    04137725075
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-2xl bg-slate-50 p-4">
                <div className="rounded-2xl bg-slate-900/5 p-3 text-slate-700">
                  <Mail size={20} aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500">ایمیل</p>
                  <a
                    href="mailto:darkhastyab@gmail.com"
                    dir="ltr"
                    className="mt-1 block break-all text-sm font-semibold text-slate-900 transition hover:text-sky-700 md:text-base"
                  >
                    darkhastyab@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-2xl bg-slate-50 p-4">
                <div className="rounded-2xl bg-slate-900/5 p-3 text-slate-700">
                  <BadgeInfo size={20} aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500">کد پستی</p>
                  <p
                    dir="ltr"
                    className="mt-1 text-sm font-semibold text-slate-900 md:text-base"
                  >
                    5551955134
                  </p>
                </div>
              </div>
            </div>
          </address>

          {/* ستون دوم: نشانی و راه‌های دسترسی */}
          <div className="rounded-[28px] border border-slate-200 bg-slate-900 p-6 text-white shadow-lg md:p-8">
            <h2 className="mb-6 text-lg font-black">نشانی و اطلاعات بیشتر</h2>

            <div className="space-y-4">
              <address className="rounded-2xl bg-white/10 p-4 not-italic">
                <div className="mb-3 flex items-center gap-3">
                  <div className="rounded-2xl bg-white/10 p-3">
                    <MapPin size={20} aria-hidden="true" />
                  </div>
                  <p className="text-sm font-bold text-white/80">آدرس</p>
                </div>

                <p className="text-sm leading-8 text-white/90 md:text-base">
                  بناب، عسگر آباد، بن‌بست نریمانی، پلاک 109
                </p>
              </address>

              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-sm font-bold text-white/80">یادداشت</p>
                <p className="mt-2 text-sm leading-8 text-white/90">
                  برای ارتباط سریع‌تر، بهتر است هنگام تماس موضوع درخواست یا نوع
                  پیگیری خود را به‌صورت کوتاه اعلام کنید.
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-sm font-bold text-white/80">راه ارتباط سریع</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  <a
                    href="tel:09190555510"
                    className="rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-900 transition hover:bg-slate-100"
                  >
                    تماس مستقیم
                  </a>
                  <a
                    href="mailto:darkhastyab@gmail.com"
                    className="rounded-full border border-white/20 bg-transparent px-4 py-2 text-sm font-bold text-white transition hover:bg-white/10"
                  >
                    ارسال ایمیل
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
