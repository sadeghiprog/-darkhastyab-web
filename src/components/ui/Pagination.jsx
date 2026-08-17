export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className="mt-6 flex items-center justify-center gap-2">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 disabled:opacity-40 hover:bg-slate-50"
      >
        قبلی
      </button>
      <span className="px-3 text-sm font-bold text-slate-700">
        صفحه {page} از {totalPages}
      </span>
      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 disabled:opacity-40 hover:bg-slate-50"
      >
        بعدی
      </button>
    </div>
  );
}
