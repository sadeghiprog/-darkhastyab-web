"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../../../../../lib/api2";
import PageHeader from "../../../../../components/ui/PageHeader";
import EmptyState from "../../../../../components/ui/EmptyState";
import Pagination from "../../../../../components/ui/Pagination";

export default function PartnersReportPage() {
  const router = useRouter();
  const [partners, setPartners] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page, limit: 10 });
      if (search) params.set("search", search);
      const res = await apiFetch(`/admin/partners/report?${params}`);
      setPartners(res.data?.partners || res.data?.items || res.data || []);
      setTotalPages(res.data?.totalPages || res.pagination?.totalPages || 1);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <PageHeader title="گزارش همکاران" description="لیست همکاران و عملکرد هر یک" />

      <input
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        className="mb-4 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-cyan-400 focus:outline-none"
        placeholder="جستجو بر اساس نام، ایمیل یا موبایل همکار…"
      />

      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

      {loading ? (
        <div className="py-20 text-center text-slate-400">در حال بارگذاری…</div>
      ) : partners.length === 0 ? (
        <EmptyState title="همکاری یافت نشد" />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-right text-xs text-slate-500">
                  <th className="px-3 py-3 font-medium">همکار</th>
                  <th className="px-3 py-3 font-medium">موبایل</th>
                  <th className="px-3 py-3 font-medium">کاربران ثبت‌شده</th>
                  <th className="px-3 py-3 font-medium">مجموع پورسانت</th>
                  <th className="px-3 py-3 font-medium">موجودی کیف پول</th>
                  <th className="px-3 py-3 font-medium">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {partners.map((p) => (
                  <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50/60">
                    <td className="px-3 py-3 font-bold text-slate-800">{p.name || "—"}</td>
                    <td className="px-3 py-3 text-slate-600" dir="ltr">{p.phone || "—"}</td>
                    <td className="px-3 py-3 text-slate-600">{(p.totalUsers ?? 0).toLocaleString("fa-IR")}</td>
                    <td className="px-3 py-3 font-bold text-emerald-600">
                      {(p.totalCommission ?? 0).toLocaleString("fa-IR")} تومان
                    </td>
                    <td className="px-3 py-3 text-slate-600">
                      {(p.walletBalance ?? 0).toLocaleString("fa-IR")} تومان
                    </td>
                    <td className="px-3 py-3">
                      <button
                        onClick={() => router.push(`/profile/admin/partners/${p.id}`)}
                        className="text-xs font-bold text-cyan-600 hover:text-cyan-700"
                      >
                        جزئیات
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
