import { notFound } from "next/navigation";
import RequestDetailsContent from "./RequestDetailsContent";
import { API_BASE } from "./utils/constants";

const DEFAULT_OG_IMAGE = "https://darkhastyab.com/images/og-default.jpg";
const DEFAULT_PRODUCT_IMAGE =
  "https://darkhastyab.com/uploads/purchase-requests/thumbs/no-image.webp";

// تابع کمکی برای ساخت آدرس کامل تصویر برای سئو
function getFullImageUrl(imagePath) {
  if (!imagePath) return null;
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  const avatarBase = (process.env.NEXT_PUBLIC_AVATAR_URL || "https://darkhastyab.com").replace(/\/+$/, "");
  const cleanPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  return `${avatarBase}${cleanPath}`;
}

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

// تولید متادیتا داینامیک همراه با سئوی تصویر اول
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const request = await getRequestBySlug(slug);

  if (!request) {
    return {
      title: "درخواست موردنظر پیدا نشد | درخواست یاب",
      description: "درخواست موردنظر پیدا نشد.",
    };
  }

  const title = `${request.title} | درخواست یاب`;
  const description =
    request.description?.replace(/(\r\n|\n|\r)/gm, " ").slice(0, 160) ||
    "جزئیات این درخواست خرید را در درخواست یاب مشاهده کنید.";
  const canonicalUrl = `https://darkhastyab.com/request/${slug}`;

  // استخراج تصویر اول جهت ایندکس در گوگل و شبکه‌های اجتماعی
  const firstImage = request.images?.[0];
  const primaryImageUrl = getFullImageUrl(firstImage?.url) || DEFAULT_OG_IMAGE;

  const ogImages = [
    {
      url: primaryImageUrl,
      width: 1200,
      height: 630,
      alt: request.title,
    },
  ];

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
      siteName: "Darkhastyab | درخواست یاب",
      locale: "fa_IR",
      type: "article",
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImages.map((img) => img.url),
    },
  };
}

// کامپوننت اصلی صفحه
export default async function RequestDetailsPage({ params }) {
  const { slug } = await params;
  const request = await getRequestBySlug(slug);

  if (!request) {
    notFound();
  }

  // ایجاد Structured Data (JSON-LD) برای ایندکس اختصاصی تصویر و صفحه در گوگل
  const firstImage = request.images?.[0];
  // همیشه یک تصویر معتبر و مطلق برمی‌گردونیم؛ حتی وقتی درخواست عکس نداره
  const primaryImageUrl = getFullImageUrl(firstImage?.url) || DEFAULT_PRODUCT_IMAGE;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: request.title,
    description: request.description || request.title,
    image: [primaryImageUrl],
    offers: {
      "@type": "Offer",
      priceCurrency: "IRR",
      price: request.targetPrice || "0",
      availability: "https://schema.org/InStock",
      url: `https://darkhastyab.com/request/${slug}`,
    },
  };

  return (
    <>
      {/* درج داده‌های ساختاریافته برای ربات‌های گوگل */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <RequestDetailsContent slug={slug} initialRequest={request} />
    </>
  );
}