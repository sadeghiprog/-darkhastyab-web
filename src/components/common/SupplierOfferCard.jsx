import Link from "next/link";

const baseAvatar = process.env.NEXT_PUBLIC_AVATAR_URL || "";

function StarRating({ rating = 0 }) {
  const stars = Array.from({ length: 5 }, (_, i) => i + 1);

  return (
    <div className="flex items-center gap-0.5">
      {stars.map((star) => (
        <svg
          key={star}
          viewBox="0 0 20 20"
          className={`h-4 w-4 ${
            rating >= star
              ? "fill-amber-400 text-amber-400"
              : rating >= star - 0.5
              ? "fill-amber-300 text-amber-300"
              : "fill-slate-200 text-slate-200"
          }`}
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.955a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.955c.3.921-.755 1.688-1.538 1.118l-3.37-2.448a1 1 0 00-1.176 0l-3.37 2.448c-.783.57-1.838-.197-1.538-1.118l1.287-3.955a1 1 0 00-.364-1.118L2.075 9.382c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.274-3.955z" />
        </svg>
      ))}
    </div>
  );
}

export default function SupplierOfferCard({ offer, supplier: supplierProp }) {
  const supplier = supplierProp ?? offer?.supplier ?? null;

  const supplierName =
    supplier?.profile?.companyName || supplier?.name || "تأمین‌کننده";

  const supplierAvatar = supplier?.profile?.avatarUrl
    ? `${baseAvatar}${supplier.profile.avatarUrl}`
    : `${baseAvatar}/uploads/avatars/avatar.webp`;

  const supplierRating = Number(supplier?.rating?.avg ?? supplier?.avgRating ?? 0);

  const requestTitle = offer?.purchaseRequest?.title || "درخواست بدون عنوان";
  const requestSlug = offer?.purchaseRequest?.slug;
  const quantity = Number(offer?.quantity ?? 0);
  const price = Number(offer?.price ?? 0);
  const unitName = offer?.unit?.name || "عدد";

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-200 hover:shadow-lg sm:p-5">
      <div className="absolute inset-y-0 right-0 w-1 bg-gradient-to-b from-cyan-500 to-blue-500" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <Link
            href={supplier?.id ? `/suppliers/${supplier.id}` : "#"}
            className="relative shrink-0"
          >
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 opacity-15 blur-sm transition group-hover:opacity-30" />
            <img
              src={supplierAvatar}
              alt={supplierName}
              className="relative h-14 w-14 rounded-2xl border border-slate-100 bg-slate-50 object-cover shadow-sm"
            />
          </Link>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              {requestSlug ? (
                <Link
                  href={`/request/${requestSlug}`}
                  className="line-clamp-1 font-bold text-slate-800 transition-colors hover:text-cyan-600"
                >
                  {requestTitle}
                </Link>
              ) : (
                <span className="line-clamp-1 font-bold text-slate-800">
                  {requestTitle}
                </span>
              )}
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
              {supplier?.id ? (
                <Link
                  href={`/suppliers/${supplier.id}`}
                  className="font-medium text-slate-600 transition-colors hover:text-cyan-600"
                >
                  {supplierName}
                </Link>
              ) : (
                <span className="font-medium text-slate-600">{supplierName}</span>
              )}

              <span className="text-slate-300">•</span>

              <div className="flex items-center gap-1">
                <StarRating rating={supplierRating} />
                <span className="text-xs font-medium text-slate-400">
                  {supplierRating > 0 ? supplierRating.toFixed(1) : "بدون امتیاز"}
                </span>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                <svg
                  className="h-3.5 w-3.5 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
                {quantity.toLocaleString()} {unitName}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3 sm:min-w-[170px] sm:flex-col sm:items-end sm:justify-center">
          <div className="text-left sm:text-right">
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black tracking-tight text-slate-900">
                {price.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-slate-400">تومان</span>
            </div>
            <p className="mt-0.5 text-[11px] text-slate-400">
              قیمت پیشنهادی
            </p>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-100 sm:hidden">
            <svg
              className="h-5 w-5 text-cyan-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8c-1.657 0-3 1.12-3 2.5S10.343 13 12 13s3 1.12 3 2.5S13.657 18 12 18m0-10V6m0 12v-2m-4.243-1.757a6 6 0 108.486-8.486 6 6 0 00-8.486 8.486z"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
