import SearchPage from "./SearchResults";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_URL ||
  "http://localhost:5000/api";

function normalizeParam(value) {
  if (Array.isArray(value)) return value[0] || "";
  return value || "";
}

function buildPageTitle(categoryName, provinceName) {
  if (categoryName && provinceName) {
    return `درخواست های ${categoryName} در ${provinceName} | درخواست‌یاب`;
  }

  if (categoryName) {
    return `درخواست های ${categoryName} | درخواست‌یاب`;
  }

  if (provinceName) {
    return `درخواست های ${provinceName} | درخواست‌یاب`;
  }

  return "درخواست های خرید | درخواست‌یاب";
}

function buildDescription(categoryName, provinceName) {
  if (categoryName && provinceName) {
    return `مشاهده درخواست های ${categoryName} در ${provinceName}، بررسی جزئیات درخواست‌ها و ارتباط با خریداران در درخواست‌یاب.`;
  }

  if (categoryName) {
    return `مشاهده درخواست های ${categoryName} و ارتباط با خریداران در درخواست‌یاب.`;
  }

  if (provinceName) {
    return `مشاهده درخواست های خرید در ${provinceName} و ارتباط با خریداران در درخواست‌یاب.`;
  }

  return "مشاهده درخواست های خرید و ارتباط مستقیم با خریداران در درخواست‌یاب.";
}

async function fetchFilterMeta(categoryId, provinceId) {
  let categoryName = "";
  let provinceName = "";

  try {
    const params = new URLSearchParams();
    if (categoryId) params.set("category", categoryId);
    if (provinceId) params.set("province", provinceId);

    if (!params.toString()) {
      return { categoryName: "", provinceName: "" };
    }

    const res = await fetch(`${API_BASE}/purchase-requests?${params.toString()}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return { categoryName: "", provinceName: "" };
    }

    const data = await res.json();

    categoryName = data?.activeCategoryName || "";
    provinceName = data?.activeProvinceName || "";
  } catch (error) {
    console.error("Metadata fetch error:", error);
  }

  return { categoryName, provinceName };
}

export async function generateMetadata({ searchParams }) {
  const resolvedSearchParams = await searchParams;

  const categoryId = normalizeParam(resolvedSearchParams?.category);
  const provinceId = normalizeParam(resolvedSearchParams?.province);

  const { categoryName, provinceName } = await fetchFilterMeta(
    categoryId,
    provinceId
  );

  const title = buildPageTitle(categoryName, provinceName);
  const description = buildDescription(categoryName, provinceName);

  const query = new URLSearchParams();
  if (categoryId) query.set("category", categoryId);
  if (provinceId) query.set("province", provinceId);

  const canonical = `/filter${query.toString() ? `?${query.toString()}` : ""}`;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title,
      description,
      type: "website",
      locale: "fa_IR",
      url: canonical,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default function Page() {
  return <SearchPage />;
}
