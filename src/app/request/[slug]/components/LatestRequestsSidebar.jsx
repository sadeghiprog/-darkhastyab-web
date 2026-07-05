"use client";

import RequestCard2 from "../../../../components/common/RequestCard2";

export default function LatestRequestsSidebar({
  loadingLatest,
  latestRequests,
}) {
  return (
    <aside className="flex flex-col gap-4 xl:col-span-3">
      <h2 className="text-lg font-black text-slate-800">درخولست های مشابه</h2>

      {loadingLatest ? (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-[150px] animate-pulse rounded-3xl bg-white shadow-sm"
            />
          ))}
        </div>
      ) : latestRequests.length > 0 ? (
        latestRequests.map((req) => <RequestCard2 key={req.id} request={req} />)
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-400">
          درخواستی یافت نشد.
        </div>
      )}
    </aside>
  );
}
