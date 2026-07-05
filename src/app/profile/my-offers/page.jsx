"use client";

import { useEffect, useState } from "react";

import MyOfferCard from "../../../components/common/MyOfferCard";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function MyOffersPage() {
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
        `${API}/my-offers/my?page=${page}`,
        {
          credentials: "include",
        }
      );

      const data = await res.json();

      setOffers(data.offers || []);

      setTotalPages(data.pagination.totalPages || 1);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    const ok = confirm("حذف شود؟");

    if (!ok) return;

    try {
      setDeletingId(id);

      const res = await fetch(
        `${API}/my-offers/${id}`,
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
    return <div>در حال دریافت...</div>;
  }

  return (
    <div className="space-y-4">
      {offers.map((offer) => (
        <MyOfferCard
          key={offer.id}
          offer={offer}
          deletingId={deletingId}
          onDelete={handleDelete}
        />
      ))}

      <div className="flex items-center justify-center gap-3 pt-4">
        <button
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
        >
          قبلی
        </button>

        <span>
          {page} / {totalPages}
        </span>

        <button
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          بعدی
        </button>
      </div>
    </div>
  );
}
