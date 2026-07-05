"use client";

export default function RequestDescription({ description }) {
  return (
    <div className="mt-6 rounded-3xl border border-slate-100 bg-slate-50/60 p-5">
      <h2 className="mb-3 text-sm font-black text-slate-800">
        توضیحات درخواست
      </h2>
      <p className="text-sm leading-8 text-slate-600">
        {description || "توضیحی ثبت نشده است."}
      </p>
    </div>
  );
}
