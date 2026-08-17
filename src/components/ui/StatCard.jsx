export default function StatCard({ title, value, icon, hint }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-black text-slate-800">{value}</p>
          {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
        </div>
        {icon && (
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 text-lg">
            {icon}
          </span>
        )}
      </div>
    </div>
  );
}
