import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Script from "next/script";
import SupplierHeader from "../../../components/common/SupplierHeader";
import SupplierOfferCard from "../../../components/common/SupplierOfferCard";

// تنظیم زمان کش کردن صفحه به مدت ۵ دقیقه (اختیاری - ۳۰۰ ثانیه)
export const revalidate = 300;

// تابع دریافت اطلاعات تامین‌کننده در سرور
async function fetchSupplierData(id) {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || process.env.API_URL}/supplier-profile/${id}`,
      {
        method: "GET",
        headers: {
          Cookie: cookieHeader,
        },
        cache: "no-store", // جهت اطمینان از به‌روز بودن وضعیت دسترسی تماس کاربر (credentials: "include" معادل سروری)
      }
    );

    if (!res.ok) return null;

    const data = await res.json();
    return data.supplier || null;
  } catch (error) {
    console.error("Error fetching supplier data on server:", error);
    return null;
  }
}

// تولید خودکار متادیتا داینامیک برای موتورهای جستجو (SEO Title, Description, Canonical)
export async function generateMetadata({ params }) {
  const { id } = await params;
  const supplier = await fetchSupplierData(id);

  if (!supplier) {
    return {
      title: "تامین‌کننده یافت نشد | درخواستیاب",
      robots: { index: false, follow: false },
    };
  }

  const companyName = supplier.profile?.companyName || supplier.name;
  const resumeText = supplier.profile?.resume || supplier.resume || "";
  const cleanDescription = resumeText
    ? resumeText.slice(0, 155).replace(/\r?\n|\r/g, " ") + "..."
    : `مشخصات، اطلاعات تماس مستقیم، رزومه کاری و لیست پیشنهادهای فعال تامین‌کننده صنعتی ${companyName} در سامانه درخواستیاب.`;

  return {
    title: `پروفایل تامین‌کننده ${companyName} | درخواستیاب`,
    description: cleanDescription,
    alternates: {
      canonical: `https://darkhastyab.com/supplier/${id}`, // آدرس دامنه اصلی خود را جایگزین کنید
    },
    openGraph: {
      title: `پروفایل تامین‌کننده ${companyName} | درخواستیاب`,
      description: cleanDescription,
      type: "profile",
      locale: "fa_IR",
      url: `https://darkhastyab.com/supplier/${id}`,
    },
  };
}

export default async function SupplierPage({ params }) {
  const { id } = await params;
  const supplier = await fetchSupplierData(id);

  if (!supplier) {
    notFound();
  }

  // داده‌های ساختاریافته گوگل برای نمایش ستاره‌ها و اطلاعات شرکت در نتایج سرچ
  const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization", // یا "Person" اگر تأمین‌کننده شخص حقیقی است
  "@id": `https://darkhastyab.com/supplier/${id}#organization`,
  "name": supplier.profile?.companyName || supplier.name, // نام تأمین‌کننده
  "description": supplier.profile?.resume || supplier.resume || "تأمین‌کننده رسمی در درخواستیاب", // رزومه به عنوان توضیحات رسمی
  "url": `https://darkhastyab.com/supplier/${id}`,
  "logo": supplier.profile?.avatarUrl
    ? `${process.env.NEXT_PUBLIC_AVATAR_URL}${supplier.profile.avatarUrl}`
    : undefined,
  // ... سایر فیلدها (آدرس و ریتینگ)
  ...(supplier.rating?.count > 0 && {
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": supplier.rating.avg,
      "reviewCount": supplier.rating.count,
      "bestRating": "5",
      "worstRating": "1",
    },
  }),
};

  return (
    <div className="min-h-screen bg-slate-50">
      {/* تزریق Schema.org Structured Data */}
      <Script
        id="supplier-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-5xl mx-auto px-4 py-10">
        <SupplierHeader supplier={supplier} />

        {(supplier.profile?.resume || supplier.resume) && (
          <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-lg font-bold text-slate-800">رزومه</h2>
            <p className="whitespace-pre-line leading-8 text-slate-600">
              {supplier.profile?.resume || supplier.resume}
            </p>
          </div>
        )}

        <div className="mt-8">
          <h2 className="font-bold text-lg mb-4 text-slate-800">
            آخرین پیشنهادها
          </h2>

          <div className="space-y-3">
            {supplier.offers?.length > 0 ? (
              supplier.offers.map((offer) => (
                <SupplierOfferCard
                  key={offer.id}
                  offer={offer}
                  supplier={supplier}
                />
              ))
            ) : (
              <div className="text-center py-8 text-slate-500 bg-white rounded-xl border border-slate-100">
                هیچ پیشنهادی توسط این تامین‌کننده ثبت نشده است.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
