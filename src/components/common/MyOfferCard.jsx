"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import OfferCard from "../../app/request/[slug]/components/OfferCard";

export default function MyOfferCard({
  offer,
  deletingId,
  onDelete,
}) {
  return (
    <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <Link
          href={`/request/${offer.purchaseRequest.slug}`}
          className="text-sm font-black text-cyan-700 hover:text-cyan-900"
        >
          {offer.purchaseRequest.title}
        </Link>

        <button
          onClick={() => onDelete(offer.id)}
          disabled={deletingId === offer.id}
          className="flex items-center gap-1 rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-100"
        >
          <Trash2 size={14} />

          {deletingId === offer.id
            ? "در حال حذف..."
            : "حذف"}
        </button>
      </div>

      <OfferCard
        offer={offer}
        contactLoadingId={null}
        onContactClick={() => {}}
      />
    </div>
  );
}
