"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { apiFetch } from "../../../../lib/api2";
import PageHeader from "../../../../components/ui/PageHeader";
import EmptyState from "../../../../components/ui/EmptyState";
import Pagination from "../../../../components/ui/Pagination";

const PAGE_SIZE = 20;

/* ------------------------------------------------------------------
 * استخراج پاسخ getPartnersReport
 * ------------------------------------------------------------------ */
function extractPartnersResponse(response) {
  const root =
    response?.data && typeof response?.data === "object"
      ? response.data
      : response || {};

  const body =
    root?.result && typeof root?.result === "object" ? root.result : root;

  const partners = Array.isArray(body?.partners)
    ? body.partners
    : Array.isArray(body?.items)
      ? body.items
      : Array.isArray(body)
        ? body
        : [];

  const pagination = body?.pagination || {};

  const totalPages = Math.max(
    1,
    Number(
      pagination?.totalPages ??
        body?.totalPages ??
        root?.pagination?.totalPages ??
        root?.totalPages ??
        1
    ) || 1
  );

  const currentPage = Math.max(
    1,
    Number(pagination?.page ?? body?.page ?? root?.page ?? 1) || 1
  );

  const total = Math.max(
    0,
    Number(pagination?.total ?? body?.total ?? root?.total ?? partners.length) ||
      0
  );

  return {
    partners,
    pagination: { page: currentPage, total, totalPages },
  };
}

/* ------------------------------------------------------------------
 * توابع فرمت‌دهی فارسی
 * ------------------------------------------------------------------ */
function formatNumber(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return "۰";
  return num.toLocaleString("fa-IR");
}

function formatDate(date) {
  if (!date) return "—";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getStat(partner, key) {
  return partner?.stats?.[key] ?? 0;
}

/* ------------------------------------------------------------------
 * کامپوننت آیتم آماری مینیمال افقی
 * ------------------------------------------------------------------ */
function StatItem({ label, value, unit, highlight = false, color = "slate" }) {
  const colorClasses = {
    green: "text-emerald-600 bg-emerald-50/50 border-emerald-100/60",
    cyan: "text-cyan-600 bg-cyan-50/50 border-cyan-100/60",
    blue: "text-blue-600 bg-blue-50/50 border-blue-100/60",
    slate: "text-slate-700 bg-slate-50/80 border-slate-100",
  };

  return (
    <div
      className={`flex flex-col justify-between rounded-xl border px-3 py-2 transition hover:border-slate-300 ${
        colorClasses[color] || colorClasses.slate
      }`}
    >
      <span className="text-[11px] font-medium text-slate-400">{label}</span>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-sm font-bold tracking-tight">
          {formatNumber(value)}
        </span>
        {unit && <span className="text-[10px] text-slate-400">{unit}</span>}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------
 * صفحه اصلی
 * ------------------------------------------------------------------ */
export default function AdminPartnersPage() {
  const router = useRouter();

  const [partners, setPartners] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const abortRef = useRef(null);

  const loadPartners = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      });

      if (search) params.set("search", search);

      const response = await apiFetch(
        `/admin/partners/report?${params.toString()}`,
        { signal: controller.signal }
      );

      const result = extractPartnersResponse(response);

      setPartners(result.partners);
      setTotalPages(result.pagination.totalPages);
      setTotal(result.pagination.total);
    } catch (err) {
      if (err?.name === "AbortError") return;

      console.error("Load admin partners error:", err);

      setPartners([]);
      setTotalPages(1);
      setTotal(0);
      setError(err?.message || "دریافت لیست همکاران با خطا مواجه شد.");
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }, [page, search]);

  useEffect(() => {
    loadPartners();
    return () => abortRef.current?.abort();
  }, [loadPartners]);

  function handleSearchSubmit(event) {
    event.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  }

  function handleClearSearch() {
    setSearchInput("");
    setSearch("");
    setPage(1);
  }

  function handleShowDetail(partnerId) {
    if (!partnerId) return;
    router.push(`/profile/admin/partners/${partnerId}`);
  }

  const hasPartners = Array.isArray(partners) && partners.length > 0;
  const hasActiveSearch = Boolean(search || searchInput);

  return (
    <div dir="rtl" className="space-y-5">
      <PageHeader
        title="مدیریت همکاران"
        description="گزارش عملکرد و پورسانت همکاران"
      />

      {/* جستجو و فیلتر */}
      <div className="flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-1 gap-2">
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="جستجو بر اساس نام یا شماره موبایل…"
            className="w-full max-w-md rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            جستجو
          </button>
          {hasActiveSearch && (
            <button
              type="button"
              onClick={handleClearSearch}
              disabled={loading}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              پاک‌کردن
            </button>
          )}
        </form>

        {!loading && total > 0 && (
          <span className="text-xs text-slate-400">
            {formatNumber(total)} همکار
          </span>
        )}
      </div>

      {/* خطا */}
      {error && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={loadPartners}
            className="shrink-0 rounded-lg px-2 py-1 text-xs font-bold text-red-800 transition hover:bg-red-100"
          >
            تلاش مجدد
          </button>
        </div>
      )}

      {/* حالت لودینگ */}
      {loading ? (
        <div className="rounded-2xl border border-slate-100 bg-white py-20 text-center text-sm text-slate-400">
          در حال بارگذاری لیست همکاران…
        </div>
      ) : !hasPartners ? (
        <EmptyState
          title="همکاری یافت نشد"
          description={
            search
              ? "همکاری با این جستجو وجود ندارد."
              : "هنوز همکاری ثبت نشده است."
          }
        />
      ) : (
        <>
          {/* لیست کارت‌های مینیمال افقی */}
          <div className="space-y-3">
            {partners.map((partner) => {
              const approvedSuppliers = getStat(partner, "approvedSuppliersCount");
              const supplierIncome = getStat(partner, "supplierRegistrationIncome");
              const purchaseRequests = getStat(partner, "purchaseRequestsCount");
              const purchaseRequestIncome = getStat(partner, "purchaseRequestIncome");
              const commissionCount = getStat(partner, "commissionCount");
              const commissionIncome = getStat(partner, "commissionIncome");
              const totalIncome = getStat(partner, "totalIncome");
              const totalWithdrawals = getStat(partner, "totalWithdrawals");
              const currentBalance = getStat(partner, "currentBalance");
              const registeredUsers = getStat(partner, "registeredUsersCount");

              return (
                <div
                  key={partner.id}
                  className="group flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:border-cyan-200 hover:shadow-md xl:flex-row xl:items-center xl:justify-between"
                >
                  {/* بخش راست: هویت همکار و موجودی */}
                  <div className="flex flex-wrap items-center justify-between gap-4 xl:w-72 xl:shrink-0 xl:border-l xl:border-slate-100 xl:pl-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 text-base font-black text-white shadow-sm">
                        {(partner.name || "؟").charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 group-hover:text-cyan-600 transition">
                          {partner.name || "نامشخص"}
                        </p>
                        <div className="mt-0.5 flex items-center gap-2">
                          {partner.phone && (
                            <span
                              dir="ltr"
                              className="font-mono text-xs text-slate-400"
                            >
                              {partner.phone}
                            </span>
                          )}
                          <span className="text-[10px] text-slate-300">•</span>
                          <span className="text-[10px] text-slate-400">
                            {formatDate(partner.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* موجودی مختصر */}
                    <div className="rounded-xl bg-slate-50 px-3 py-1.5 text-left border border-slate-100">
                      <span className="block text-[10px] text-slate-400">موجودی کیف پول</span>
                      <span className="text-xs font-black text-emerald-600">
                        {formatNumber(currentBalance)} <span className="text-[9px] font-normal">تومان</span>
                      </span>
                    </div>
                  </div>

                  {/* بخش میانی: گرید آماری فشرده و مرتب */}
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-5 flex-1">
                    <StatItem
                      label="مجموع درآمد"
                      value={totalIncome}
                      unit="ت"
                      color="green"
                    />
                    <StatItem
                      label="مجموع برداشت"
                      value={totalWithdrawals}
                      unit="ت"
                    />
                    <StatItem
                      label="پورسانت خرید"
                      value={commissionIncome}
                      unit="ت"
                      color="cyan"
                    />
                    <StatItem
                      label="تأمین‌کننده تأییدشده"
                      value={approvedSuppliers}
                      unit="نفر"
                    />
                    <StatItem
                      label="درخواست خرید"
                      value={purchaseRequests}
                      unit="مورد"
                    />
                  </div>

                  {/* بخش چپ: دکمه اکشن */}
                  <div className="flex shrink-0 items-center justify-end pt-2 xl:pt-0">
                    <button
                      type="button"
                      onClick={() => handleShowDetail(partner.id)}
                      className="w-full xl:w-auto rounded-xl bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-cyan-500 hover:text-white border border-slate-200/80 hover:border-cyan-500 shadow-2xs"
                    >
                      جزئیات عملکرد
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* صفحه‌بندی */}
          {totalPages > 1 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              onChange={setPage}
            />
          )}
        </>
      )}
    </div>
  );
}
