"use client";

import { useEffect, useState } from "react";
import AdminOfferCard from "../../../../components/common/AdminOfferCard";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function AdminOffersPage() {
  const [offers, setOffers] = useState([]);

  const [page, setPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);

  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchOffers();
  }, [page]);

  async function fetchOffers() {
    try {
      setLoading(true);

      const res = await fetch(
        `${API}/my-offers/admin?page=${page}`,
        {
          credentials: "include",
        }
      );

      const data = await res.json();

      setOffers(data.offers || []);

      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    const ok = confirm("این پیشنهاد حذف شود؟");

    if (!ok) return;

    try {
      setDeletingId(id);

      const res = await fetch(
        `${API}/my-offers/admin/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!res.ok) {
        throw new Error();
      }

      setOffers((prev) =>
        prev.filter((item) => item.id !== id)
      );
    } catch (error) {
      console.log(error);
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <div className="p-6 text-sm text-slate-500">
        در حال دریافت پیشنهادها...
      </div>
    );
  }

  if (!offers.length) {
    return (
      <div className="p-6 text-sm text-slate-500">
        پیشنهادی وجود ندارد
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6">
      {offers.map((offer) => (
        <AdminOfferCard
          key={offer.id}
          offer={offer}
          deletingId={deletingId}
          onDelete={handleDelete}
        />
      ))}

      <div className="flex items-center justify-center gap-3 pt-6">
        <button
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
          className="rounded-xl border px-4 py-2 text-xs"
        >
          قبلی
        </button>

        <span className="text-xs text-slate-500">
          صفحه {page} از {totalPages}
        </span>

        <button
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="rounded-xl border px-4 py-2 text-xs"
        >
          بعدی
        </button>
      </div>
    </div>
  );
}
