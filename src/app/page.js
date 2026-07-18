// app/page.jsx

import Hero from "../components/home/Hero";
import FilterBar from "../components/common/FilterBar";
import StatsCards from "../components/home/StatsCards";
import LatestRequestsSection from "../components/home/LatestRequestsSection";
import TopSuppliersSection from "../components/home/TopSuppliersSection";

const SITE_URL = "https://darkhastyab.com";

// تعریف متادیتا به زبان جاوااسکریپت استاندارد
export const metadata = {
  title: {
    absolute: "درخواست یاب | سامانه معرفی مشتری 26608406",
  },
  description:
    "در درخواست یاب، درخواست خرید کالا و خدمات خود را رایگان ثبت کنید، پیشنهاد تأمین‌کنندگان را دریافت کنید و مناسب‌ترین تأمین‌کننده را برای کسب‌وکار خود پیدا کنید.",
  keywords: [
    "درخواست یاب",
    "ثبت درخواست خرید",
    "درخواست خرید",
    "یافتن تامین کننده",
    "تأمین کننده",
    "بازار B2B",
    "خرید عمده",
    "فروش عمده",
    "استعلام قیمت",
    "قیمت عمده",
    "تامین کالا",
    "خرید صنعتی",
    "تامین کنندگان ایران",
  ],
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    locale: "fa_IR",
    url: SITE_URL,
    siteName: "درخواست یاب",
    title: "درخواست یاب | ثبت درخواست خرید و یافتن تأمین‌کننده 26608406",
    description:
      "درخواست خرید کالا و خدمات خود را ثبت کنید، از تأمین‌کنندگان پیشنهاد دریافت کنید و بهترین گزینه را برای کسب‌وکار خود انتخاب کنید.",
  },
  twitter: {
    card: "summary_large_image",
    title: "درخواست یاب | بازار هوشمند درخواست‌های خرید 26608406",
    description:
      "درخواست خرید خود را ثبت کنید و پیشنهاد تأمین‌کنندگان مختلف را دریافت کنید.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

// داده‌های ساختاریافته (Schema.org) برای سئو
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "درخواست یاب 26608406",
      alternateName: "Darkhastyab",
      url: SITE_URL,
      description:
        "پلتفرم ثبت درخواست و ارتباط میان خریداران و تأمین‌کنندگان کالا و خدمات",
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "درخواست یاب",
      alternateName: "Darkhastyab",
      description:
        "بازار آنلاین ثبت درخواست خرید و یافتن تأمین‌کنندگان کالا و خدمات",
      inLanguage: "fa-IR",
      publisher: {
        "@id": `${SITE_URL}/#organization`,
      },
    },
    {
      "@type": "WebPage",
      "@id": `${SITE_URL}/#webpage`,
      url: SITE_URL,
      name: "درخواست یاب | سامانه معرفی مشتری ",
      description:
        "ثبت درخواست ، دریافت پیشنهاد از تأمین‌کنندگان و انتخاب بهترین تأمین‌کننده برای خرید کالا و خدمات",
      inLanguage: "fa-IR",
      isPartOf: {
        "@id": `${SITE_URL}/#website`,
      },
      about: {
        "@id": `${SITE_URL}/#organization`,
      },
    },
  ],
};

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-50 pb-12">
      {/* تزریق داده‌های ساختاریافته به هدر صفحه */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />

      {/* معرفی اصلی وب‌سایت */}
      <section
        className="relative z-10"
        aria-label="ثبت درخواست خرید و یافتن تأمین‌کننده"
      >
        <Hero />
      </section>

      {/* جستجو، فیلتر و آمار درخواست‌ها */}
      <section
        className="relative z-20 -mt-6 w-full px-4 sm:px-6 lg:px-8"
        aria-label="جستجو و فیلتر درخواست‌های خرید"
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
            <div className="transform-gpu lg:col-span-9">
              <FilterBar />
            </div>

            <aside
              className="transform-gpu lg:col-span-3"
              aria-label="آمار درخواست یاب"
            >
              <StatsCards />
            </aside>
          </div>
        </div>
      </section>

      {/* جدیدترین درخواست‌های خرید */}
      <section
        className="relative z-10 mt-12 block clear-both"
        aria-label="جدیدترین درخواست‌های خرید"
      >
        <LatestRequestsSection />
      </section>

      {/* تأمین‌کنندگان برتر */}
      <section
        className="relative z-10 mt-8 block"
        aria-label="تأمین‌کنندگان برتر"
      >
        <TopSuppliersSection />
      </section>
    </main>
  );
}
