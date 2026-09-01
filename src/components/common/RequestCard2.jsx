"use client";
import React, { useState } from "react";
import Link from "next/link";
import { MapPin, Wallet, FolderKanban, Image as ImageIcon } from "lucide-react";

const PLACEHOLDER_IMAGE = "/uploads/purchase-requests/thumbs/no-image.webp";

function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const baseUrl = (process.env.NEXT_PUBLIC_AVATAR_URL || "").replace(/\/+$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  return `${baseUrl}${cleanPath}`;
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex shrink-0 max-w-full items-center gap-1.5 text-slate-500">
      <Icon size={14} className="shrink-0 text-cyan-600" />
      <span className="shrink-0 text-xs text-slate-400">{label}:</span>
      <span className="max-w-full truncate text-sm font-bold text-slate-700">
        {value}
      </span>
    </div>
  );
}

export default function HorizontalRequestCardPremium({ request }) {
  const [imageError, setImageError] = useState(false);

  const formatNumber = (value) =>
    new Intl.NumberFormat("fa-IR").format(value || 0);

  const href = `/request/${request?.slug || ""}`;

  const isExpired = request?.isExpired;

  // پردازش آدرس تصویر
  const images = Array.isArray(request?.images) ? request.images : [];
  const rawImagePath = images[0]?.thumbnailUrl || images[0]?.url || null;
  const primaryImage = getImageUrl(rawImagePath);
  const imageSrc = !imageError && primaryImage ? primaryImage : PLACEHOLDER_IMAGE;

  const categoryName = request?.category?.name || request?.category?.title || null;

  return (
    <Link href={href} className="block">
      <div className="group flex w-full gap-3 rounded-2xl border border-slate-200/90 bg-white p-2.5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-md">
        {/* نوار گرادینت کناری */}
        <div className="w-1 shrink-0 self-stretch rounded-full bg-gradient-to-b from-cyan-400 to-blue-500" />

        {/* باکس عکس */}
        <div className="relative aspect-square w-28 shrink-0 self-center overflow-hidden rounded-xl border border-slate-100 bg-slate-100 sm:w-32">
          <img
            src={imageSrc}
            alt={request?.title || "درخواست خرید"}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onError={() => setImageError(true)}
          />

          {images.length > 1 && (
            <div className="absolute bottom-1.5 left-1.5 z-10">
              <div className="flex items-center gap-1 rounded-lg bg-slate-900/70 px-2 py-1 text-[11px] font-bold text-white backdrop-blur-sm">
                <ImageIcon size={11} />
                <span>{images.length}</span>
              </div>
            </div>
          )}

          {isExpired && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50">
              <span className="text-xs font-bold text-white">منقضی</span>
            </div>
          )}
        </div>

        {/* محتوا: عنوان چسبیده به بالا، اطلاعات چسبیده به پایین */}
        <div className="flex min-w-0 flex-1 flex-col justify-between gap-2 py-1">
          {/* عنوان + بج دسته‌بندی به‌صورت inline؛ اگر جا نبود خودکار می‌ره زیر عنوان */}
          <h3 className="line-clamp-2 min-w-0 text-base font-extrabold leading-snug text-slate-800 transition-colors group-hover:text-cyan-700">
            {request?.title || "بدون عنوان"}
            {categoryName && (
              <span className="ms-2 inline-flex translate-y-[-1px] items-center gap-1 rounded-lg bg-cyan-50 px-2 py-0.5 align-middle text-xs font-semibold text-cyan-700">
                <FolderKanban size={11} />
                <span className="max-w-[110px] truncate">{categoryName}</span>
              </span>
            )}
          </h3>

          {/* بودجه و محل تحویل: اگر جا نبود، کامل می‌رن به خط بعد */}
          <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1.5">
            <InfoItem
              icon={Wallet}
              label="بودجه"
              value={
                request?.budgetAmount
                  ? `${formatNumber(request.budgetAmount)} تومان`
                  : "توافقی"
              }
            />

            <InfoItem
              icon={MapPin}
              label="تحویل"
              value={request?.province?.name || "—"}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}