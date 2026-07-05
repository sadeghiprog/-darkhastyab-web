export function formatPrice(price) {
  if (price == null) return "—";
  return Number(price).toLocaleString("fa-IR");
}

export function formatDate(dateStr) {
  if (!dateStr) return "—";
  try {
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

export function getPublishStatusLabel(status) {
  if (status === "PUBLISHED") return "منتشر شده";
  if (status === "UNDER_REVIEW") return "در حال بررسی";
  if (status === "NEEDS_EDIT") return "نیاز به ویرایش";
  return "نامشخص";
}

export function getPublishStatusClass(status) {
  if (status === "PUBLISHED") {
    return "border-emerald-100 bg-emerald-50 text-emerald-700";
  }
  if (status === "NEEDS_EDIT") {
    return "border-orange-100 bg-orange-50 text-orange-700";
  }
  return "border-amber-100 bg-amber-50 text-amber-700";
}
