"use client";

import { useEffect, useState } from "react";
import SupplierCard from "../../components/common/SupplierCard";
import Link from "next/link";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchSuppliers(page);
  }, [page]);

  async function fetchSuppliers(currentPage) {
    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/suppliers?page=${currentPage}&limit=9`
      );
      const data = await res.json();
      setSuppliers(data.suppliers || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const showHero = page === 1;

  return (
    <div className="min-h-screen bg-gray-50 text-right" dir="rtl">
      {/* افزودن متادیتای پویا در سمت کلاینت برای مرورگرها */}
      <head>
        <title>{`لیست تأمین‌کنندگان برتر درخاست‌یاب | صفحه ${page}`}</title>
        <meta name="description" content="شبکه تأمین‌کنندگان و تولیدکنندگان برتر بازار . با ثبت‌نام به عنوان تأمین‌کننده، مستقیماً به درخواست‌های خرید پاسخ دهید." />
        <link rel="canonical" href={`https://darkhastyab.com/suppliers?page=${page}`} />
        <meta name="robots" content="index, follow" />
      </head>

      {showHero && (
        <section className="relative overflow-hidden bg-slate-50 border-b border-gray-200/80">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05),transparent_70%)]" />
          
          <div className="relative max-w-4xl mx-auto px-6 py-6 md:py-8 flex flex-col items-center text-center">
            <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-medium text-blue-600 border border-blue-100">
             درخاست یاب شبکه تأمین‌کنندگان بازار 
            </span>

            <h1 className="mt-3 text-xl md:text-2xl font-extrabold text-slate-800 leading-tight">
              تأمین‌کننده شوید و
              <span className="text-blue-600"> مشتریان واقعی </span>
              پیدا کنید
            </h1>

            <p className="mt-2 text-[11px] md:text-xs text-slate-500 leading-5 max-w-lg">
              اگر تولیدکننده، واردکننده یا فروشنده عمده هستید، با عضویت در شبکه تأمین‌کنندگان می‌توانید مستقیم به درخواست‌های خرید پاسخ دهید.
            </p>

            <div className="mt-4">
              <Link
                href="/profile/supplier-request"
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 text-white px-4 py-2 text-xs font-semibold hover:bg-blue-700 transition shadow-sm"
              >
                تبدیل به تأمین‌کننده شوید
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between gap-2 mb-5 pb-3 border-b border-gray-200">
          <div>
            <h2 className="text-base md:text-lg font-bold text-gray-900">
              لیست تأمین‌کننده‌ها
            </h2>
            <p className="text-[11px] text-gray-500 mt-0.5">
              تأمین‌کنندگان فعال را بررسی کنید و مناسب‌ترین گزینه را پیدا کنید
            </p>
          </div>

          <div className="text-xs text-gray-400">
            صفحه {page} از {totalPages}
          </div>
        </div>

        {loading ? (
          <div className="py-10 text-center text-xs text-gray-500">
            در حال دریافت تأمین‌کننده‌ها...
          </div>
        ) : suppliers.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-white py-10 text-center text-xs text-gray-400">
            تأمین‌کننده‌ای یافت نشد
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {suppliers.map((supplier) => (
                <SupplierCard key={supplier.id} supplier={supplier} />
              ))}
            </div>

            {/* بخش پیجینیشن کامپکت */}
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="h-8 px-2.5 rounded-lg border border-gray-300 bg-white text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
              >
                قبلی
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).slice(0, 5).map((_, index) => {
                  const pageNumber = index + 1;
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setPage(pageNumber)}
                      className={`h-7 w-7 rounded-lg text-xs font-semibold transition ${
                        page === pageNumber
                          ? "bg-slate-800 text-white"
                          : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
                className="h-8 px-2.5 rounded-lg border border-gray-300 bg-white text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
              >
                بعدی
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
