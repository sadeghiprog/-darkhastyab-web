import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Script from "next/script";
import SupplierHeader from "../../../components/common/SupplierHeader";
import SupplierOfferCard from "../../../components/common/SupplierOfferCard";

// تنظیم زمان کش کردن صفحه به مدت ۵ دقیقه
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
        cache: "no-store",
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

// تولید خودکار متادیتا داینامیک برای موتورهای جستجو
export async function generateMetadata({ params }) {
  const { id } = await params;
  const supplier = await fetchSupplierData(id);

  if (!supplier) {
    return {
      title: "تامین‌کننده یافت نشد | درخواست یاب",
      robots: { index: false, follow: false },
    };
  }

  const companyName =  supplier.name || "صنعتی";
  const activity = supplier.profile?.activityField || "صنعتی";
  const resumeText = supplier.profile?.resume || supplier.resume || "";
  
  // ساخت عنوان سئو مطابق خواسته شما: تامین‌کننده [حوزه فعالیت] [نام] | درخواستیاب
  const seoTitle = `تامین‌کننده ${activity} ${companyName} | درخواست یاب`;

  const cleanDescription = resumeText
    ? resumeText.slice(0, 155).replace(/\r?\n|\r/g, " ") + "..."
    : `مشخصات، اطلاعات تماس مستقیم، حوزه فعالیت ${activity}، رزومه کاری و لیست پیشنهادهای فعال تامین‌کننده ${companyName} در سامانه درخواست یاب.`;

  return {
    title: seoTitle,
    description: cleanDescription,
    alternates: {
      canonical: `https://darkhastyab.com/supplier/${id}`,
    },
    openGraph: {
      title: seoTitle,
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

  const companyName = supplier.profile?.companyName || supplier.name;
  const activity = supplier.profile?.activityField;

  // داده‌های ساختاریافته گوگل برای نمایش ستاره‌ها و اطلاعات شرکت در نتایج سرچ
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `https://darkhastyab.com/supplier/${id}#organization`,
    "name": companyName,
    "description": supplier.profile?.resume || supplier.resume || `تأمین‌کننده حوزه ${activity || "صنعتی"} در درخواست یاب`,
    "url": `https://darkhastyab.com/supplier/${id}`,
    "logo": supplier.profile?.avatarUrl
      ? `${process.env.NEXT_PUBLIC_AVATAR_URL}${supplier.profile.avatarUrl}`
      : undefined,
    ...(activity && { "knowsAbout": activity }),
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
    <div className="min-h-screen bg-slate-50" dir="rtl">
      {/* تزریق Schema.org Structured Data */}
      <Script
        id="supplier-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-5xl mx-auto px-4 py-10">
        
        {/* هدر تامین کننده */}
        <SupplierHeader supplier={supplier} />

        {/* نمایش حوزه فعالیت دقیقا زیر هدر اصلی (یا به صورت یک بخش ظریف مجزا) */}
        

        {/* رزومه */}
        {(supplier.profile?.resume || supplier.resume) && (
          <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-lg font-bold text-slate-800">رزومه</h2>
            <p className="whitespace-pre-line leading-8 text-slate-600">
              {supplier.profile?.resume || supplier.resume}
            </p>
          </div>
        )}

        {/* آخرین پیشنهادها */}
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
