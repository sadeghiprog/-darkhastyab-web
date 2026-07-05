"use client";

export default function DetailItem({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition hover:border-cyan-100 hover:bg-cyan-50/30">
      <div className="mb-2 flex items-center gap-2 text-[11px] font-bold text-slate-400">
        {Icon && <Icon size={15} className="text-cyan-600" />}
        <span>{label}</span>
      </div>
      <div className="truncate text-sm font-black text-slate-800">
        {value || "—"}
      </div>
    </div>
  );
}
