export default function EmptyState({ title, description }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-16 text-center">
      <span className="text-4xl">📭</span>
      <p className="mt-3 text-sm font-bold text-slate-600">{title}</p>
      {description && <p className="mt-1 text-xs text-slate-400">{description}</p>}
    </div>
  );
}
