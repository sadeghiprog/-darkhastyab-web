import React, { useState } from "react";
import Link from "next/link";
import {
  Layers,
  Package,
  CreditCard,
  MapPin,
  ChevronLeft,
  CheckCircle2,
  CircleSlash,
  PackageSearch,
  User,
} from "lucide-react";

const PLACEHOLDER_IMAGE = "/uploads/purchase-requests/thumbs/no-image.webp";

const STOP_WORDS = new Set([
  "از",
  "با",
  "به",
  "در",
  "برای",
  "تا",
  "و",
  "یا",
  "که",
  "را",
  "این",
  "آن",
  "یک",
  "بر",
  "روی",
  "تو",
  "هم",
]);

function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const baseUrl = (process.env.NEXT_PUBLIC_AVATAR_URL || "").replace(/\/+$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  return `${baseUrl}${cleanPath}`;
}

function normalizeText(value) {
  return String(value || "")
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/\s+/g, " ")
    .trim();
}

function extractHighlightTerms(query) {
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) {
    return [];
  }

  const terms = normalizedQuery
    .split(/[\s\-_,.،؛:!?()\/\\]+/)
    .map((word) => word.trim())
    .filter(Boolean)
    .filter((word) => word.length > 1)
    .filter((word) => !STOP_WORDS.has(word));

  return [...new Set(terms)].sort((a, b) => b.length - a.length);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightText(text, query) {
  const normalizedText = normalizeText(text);
  const terms = extractHighlightTerms(query);

  if (!normalizedText || terms.length === 0) {
    return normalizedText;
  }

  const pattern = terms.map(escapeRegExp).join("|");
  const regex = new RegExp(`(${pattern})`, "gi");
  const parts = normalizedText.split(regex);

  return parts.map((part, index) => {
    const normalizedPart = normalizeText(part);
    const isMatch = terms.some(
      (term) => normalizeText(term).toLowerCase() === normalizedPart.toLowerCase()
    );

    if (isMatch) {
      return (
        <mark
          key={index}
          className="bg-sky-100 text-sky-700 px-1 rounded-md font-bold"
        >
          {part}
        </mark>
      );
    }

    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}

export default function RequestCard({ request, highlight = "" }) {
  const [imageError, setImageError] = useState(false);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("fa-IR").format(amount || 0);
  };

  const href = `/request/${request?.slug}`;
  const isExpired = request?.isExpired;
  const offersCount = request?.offersCount ?? 0;

  // دریافت تصویر اول
  const images = Array.isArray(request?.images) ? request.images : [];
  const rawImagePath = images[0]?.thumbnailUrl || images[0]?.url || null;
  const primaryImage = getImageUrl(rawImagePath);
  const imageSrc = !imageError && primaryImage ? primaryImage : getImageUrl(PLACEHOLDER_IMAGE);

  return (
    <Link href={href} className="block">
      <div className="bg-white rounded-3xl p-2 shadow-sm border border-slate-100 flex flex-col gap-4 relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-cyan-200 hover:-translate-y-1">
        
        {/* بخش تصویر اضافه شده */}
        <div className="relative w-full h-48 rounded-2xl overflow-hidden bg-slate-100 border border-slate-100">
          <img
            src={imageSrc}
            alt={request?.title || "درخواست خرید"}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={() => setImageError(true)}
          />

          {images.length > 1 && (
            <div className="absolute bottom-2.5 left-2.5 z-10">
              <div className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg bg-slate-900/70 text-white backdrop-blur-sm">
                <span>{images.length} تصویر</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1 mx-3" >
          <h3 className="text-lg font-bold text-slate-800 leading-tight" >
            {highlightText(request?.title, highlight)}
          </h3>

          <div className="flex items-center gap-1.5 text-xs text-slate-500" >
            <User size={13} className="text-slate-400" />
            <span>ثبت شده توسط: {request?.userName || "کاربر ناشناس"}</span>
          </div>

          <div className="flex items-center justify-between gap-1 ">
            <div className="flex items-center gap-2">
              <div className="bg-cyan-50 text-cyan-600 px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-xs font-semibold">
                <Layers size={13} />
                <span>{request?.category?.name || "—"}</span>
              </div>
            </div>

            <div
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${
                isExpired
                  ? "bg-red-100 text-red-600"
                  : "bg-green-100 text-green-600"
              }`}
            >
              {isExpired ? (
                <>
                  <CircleSlash size={14} />
                  <span>منقضی شده</span>
                </>
              ) : request?.daysRemaining > 10000 ? (
                <>
                  <CheckCircle2 size={14} />
                  <span>بدون انقضا</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={14} />
                  <span>{request?.daysRemaining} روز تا پایان</span>
                </>
              )}
            </div>
          </div>
        </div>

        <hr className="border-slate-100" />

        <div className="grid grid-cols-2 gap-1" m-3>
          <div className="bg-slate-50/50 rounded-2xl p-3 border border-slate-100 flex items-center gap-3">
            <div className="bg-cyan-50 text-cyan-500 p-2 rounded-xl shrink-0">
              <CreditCard size={18} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] text-slate-400 mb-0.5">بودجه</span>
              <div className="flex items-baseline gap-1 truncate">
                <span className="font-extrabold text-sm text-slate-700">
                  {formatCurrency(request?.budgetAmount)}
                </span>
                <span className="text-[9px] text-slate-400">تومان</span>
              </div>
            </div>
          </div>

          {/* <div className="bg-slate-50/50 rounded-2xl p-3 border border-slate-100 flex items-center gap-3">
            <div className="bg-cyan-50 text-cyan-500 p-2 rounded-xl shrink-0">
              <Package size={18} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] text-slate-400 mb-0.5">مقدار</span>
              <div className="flex items-baseline gap-1 truncate">
                <span className="font-extrabold text-sm text-slate-700">
                  {formatCurrency(request?.quantity)}
                </span>
                <span className="text-xs text-slate-500">
                  {request?.unit?.name || ""}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50/50 rounded-2xl p-3 border border-slate-100 flex items-center gap-3">
            <div className="bg-cyan-50 text-cyan-500 p-2 rounded-xl shrink-0">
              <PackageSearch size={18} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] text-slate-400 mb-0.5">پیشنهادها</span>
              <span className="font-extrabold text-sm text-slate-700">
                {offersCount}
              </span>
            </div>
          </div> */}

          <div className="bg-slate-50/50 rounded-2xl p-3 border border-slate-100 flex items-center gap-3">
            <div className="bg-cyan-50 text-cyan-500 p-2 rounded-xl shrink-0">
              <MapPin size={18} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] text-slate-400 mb-0.5">محل تحویل</span>
              <span className="font-extrabold text-sm text-slate-700 truncate">
                {request?.province?.name || "—"}
              </span>
            </div>
          </div>
        </div>

        <div className="w-full bg-slate-900 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 mt-1 text-sm transition-all hover:bg-cyan-600">
          <span>مشاهده جزئیات</span>
          <ChevronLeft size={16} />
        </div>
      </div>
    </Link>
  );
}
