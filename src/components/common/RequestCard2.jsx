"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Wallet,
  Clock3,
  FolderKanban,
  Image as ImageIcon,
} from "lucide-react";

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

export default function HorizontalRequestCardPremium({ request }) {
  const [imageError, setImageError] = useState(false);

  const formatNumber = (value) =>
    new Intl.NumberFormat("fa-IR").format(value || 0);

  const href = `/request/${request?.slug || ""}`;

  const isExpired = request?.isExpired;
  const daysRemaining =
    typeof request?.daysRemaining === "number" ? request.daysRemaining : null;

  // پردازش آدرس تصویر
  const images = Array.isArray(request?.images) ? request.images : [];
  const rawImagePath = images[0]?.thumbnailUrl || images[0]?.url || null;
  const primaryImage = getImageUrl(rawImagePath);
  const imageSrc = !imageError && primaryImage ? primaryImage : PLACEHOLDER_IMAGE;

  return (
    <Link href={href} className="block">
      <div className="group w-full rounded-2xl border border-slate-200/90 bg-white p-2 sm:p-2.5 pr-1 sm:pr-1.5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-md cursor-pointer">
        <div className="flex items-center gap-2 sm:gap-2.5">
          
          {/* نوار گرادینت کناری با حداقل فاصله */}
          <div className="h-24 sm:h-28 w-1 rounded-full bg-gradient-to-b from-cyan-400 to-blue-500 shrink-0" />

          {/* باکس عکس بزرگ‌تر */}
          <div className="relative h-24 w-24 sm:h-28 sm:w-28 shrink-0 rounded-xl overflow-hidden bg-slate-100 border border-slate-100">
            <img
              src={imageSrc}
              alt={request?.title || "درخواست خرید"}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              onError={() => setImageError(true)}
            />

            {images.length > 1 && (
              <div className="absolute bottom-1 left-1 z-10">
                <div className="flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-900/70 text-white backdrop-blur-sm">
                  <ImageIcon size={10} />
                  <span>{images.length}</span>
                </div>
              </div>
            )}
          </div>

          {/* کانتینر محتوا: کشیده شده به اندازه ارتفاع عکس با بیشترین فاصله بین بالا و پایین */}
          <div className="min-w-0 flex-1 flex flex-col justify-between h-24 sm:h-28 py-0.5">
            
            {/* عنوان: چسبیده به بالا */}
            <h3 className="line-clamp-2 text-sm sm:text-base font-extrabold text-slate-800 leading-snug transition-colors group-hover:text-cyan-700">
              {request?.title || "بدون عنوان"}
            </h3>

            {/* بخش اطلاعات: چسبیده به پایین (گرید ۲ ستونه ۲ ردیفه / ریسپانسیو) */}
            <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-x-3 gap-y-1 text-xs">
              
              {/* بودجه */}
              <div className="flex items-center gap-1.5 text-slate-500 min-w-0">
                <Wallet size={13} className="text-cyan-600 shrink-0" />
                <span className="text-slate-400 text-[11px]">بودجه:</span>
                <span className="font-black text-slate-800 truncate">
                  {formatNumber(request?.budgetAmount)} تومان
                </span>
              </div>

              {/* دسته بندی */}
              <div className="flex items-center gap-1.5 text-slate-500 min-w-0">
                <FolderKanban size={13} className="text-cyan-600 shrink-0" />
                <span className="text-slate-400 text-[11px]">دسته:</span>
                <span className="font-bold text-slate-700 truncate">
                  {request?.category?.name || request?.category?.title || "—"}
                </span>
              </div>

              {/* تحویل (استان / شهر) */}
              <div className="flex items-center gap-1.5 text-slate-500 min-w-0">
                <MapPin size={13} className="text-cyan-600 shrink-0" />
                <span className="text-slate-400 text-[11px]">تحویل:</span>
                <span className="font-bold text-slate-700 truncate">
                  {request?.province?.name || "—"}
                </span>
              </div>

              {/* انقضا */}
              <div className="flex items-center gap-1.5 text-slate-500 min-w-0">
                <Clock3 size={13} className="text-cyan-600 shrink-0" />
                <span className="text-slate-400 text-[11px]">انقضا:</span>
                <span className="font-bold text-slate-700 truncate">
                  {isExpired
                    ? "منقضی شده"
                    : daysRemaining > 10000
                    ? "بدون انقضا"
                    : daysRemaining !== null
                    ? `${formatNumber(daysRemaining)} روز`
                    : "نامشخص"}
                </span>
              </div>

            </div>

          </div>

        </div>
      </div>
    </Link>
  );
}
