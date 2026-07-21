import SearchPage from "./SearchResults";

const API_BASE =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.SITE_URL ||
  "https://darkhastyab.com"
).replace(/\/$/, "");

function normalizeParam(value) {
  if (Array.isArray(value)) {
    return value[0] || "";
  }
  return value || "";
}

function normalizeSearchParams(searchParams) {
  const params = new URLSearchParams();

  if (!searchParams) {
    return params;
  }

  Object.entries(searchParams).forEach(([key, value]) => {
    const normalizedValue = normalizeParam(value);
    if (normalizedValue && normalizedValue.trim() !== "") {
      params.set(key, normalizedValue);
    }
  });

  return params;
}

function buildPageTitle(categoryName, provinceName) {
  if (categoryName && provinceName) {
    return `درخواست های ${categoryName} در ${provinceName} | درخواست یاب`;
  }
  if (categoryName) {
    return `درخواست های ${categoryName} | درخواست یاب`;
  }
  if (provinceName) {
    return `درخواست های خرید در ${provinceName} | درخواست یاب`;
  }
  return "درخواست های خرید | درخواست یاب";
}

function buildHeading(categoryName, provinceName) {
  if (categoryName && provinceName) {
    return `درخواست های ${categoryName} در ${provinceName}`;
  }
  if (categoryName) {
    return `درخواست های ${categoryName}`;
  }
  if (provinceName) {
    return `درخواست های خرید در ${provinceName}`;
  }
  return "درخواست های خرید";
}

function buildDescription(categoryName, provinceName) {
  if (categoryName && provinceName) {
    return `مشاهده درخواست های ${categoryName} در ${provinceName}، بررسی جزئیات درخواست‌ها و ارتباط با خریداران در درخواست یاب.`;
  }
  if (categoryName) {
    return `مشاهده درخواست های ${categoryName}، بررسی جزئیات درخواست‌ها و ارتباط با خریداران در درخواست یاب.`;
  }
  if (provinceName) {
    return `مشاهده درخواست های خرید در ${provinceName} و ارتباط با خریداران در درخواست یاب.`;
  }
  return "مشاهده درخواست های خرید و ارتباط مستقیم با خریداران در درخواست یاب.";
}

function getRequests(data) {
  if (Array.isArray(data?.requests)) {
    return data.requests;
  }
  if (Array.isArray(data?.data)) {
    return data.data;
  }
  return [];
}

function getTotal(data, requests) {
  const candidates = [
    data?.total,
    data?.count,
    data?.totalCount,
    data?.pagination?.total,
    data?.pagination?.totalCount,
    data?.meta?.total,
    data?.meta?.totalCount,
  ];

  const total = candidates.find(
    (value) =>
      value !== null &&
      value !== undefined &&
      value !== "" &&
      Number.isFinite(Number(value))
  );

  return total !== undefined ? Number(total) : requests.length;
}

// تغییر کلیدی: استخراج داده‌ها بر اساس پارامترهای داینامیک ارسالی
async function fetchFilteredRequests(searchParams) {
  const params = normalizeSearchParams(searchParams);

  // اگر صفحه مشخصی ارسال نشده بود، پیش‌فرض صفحه ۱ با لیمیت ۲۰ است
  if (!params.has("page")) {
    params.set("page", "1");
  }
  if (!params.has("limit")) {
    params.set("limit", "20");
  }

  try {
    const response = await fetch(
      `${API_BASE}/purchase-requests?${params.toString()}`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(
        `Filtered requests fetch failed with status ${response.status}`
      );
    }

    const data = await response.json();
    const requests = getRequests(data);

    return {
      requests,
      total: getTotal(data, requests),
      activeCategoryName: data?.activeCategoryName || "",
      activeProvinceName: data?.activeProvinceName || "",
    };
  } catch (error) {
    console.error("Server filtered requests error:", error);

    return {
      requests: [],
      total: 0,
      activeCategoryName: "",
      activeProvinceName: "",
    };
  }
}

async function fetchLatestRequests() {
  try {
    const params = new URLSearchParams({
      page: "1",
      limit: "3",
    });

    const response = await fetch(
      `${API_BASE}/purchase-requests?${params.toString()}`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(
        `Latest requests fetch failed with status ${response.status}`
      );
    }

    const data = await response.json();
    return getRequests(data);
  } catch (error) {
    console.error("Server latest requests error:", error);
    return [];
  }
}

function buildCanonical(searchParams) {
  const params = new URLSearchParams();

  const categoryId = normalizeParam(searchParams?.category);
  const provinceId = normalizeParam(searchParams?.province);
  const page = normalizeParam(searchParams?.page);

  if (categoryId) {
    params.set("category", categoryId);
  }
  if (provinceId) {
    params.set("province", provinceId);
  }
  // برای حفظ ساختار سئوی صفحات صفحه‌بندی شده، مقدار صفحه را نیز به آدرس کانونی اضافه می‌کنیم
  if (page && page !== "1") {
    params.set("page", page);
  }

  const queryString = params.toString();
  return `${SITE_URL}/filter${queryString ? `?${queryString}` : ""}`;
}

export async function generateMetadata({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const filterData = await fetchFilteredRequests(resolvedSearchParams);

  const title = buildPageTitle(
    filterData.activeCategoryName,
    filterData.activeProvinceName
  );

  const description = buildDescription(
    filterData.activeCategoryName,
    filterData.activeProvinceName
  );

  const canonical = buildCanonical(resolvedSearchParams);
  const hasResults = filterData.total > 0;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    robots: {
      index: hasResults,
      follow: true,
      googleBot: {
        index: hasResults,
        follow: true,
      },
    },
    openGraph: {
      title,
      description,
      type: "website",
      locale: "fa_IR",
      url: canonical,
      siteName: "درخواست یاب",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function Page({ searchParams }) {
  const resolvedSearchParams = await searchParams;

  const [filterData, latestRequests] = await Promise.all([
    fetchFilteredRequests(resolvedSearchParams),
    fetchLatestRequests(),
  ]);

  const heading = buildHeading(
    filterData.activeCategoryName,
    filterData.activeProvinceName
  );

  const description = buildDescription(
    filterData.activeCategoryName,
    filterData.activeProvinceName
  );

  const canonical = buildCanonical(resolvedSearchParams);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: heading,
    description,
    url: canonical,
    inLanguage: "fa-IR",
    numberOfItems: filterData.total,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: filterData.total,
      itemListElement: filterData.requests.map((request, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name:
          request?.title ||
          request?.name ||
          `درخواست شماره ${request?.id || index + 1}`,
        url: request?.id
          ? `${SITE_URL}/requests/${request.id}`
          : canonical,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />

      <SearchPage
        initialRequests={filterData.requests}
        initialTotal={filterData.total}
        initialCategoryName={filterData.activeCategoryName}
        initialProvinceName={filterData.activeProvinceName}
        initialLatestRequests={latestRequests}
      />
    </>
  );
}
