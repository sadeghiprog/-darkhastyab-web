"use client";

import Link from "next/link";
import { PhoneCall, Star, User2 } from "lucide-react";
import { formatPrice } from "../utils/formatters";

const baseAvatar = process.env.NEXT_PUBLIC_AVATAR_URL;

export default function OfferCard({
  offer,
  contactLoadingId,
  onContactClick,
}) {
  const avatarSrc = offer.supplier?.profile?.avatarUrl
    ? `${baseAvatar}${offer.supplier.profile.avatarUrl}`
    : `${baseAvatar}/uploads/avatars/avatar.png`;

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-4">
        <Link
          href={`/suppliers/${offer.supplier?.id}`}
          className="shrink-0"
        >
          <img
            src={avatarSrc}
            alt={offer.supplier?.name || "supplier"}
            className="h-14 w-14 rounded-full object-cover transition hover:scale-105"
          />
        </Link>

        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm font-black text-slate-800">
            <User2 size={14} className="text-cyan-600" />
            <span className="truncate">
              {offer.supplier?.name || "تامین‌کننده"}
            </span>
          </div>

          <div className="mt-1 flex items-center gap-1 text-xs text-amber-500">
            <Star size={13} className="fill-amber-400 text-amber-400" />
            <span>
              {offer.supplier.avg != null
                ? Number(offer.supplier.avg).toFixed(1)
                : "بدون امتیاز"}
            </span>
          </div>

          <div className="mt-2 text-xs text-slate-500">
            مقدار:{" "}
            {offer.quantity != null
              ? `${formatPrice(offer.quantity)} ${offer.unit?.name || ""}`
              : "—"}
          </div>

          <div className="text-xs text-slate-500">
            قیمت پیشنهادی: {formatPrice(offer.price)} تومان
          </div>
        </div>
      </div>

      <button
        onClick={() => onContactClick(offer.id)}
        disabled={contactLoadingId === offer.id}
        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 text-xs font-black text-white hover:bg-cyan-600 disabled:opacity-70"
      >
        <PhoneCall size={15} />
        {contactLoadingId === offer.id ? "در حال بررسی..." : "تماس"}
      </button>
    </div>
  );
}
