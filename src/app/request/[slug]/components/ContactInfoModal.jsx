"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function ContactInfoModal({
  open,
  contactName,
  contactPhone,
  onClose,
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;

    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = oldOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  const hasPhone =
    contactPhone &&
    contactPhone !== "—" &&
    contactPhone.trim() !== "";

  const phoneNumber = hasPhone
    ? contactPhone.replace(/[^\d+]/g, "")
    : "";

  const handleCopyPhone = async () => {
    if (!hasPhone) return;

    try {
      await navigator.clipboard.writeText(contactPhone);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = contactPhone;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";

      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return createPortal(
    <div
      dir="rtl"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* پس‌زمینه */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* بدنه مودال */}
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl animate-contact-modal">
        {/* هدر */}
        <div className="bg-gradient-to-l from-emerald-600 to-teal-500 px-6 py-7 text-center text-white">
          <button
            type="button"
            onClick={onClose}
            className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-xl transition hover:bg-white/30"
            aria-label="بستن"
          >
            ×
          </button>

          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-3xl">
            ☎
          </div>

          <h2 className="text-xl font-extrabold">
            اطلاعات تماس 
          </h2>

          <p className="mt-2 text-sm text-white/80">
            اطلاعات تماس با موفقیت دریافت شد
          </p>
        </div>

        {/* محتوا */}
        <div className="space-y-4 p-5">
          {/* نام تامین‌کننده */}
          <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xl">
              👤
            </div>

            <div className="min-w-0">
              <p className="text-xs text-slate-400">
                نام کاربر
              </p>

              <p className="mt-1 truncate text-base font-bold text-slate-800">
                {contactName || "—"}
              </p>
            </div>
          </div>

          {/* شماره تماس */}
          <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xl">
              📞
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs text-slate-400">
                شماره تماس
              </p>

              <p
                dir="ltr"
                className="mt-1 text-left text-xl font-extrabold tracking-wider text-slate-800"
              >
                {contactPhone || "—"}
              </p>
            </div>

            {hasPhone && (
              <button
                type="button"
                onClick={handleCopyPhone}
                className="rounded-xl bg-white px-3 py-2 text-sm font-bold text-slate-600 shadow-sm ring-1 ring-slate-200 transition hover:text-emerald-600"
              >
                {copied ? "کپی شد ✓" : "کپی"}
              </button>
            )}
          </div>

          {/* دکمه تماس */}
          {hasPhone ? (
            <a
              href={`tel:${phoneNumber}`}
              onClick={onClose}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-emerald-600 to-teal-500 py-4 text-base font-extrabold text-white shadow-lg shadow-emerald-500/25 transition hover:brightness-110 active:scale-[0.98]"
            >
              <span className="text-xl">📞</span>
              تماس 
            </a>
          ) : (
            <div className="rounded-2xl bg-slate-100 py-4 text-center font-bold text-slate-400">
              شماره تماسی ثبت نشده است
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-2xl py-3 text-sm font-bold text-slate-500 transition hover:bg-slate-100"
          >
            بستن
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes contactModalAnimation {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-contact-modal {
          animation: contactModalAnimation 0.25s ease-out;
        }
      `}</style>
    </div>,
    document.body
  );
}
