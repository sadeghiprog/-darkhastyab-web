"use client";

import { useEffect, useState } from "react";

import TransactionCard from "../../../../components/common/TransactionCard";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState([]);

  const [page, setPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);

  const fetchTransactions = async () => {
    const res = await fetch(
      `${API}/wallet/admin/topups?page=${page}`,
      {
        credentials: "include",
      }
    );

    const data = await res.json();

    setTransactions(data.transactions);

    setTotalPages(data.pagination.totalPages);
  };

  useEffect(() => {
    fetchTransactions();
  }, [page]);

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-8">

      <div>
        <h1 className="text-xl font-semibold">
          تراکنش‌های شارژ کیف پول
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          لیست پرداخت‌های کاربران
        </p>
      </div>

      <div className="grid gap-4">

        {transactions.length === 0 ? (
          <div className="text-center text-gray-400 text-sm py-12">
            تراکنشی یافت نشد
          </div>
        ) : (
          transactions.map((transaction) => (
            <TransactionCard
              key={transaction.id}
              transaction={transaction}
              adminView
            />
          ))
        )}

      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4">

          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 text-xs border rounded disabled:opacity-30"
          >
            قبلی
          </button>

          <span className="text-xs px-3 py-1">
            صفحه {page} از {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 text-xs border rounded disabled:opacity-30"
          >
            بعدی
          </button>

        </div>
      )}

    </div>
  );
}
