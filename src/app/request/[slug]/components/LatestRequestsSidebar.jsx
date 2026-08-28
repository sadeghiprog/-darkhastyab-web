"use client";

import RequestCard2 from "../../../../components/common/RequestCard2";

export default function LatestRequestsSidebar({
  loadingLatest = false,
  latestRequests = [],
  variant = "sidebar",
  title = "درخواست‌های مشابه",
}) {
  const isGrid = variant === "grid";

  return (
    <aside
      dir="rtl"
      className={
        isGrid
          ? "w-full"
          : "flex flex-col gap-4 xl:col-span-3"
      }
    >
      <h2 className="mb-4 text-lg font-black text-slate-800">{title}</h2>

      {loadingLatest ? (
        <div
          className={
            isGrid
              ? "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
              : "flex flex-col gap-4"
          }
        >
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-[150px] animate-pulse rounded-3xl bg-white shadow-sm"
            />
          ))}
        </div>
      ) : latestRequests.length > 0 ? (
        <div
          className={
            isGrid
              ? "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
              : "flex flex-col gap-4"
          }
        >
          {latestRequests.map((request) => (
            <RequestCard2 key={request.id} request={request} />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-400">
          درخواستی یافت نشد.
        </div>
      )}
    </aside>
  );
}
