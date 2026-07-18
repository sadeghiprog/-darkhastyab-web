import React from "react";
import RequestCard from "../../components/common/RequestCard";
import RequestCard2 from "../../components/common/RequestCard2";

// دریافت آدرس API از متغیرهای محیطی
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.darkhastyab.com";

// تابع کمکی برای دریافت نتایج جستجو در سمت سرور
async function getSearchResults(query) {
  try {
    const res = await fetch(
      `${API_BASE}/purchase-requests/search?q=${encodeURIComponent(query)}&limit=15`,
      { cache: "no-store" } // عدم ذخیره کش برای داینامیک بودن نتایج جستجو
    );
    if (!res.ok) throw new Error("خطا در دریافت نتایج جستجو");
    const data = await res.json();
    return data.requests || [];
  } catch (error) {
    console.error("Search API Error:", error);
    return [];
  }
}

// تابع کمکی برای دریافت جدیدترین درخواست‌ها در سمت سرور (سایدبار)
async function getLatestRequests() {
  try {
    const res = await fetch(
      `${API_BASE}/purchase-requests?limit=3`,
      { next: { revalidate: 60 } } // کش کردن ۳ مورد سایدبار به مدت ۶۰ ثانیه برای فشار کمتر به دیتابیس
    );
    if (!res.ok) throw new Error("خطا در دریافت جدیدترین درخواست‌ها");
    const data = await res.json();
    return data.requests || [];
  } catch (error) {
    console.error("Latest Requests API Error:", error);
    return [];
  }
}

// تولید متادیتای پویا جهت سئوی قوی در نتایج گوگل
export async function generateMetadata({ searchParams }) {
  const resolvedParams = await searchParams;
  const q = resolvedParams.q || "";

  const title = q 
    ? `درخواست‌های خرید و تامین ${q} | درخواست یاب` 
    : "جستجوی درخواست‌های خرید و استعلام قیمت | درخواست یاب";

  const description = q
    ? `جدیدترین درخواست‌های خرید، تامین و استعلام قیمت مرتبط با "${q}". برای مشاهده جزئیات، اطلاعات تماس و ثبت پیشنهاد کلیک کنید.`
    : "جستجو و فیلتر کردن درخواست‌های خرید و استعلام قیمت کالاها در سراسر ایران در سامانه درخواست یاب.";

  const canonicalUrl = `https://darkhastyab.com/search${q ? `?q=${encodeURIComponent(q)}` : ""}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "درخواست یاب",
      locale: "fa_IR",
      type: "website",
    },
    robots: {
      index: true,
      follow: true,
    }
  };
}

// کامپوننت اصلی صفحه (Server Component)
export default async function SearchPage({ searchParams }) {
  const resolvedParams = await searchParams;
  const q = resolvedParams.q || "";

  // اجرای موازی ریکوئست‌ها در سمت سرور
  const [results, latestRequests] = await Promise.all([
    getSearchResults(q),
    getLatestRequests(),
  ]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8" dir="rtl">
      <div className="mx-auto max-w-[1600px]">
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">
          
          {/* ستون اصلی نتایج */}
          <main className="flex flex-col gap-6 xl:col-span-9">
            <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <div>
                <h1 className="text-2xl font-black text-slate-800">نتایج جستجو</h1>
                <p className="text-slate-500 text-sm mt-1">
                  {q ? `نمایش نتایج برای: "${q}"` : "تمام درخواست‌ها"}
                </p>
              </div>
              <span className="bg-slate-100 text-slate-600 px-4 py-2 rounded-2xl text-sm font-bold">
                {results.length} مورد یافت شد
              </span>
            </div>

            {results.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3">
                {results.map((req) => (
                  <RequestCard key={req.id} request={req} highlight={q}/>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-20 text-center border border-dashed border-slate-300">
                <h2 className="text-slate-600 font-bold text-lg mb-2">موردی یافت نشد</h2>
                <p className="text-slate-400 text-sm">
                  متأسفانه درخواستی برای عبارت &quot;{q}&quot; پیدا نکردیم. می‌توانید درخواست جدیدی ثبت کنید.
                </p>
              </div>
            )}
          </main>

          {/* سایدبار جدیدترین‌ها */}
          <aside className="flex flex-col gap-6 xl:col-span-3">
            <h2 className="text-xl font-black text-slate-800">جدیدترین درخواست‌ها</h2>
            <div className="flex flex-col gap-4">
              {latestRequests.length > 0 ? (
                latestRequests.map((req) => (
                  <RequestCard2 key={req.id} request={req} />
                ))
              ) : (
                <p className="text-slate-400 text-xs">درخواستی موجود نیست.</p>
              )}
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
