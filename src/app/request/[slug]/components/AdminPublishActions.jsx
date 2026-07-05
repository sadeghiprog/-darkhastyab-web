"use client";

export default function AdminPublishActions({
  adminNote,
  setAdminNote,
  updatingStatus,
  updatePublishStatus,
}) {
  return (
    <div className="mt-6 rounded-3xl border border-cyan-100 bg-cyan-50/30 p-5">
      <textarea
        value={adminNote}
        onChange={(e) => setAdminNote(e.target.value)}
        className="w-full rounded-2xl border border-slate-200 p-4 text-sm"
        placeholder="توضیحات وضعیت..."
      />

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          onClick={() => updatePublishStatus("PUBLISHED")}
          disabled={updatingStatus}
          className="rounded-2xl bg-emerald-500 px-4 py-2 text-xs font-black text-white disabled:opacity-70"
        >
          انتشار
        </button>

        <button
          onClick={() => updatePublishStatus("UNDER_REVIEW")}
          disabled={updatingStatus}
          className="rounded-2xl bg-amber-500 px-4 py-2 text-xs font-black text-white disabled:opacity-70"
        >
          لغو انتشار
        </button>

        <button
          onClick={() => updatePublishStatus("NEEDS_EDIT")}
          disabled={updatingStatus}
          className="rounded-2xl bg-orange-500 px-4 py-2 text-xs font-black text-white disabled:opacity-70"
        >
          نیاز به ویرایش
        </button>
      </div>
    </div>
  );
}
