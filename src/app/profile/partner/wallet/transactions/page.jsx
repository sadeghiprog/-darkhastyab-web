"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "../../../../../lib/api2";
import PageHeader from "../../../../../components/ui/PageHeader";
import EmptyState from "../../../../../components/ui/EmptyState";
import Pagination from "../../../../../components/ui/Pagination";

const TYPE_LABEL = {
  COMMISSION: { text: "پورسانت", color: "text-emerald-600", bg: "bg-emerald-50", sign: "+" },
  WITHDRAWAL: { text: "برداشت", color: "text-red-500", bg: "bg-red-50", sign: "−" },
  WITHDRAWAL_REVERSAL: { text: "بازگشت برداشت", color: "text-amber-600", bg: "bg-amber-50", sign: "+" },
};

export default function PartnerWalletTransactionsPage() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page, limit: 10 });
      if (type) params.set("type", type);
      const res = await apiFetch(`/partner/wallet/transactions?${params}`);
      setItems(res.data?.items || res.data?.transactions || res.data || []);
      setTotalPages(res.data?.totalPages || res.pagination?.totalPages || 1);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [page, type]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <PageHeader title="تراکنش‌های پورسانت" description="تاریخچه‌ی کامل پورسانت، برداشت و بازگشت" />

      <select
        value={type}
        onChange={(e) => { setType(e.target.value); setPage(1); }}
        className="mb-4 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-cyan-400 focus:outline-none"
      >
        <option value="">همه تراکنش‌ها</option>
        <option value="COMMISSION">پورسانت</option>
        <option value="WITHDRAWAL">برداشت</option>
        <option value="WITHDRAWAL_REVERSAL">بازگشت برداشت</option>
      </select>

      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

      {loading ? (
        <div className="py-20 text-center text-slate-400">در حال بارگذاری…</div>
      ) : items.length === 0 ? (
        <EmptyState title="تراکنشی یافت نشد" />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-right text-xs text-slate-500">
                  <th className="px-3 py-3 font-medium">نوع</th>
                  <th className="px-3 py-3 font-medium">شرح</th>
                  <th className="px-3 py-3 font-medium">مبلغ</th>
                  <th className="px-3 py-3 font-medium">تاریخ</th>
                </tr>
              </thead>
              <tbody>
                {items.map((t) => {
                  const meta = TYPE_LABEL[t.type] || TYPE_LABEL.COMMISSION;
                  return (
                    <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50/60">
                      <td className="px-3 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${meta.bg} ${meta.color}`}>
                          {meta.text}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-slate-600">{t.description || "—"}</td>
                      <td className={`px-3 py-3 font-black ${meta.color}`}>
                        {meta.sign}{Math.abs(t.amount).toLocaleString("fa-IR")} تومان
                      </td>
                      <td className="px-3 py-3 text-slate-500">
                        {t.createdAt ? new Date(t.createdAt).toLocaleDateString("fa-IR") : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
