import { notFound } from "next/navigation";
import RequestDetailsContent from "./RequestDetailsContent";
import { API_BASE } from "./utils/constants";

// تابع کمکی برای واکشی داده‌ها در سمت سرور
async function getRequestBySlug(slug) {
  try {
    const res = await fetch(`${API_BASE}/purchase-requests/${slug}`, {
      cache: "no-store",
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data?.request || null;
  } catch (error) {
    console.error("Fetch Error:", error);
    return null;
  }
}

// تولید متادیتا با رعایت Promise بودن params
export async function generateMetadata({ params }) {
  // در Next.js جدید باید params را await کنید
  const { slug } = await params; 
  
  const request = await getRequestBySlug(slug);

  if (!request) {
    return {
      title: "درخواست موردنظر پیدا نشد | درخواست یاب",
      description: "درخواست موردنظر پیدا نشد.",
    };
  }

  const title = request.title || "جزئیات درخواست";
  const description =
    request.description?.slice(0, 160) ||
    "جزئیات این درخواست را در درخواست یاب مشاهده کنید.";

  return {
    title,
    description,
    alternates: {
      canonical: `https://darkhastyab.com/request/${slug}`, // آدرس کامل سئو بهتری دارد
    },
    openGraph: {
      title,
      description,
      url: `/request/${slug}`,
      siteName: "Darkhastyab",
      locale: "fa_IR",
      type: "article",
    },
  };
}

// کامپوننت اصلی صفحه
export default async function RequestDetailsPage({ params }) {
  // رفع خطای: params is a Promise
  const { slug } = await params;

  const request = await getRequestBySlug(slug);

  if (!request) {
    notFound();
  }

  return <RequestDetailsContent slug={slug} initialRequest={request} />;
}
