"use client";

import React, { useState, useEffect, useCallback } from "react";

export default function RequestImageGallery({ images = [], title = "" }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // دریافت آدرس بیس از متغیر محیطی
  const baseUrl = (process.env.NEXT_PUBLIC_AVATAR_URL || "").replace(/\/+$/, "");

  // تابع کمکی برای ساخت آدرس کامل تصویر
  const getImageUrl = (url) => {
    if (!url) return "/images/no-image.webp";
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
      return url;
    }
    const cleanPath = url.startsWith("/") ? url : `/${url}`;
    return baseUrl ? `${baseUrl}${cleanPath}` : cleanPath;
  };

  const handleNext = useCallback(() => {
    if (!images || images.length === 0) return;
    setSelectedIndex((prev) => (prev + 1) % images.length);
  }, [images]);

  const handlePrev = useCallback(() => {
    if (!images || images.length === 0) return;
    setSelectedIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images]);

  // کنترل با کلیدهای کیبورد زمانی که لایت‌باکس باز است
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setLightboxOpen(false);
      } else if (e.key === "ArrowRight") {
        handlePrev(); // در محیط راست به چپ / برعکس
      } else if (e.key === "ArrowLeft") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, handleNext, handlePrev]);

  if (!images || images.length === 0) {
    return null;
  }

  const currentImage = images[selectedIndex];
  const currentImageUrl = getImageUrl(currentImage?.url);

  return (
    <div className="border-b border-slate-100 bg-gradient-to-b from-slate-900/5 via-transparent to-transparent p-4 sm:p-6">
      {/* اسلایدر تصویر اصلی */}
      <div className="relative mx-auto flex h-[280px] w-full max-w-2xl items-center justify-center overflow-hidden rounded-2xl bg-slate-950 sm:h-[380px] md:h-[430px]">
        <img
          src={currentImageUrl}
          alt={`${title} - تصویر ${selectedIndex + 1}`}
          className="h-full w-full cursor-zoom-in object-contain transition-all duration-300"
          onClick={() => setLightboxOpen(true)}
          onError={(e) => {
            e.currentTarget.src = "/images/no-image.webp";
          }}
        />

        {/* شمارنده تصویر و دکمه زوم */}
        <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
          <span className="rounded-full bg-black/60 px-3 py-1 text-xs font-bold text-white/90 backdrop-blur-md">
            {selectedIndex + 1} / {images.length}
          </span>
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white/90 backdrop-blur-md transition hover:bg-black/80"
            title="مشاهده بزرگ‌تر"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
            </svg>
          </button>
        </div>

        {/* دکمه‌های ناوبری چپ و راست اسلایدر */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute right-3.5 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition hover:bg-black/80 active:scale-95 sm:h-11 sm:w-11"
              aria-label="عکس قبلی"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="absolute left-3.5 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition hover:bg-black/80 active:scale-95 sm:h-11 sm:w-11"
              aria-label="عکس بعدی"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* تصاویر بندانگشتی (Thumbnails) زیر اسلایدر */}
      {images.length > 1 && (
        <div className="mx-auto mt-3 flex max-w-2xl items-center gap-2.5 overflow-x-auto py-1 px-0.5 no-scrollbar">
          {images.map((img, idx) => {
            const isActive = idx === selectedIndex;
            const thumbUrl = getImageUrl(img.thumbnailUrl || img.url);

            return (
              <button
                key={img.id || idx}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200 sm:h-20 sm:w-20 ${
                  isActive
                    ? "border-blue-600 ring-2 ring-blue-500/30 scale-105 shadow-md"
                    : "border-transparent opacity-60 hover:opacity-100 bg-slate-100"
                }`}
              >
                <img
                  src={thumbUrl}
                  alt={`thumbnail-${idx + 1}`}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/images/no-image.webp";
                  }}
                />
              </button>
            );
          })}
        </div>
      )}

      {/* مدال تمام‌صفحه (Lightbox) با قابلیت کامل اسلاید و تغییر تصویر */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md select-none"
          onClick={() => setLightboxOpen(false)}
        >
          {/* شمارنده و دکمه بستن */}
          <div
            className="absolute top-4 left-4 right-4 flex items-center justify-between z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-bold text-white/90 backdrop-blur">
              {selectedIndex + 1} از {images.length}
            </span>

            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20 active:scale-95"
              title="بستن (Esc)"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* دکمه قبلی در مدال */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute right-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/25 active:scale-90 sm:h-14 sm:w-14"
              aria-label="عکس قبلی"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}

          {/* تصویر اصلی در لایت‌باکس */}
          <div
            className="flex max-h-[85vh] max-w-[92vw] items-center justify-center overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              key={currentImageUrl}
              src={currentImageUrl}
              alt={title}
              className="max-h-[85vh] max-w-[92vw] rounded-xl object-contain shadow-2xl transition-opacity duration-200 animate-fadeIn"
              onError={(e) => {
                e.currentTarget.src = "/images/no-image.webp";
              }}
            />
          </div>

          {/* دکمه بعدی در مدال */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute left-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/25 active:scale-90 sm:h-14 sm:w-14"
              aria-label="عکس بعدی"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
