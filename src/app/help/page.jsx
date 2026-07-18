import {
  UserPlus,
  FilePlus2,
  Factory,
  BadgeCheck,
  Phone,
  Sparkles,
} from "lucide-react";

export const metadata = {
  title: "راهنمای استفاده از پلتفرم درخواست یاب",
  description:
    "راهنمای کامل استفاده از درخواست یاب؛ از ثبت‌نام و ثبت درخواست خرید تا تأمین‌کننده شدن، ارسال پیشنهاد قیمت و دریافت پیشنهاد از تأمین‌کنندگان.",
  keywords: [
    "راهنمای درخواست یاب",
    "ثبت درخواست خرید",
    "دریافت پیشنهاد قیمت",
    "تأمین‌کننده",
    "خرید عمده",
    "بازار B2B",
    "ثبت‌نام تأمین‌کننده",
  ],
  alternates: {
    canonical: "https://darkhastyab.com/guide",
    languages: {
      "fa-IR": "https://darkhastyab.com/guide",
    },
  },
  openGraph: {
    type: "website",
    locale: "fa_IR",
    url: "https://darkhastyab.com/guide",
    siteName: "درخواست یاب",
    title: "راهنمای استفاده از پلتفرم درخواست یاب",
    description:
      "آموزش ثبت درخواست خرید، دریافت پیشنهاد قیمت و ثبت‌نام به‌عنوان تأمین‌کننده در درخواست یاب.",
  },
  twitter: {
    card: "summary",
    title: "راهنمای استفاده از پلتفرم درخواست یاب",
    description:
      "آموزش ثبت درخواست خرید، دریافت پیشنهاد قیمت و تأمین‌کننده شدن در درخواست یاب.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "راهنمای استفاده از پلتفرم درخواست یاب",
  description:
    "راهنمای ثبت‌نام، ثبت درخواست خرید، تأمین‌کننده شدن و ارسال پیشنهاد قیمت در درخواست یاب.",
  inLanguage: "fa-IR",
  url: "https://darkhastyab.com/guide",
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "ثبت‌نام یا ورود",
      text: "شماره موبایل خود را وارد کنید، کد یکبار مصرف را دریافت کنید و وارد پنل کاربری شوید.",
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "ثبت درخواست خرید",
      text: "عنوان کالا یا خدمت، توضیحات، تصاویر و مشخصات موردنیاز را وارد کرده و درخواست خرید خود را منتشر کنید.",
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "درخواست تأمین‌کننده شدن",
      text: "اطلاعات کسب‌وکار خود را ثبت کنید تا پس از تأیید، دسترسی تأمین‌کننده برای شما فعال شود.",
    },
    {
      "@type": "HowToStep",
      position: 4,
      name: "ثبت پیشنهاد قیمت",
      text: "تأمین‌کنندگان می‌توانند قیمت، شرایط فروش، توضیحات و فایل فنی خود را برای درخواست‌های خرید ارسال کنند.",
    },
  ],
};

export default function GuidePage() {
  return (
    <main
      className="mx-auto max-w-4xl px-5 py-16 space-y-20"
      dir="rtl"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />

      {/* هدر صفحه */}
      <header className="text-center space-y-4">
        <h1 className="text-4xl font-black text-slate-800">
          راهنمای استفاده از پلتفرم
        </h1>

        <p className="text-slate-500 text-sm leading-relaxed max-w-md mx-auto">
          در این صفحه تمام مراحل استفاده از پلتفرم (از ثبت‌نام تا دریافت
          پیشنهاد قیمت) را به صورت کامل و تصویری مرور می‌کنیم.
        </p>
      </header>

      {/* بخش ۱ - معرفی */}
      <Section
        icon={<Sparkles size={32} className="text-cyan-600" />}
        title="معرفی پلتفرم"
        content="این پلتفرم خریداران را به تأمین‌کنندگان واقعی کالا و خدمات متصل می‌کند. شما می‌توانید درخواست خرید ثبت کنید، پیشنهاد قیمت بگیرید، یا به عنوان تأمین‌کننده ثبت‌نام کرده و مشتری جذب کنید."
      />

      {/* بخش ۲ - ثبت‌نام */}
      <Section
        icon={<UserPlus size={32} className="text-cyan-600" />}
        title="مرحله ۱: ثبت‌نام / ورود"
        content={
          <>
            <p>برای ورود فقط به یک شماره موبایل نیاز دارید:</p>

            <ul className="list-disc pr-5 space-y-1 text-slate-600">
              <li>شماره موبایل خود را وارد کنید</li>
              <li>کد یکبار مصرف (OTP) برای شما ارسال می‌شود</li>
              <li>پس از تایید وارد پنل کاربری می‌شوید</li>
            </ul>
          </>
        }
      />

      {/* بخش ۳ - ثبت درخواست */}
      <Section
        icon={<FilePlus2 size={32} className="text-cyan-600" />}
        title="مرحله ۲: ثبت درخواست خرید"
        content={
          <>
            <p>اگر خریدار هستید:</p>

            <ul className="list-disc pr-5 space-y-1 text-slate-600">
              <li>به صفحه «ثبت درخواست» بروید</li>
              <li>عنوان کالا/خدمت را وارد کنید</li>
              <li>عکس، توضیحات، فایل یا مشخصات را اضافه کنید</li>
              <li>درخواست شما منتشر می‌شود و تامین‌کنندگان آن را می‌بینند</li>
            </ul>
          </>
        }
      />

      {/* بخش ۴ - تأمین‌کننده شدن */}
      <Section
        icon={<Factory size={32} className="text-cyan-600" />}
        title="مرحله ۳: درخواست تأمین‌کننده شدن"
        content={
          <>
            <p>اگر تولیدکننده یا فروشنده هستید:</p>

            <ul className="list-disc pr-5 space-y-1 text-slate-600">
              <li>به بخش «تأمین‌کننده شوید» بروید</li>
              <li>اطلاعات کسب‌وکار خود را ثبت کنید</li>
              <li>پس از تایید، دسترسی به پنل تامین‌کنندگان فعال می‌شود</li>
            </ul>
          </>
        }
      />

      {/* بخش ۵ - ثبت پیشنهاد */}
      <Section
        icon={<BadgeCheck size={32} className="text-cyan-600" />}
        title="مرحله ۴: ثبت پیشنهاد قیمت"
        content={
          <>
            <p>تامین‌کنندگان می‌توانند روی درخواست‌ها پیشنهاد ارسال کنند:</p>

            <ul className="list-disc pr-5 space-y-1 text-slate-600">
              <li>قیمت، شرایط، توضیحات یا فایل فنی ارسال کنید</li>
              <li>خریدار پیشنهاد شما را می‌بیند و تصمیم می‌گیرد</li>
              <li>با افزایش اعتبار حساب می‌توانید اطلاعات تماس را ببینید</li>
            </ul>
          </>
        }
      />

      {/* بخش ۶ - اطلاعات تماس */}
      <section
        className="rounded-3xl border border-slate-200 bg-white/70 backdrop-blur-lg p-10 shadow-xl space-y-5"
        aria-labelledby="support-title"
      >
        <div className="flex items-center gap-3">
          <Phone
            className="text-cyan-600"
            size={30}
            aria-hidden="true"
          />

          <h2
            id="support-title"
            className="text-2xl font-extrabold text-slate-800"
          >
            اطلاعات تماس پشتیبانی
          </h2>
        </div>

        <p className="text-slate-600 text-sm leading-relaxed">
          هر زمان نیاز به کمک داشتید، تیم پشتیبانی کنار شماست.
        </p>

        <address className="space-y-2 text-slate-700 text-sm not-italic">
          <p>
            • موبایل: <strong>09190555510</strong>
          </p>

          <p>
            • واتساپ: <strong>09190555510</strong>
          </p>

          <p>
            • ایمیل: <strong>darkhastyab@gmail.com</strong>
          </p>
        </address>
      </section>
    </main>
  );
}

function Section({ icon, title, content }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white/70 backdrop-blur-xl p-10 shadow-xl space-y-6 transition-all hover:shadow-2xl hover:-translate-y-1">
      <div className="flex items-center gap-4">
        <span aria-hidden="true">{icon}</span>

        <h2 className="text-2xl font-extrabold text-slate-800">
          {title}
        </h2>
      </div>

      <div className="text-slate-600 text-sm leading-7">
        {content}
      </div>
    </section>
  );
}
