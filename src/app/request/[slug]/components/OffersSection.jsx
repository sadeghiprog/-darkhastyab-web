"use client";

import OfferCard from "./OfferCard";

export default function OffersSection({
  loadingOffers,
  offers,
  contactLoadingId,
  onContactClick,
}) {
  return (
    <div className="mt-8">
      <h2 className="mb-4 text-lg font-black text-slate-800">
        پیشنهادهای تامین‌کنندگان
      </h2>

      {loadingOffers ? (
        <div className="h-40 animate-pulse rounded-3xl bg-slate-100" />
      ) : offers.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-400">
          هنوز پیشنهادی ثبت نشده است.
        </div>
      ) : (
        <div className="space-y-4">
          {offers.map((offer) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              contactLoadingId={contactLoadingId}
              onContactClick={onContactClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}
