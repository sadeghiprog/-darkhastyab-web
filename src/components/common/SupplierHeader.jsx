"use client";

import { useEffect, useState } from "react";
import RatingStars from "./RatingStars";

export default function SupplierHeader({ supplier }) {
  const [hasAccess, setHasAccess] = useState(!!supplier?.hasContactAccess);
  const [phone, setPhone] = useState(supplier?.hasContactAccess ? supplier.phone : null);
  const [selectedRate, setSelectedRate] = useState(supplier?.myRating || 0);
  const [loading, setLoading] = useState(false);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);

  const baseAvatar = process.env.NEXT_PUBLIC_AVATAR_URL;
  const avatarSrc = supplier.profile?.avatarUrl
    ? `${baseAvatar}${supplier.profile?.avatarUrl}`
    : `${baseAvatar}/uploads/avatars/avatar.webp`;

  useEffect(() => {
    if (supplier) {
      setHasAccess(!!supplier.hasContactAccess);
      setPhone(supplier.hasContactAccess ? supplier.phone : null);
      setSelectedRate(supplier.myRating || 0);
    }
  }, [supplier]);

  async function handleContact() {
    if (loading) return;

    const confirmAction = window.confirm(
      "یک اعتبار از کیف پول شما کسر می‌شود. آیا مایل به ادامه هستید؟"
    );

    if (!confirmAction) return;

    try {
      setLoading(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/supplier-profile/${supplier.id}/contact`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "خطا در برقراری ارتباط");
        return;
      }

      setPhone(data.phone);
      setHasAccess(true);

      if (data.alreadyPurchased) {
        alert("اطلاعات تماس این تامین‌کننده قبلاً برای شما آزاد شده است.");
      }
    } catch {
      alert("خطا در اتصال به سرور");
    } finally {
      setLoading(false);
    }
  }

  async function submitRating(score) {
    if (ratingLoading) return;

    try {
      setRatingLoading(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/supplier-profile/${supplier.id}/rate`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ score }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "خطا در ثبت امتیاز");
        return;
      }

      setSelectedRate(score);
    } catch {
      alert("خطا در ثبت امتیاز");
    } finally {
      setRatingLoading(false);
    }
  }

  const companyName = supplier.profile?.companyName || supplier.name;
  const activityField = supplier.profile?.activityField;

  return (
    <div className="relative overflow-hidden bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm transition-all duration-300 hover:shadow-md">
      {/* دکوراسیون پس‌زمینه ملایم */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-cyan-50/50 rounded-full blur-2xl -z-10" />

      <div className="flex flex-col md:flex-row items-center md:items-start lg:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 w-full md:w-auto">
          {/* بخش تصویر آواتار با افکت سایه و هاور */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full blur opacity-15 group-hover:opacity-30 transition duration-300" />
            <img
              src={avatarSrc}
              className="relative w-24 h-24 rounded-full object-cover border-2 border-white shadow-inner bg-slate-50"
              alt={`لوگو شرکت ${companyName}`}
            />
          </div>

          <div className="text-center sm:text-right space-y-1.5">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                {companyName}
              </h1>
              {supplier.profile?.companyRegNo && (
                <span className="bg-slate-100 text-slate-600 text-xs px-2.5 py-0.5 rounded-full font-medium">
                  ثبت شده
                </span>
              )}
            </div>

            {/* امتیازدهی عمومی */}
            <div 
              className="flex items-center justify-center sm:justify-start gap-2"
              aria-label={`امتیاز میانگین ${supplier.rating?.avg || 0} از ۵ براساس ${supplier.rating?.count || 0} رای`}
            >
              <RatingStars rating={supplier.rating?.avg || 0} />
              <span className="text-xs text-slate-400 font-medium">
                ({supplier.rating?.count || 0} امتیاز خریداران)
              </span>
            </div>

            {/* حوزه فعالیت - اضافه شده دقیقا زیر ستاره‌ها */}
            {activityField && (
              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-slate-500 py-0.5">
                <span className="font-medium text-slate-400">حوزه فعالیت:</span>
                <span className="font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-md">
                  تامین‌کننده {activityField}
                </span>
              </div>
            )}

            <div className="flex flex-wrap justify-center sm:justify-start items-center gap-x-4 gap-y-1 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                {supplier.offersCount || 0} پیشنهاد فعال
              </span>
              {supplier.profile?.address && (
                <span className="flex items-center gap-1 text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                  {supplier.profile.address.length > 35
                    ? `${supplier.profile.address.slice(0, 35)}...`
                    : supplier.profile.address}
                </span>
              )}
            </div>

            {/* بخش امتیازدهی کاربر در صورت خرید دسترسی */}
            {hasAccess && (
              <div className="mt-4 pt-3 border-t border-slate-100 inline-block">
                <p className="text-xs text-slate-400 mb-1.5 text-right">
                  ثبت امتیاز شما به این تامین‌کننده:
                </p>
                <div 
                  className="flex items-center justify-center sm:justify-start gap-1"
                  role="group" 
                  aria-label="رتبه‌دهی به تامین‌کننده"
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      disabled={ratingLoading}
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(0)}
                      onClick={() => submitRating(star)}
                      className="transition transform active:scale-95 hover:scale-110 focus:outline-none disabled:opacity-50"
                      aria-label={`ثبت امتیاز ${star} ستاره`}
                    >
                      <svg
                        className={`w-6 h-6 transition-colors duration-150 ${
                          (hoveredStar || selectedRate) >= star
                            ? "text-amber-400 fill-amber-400"
                            : "text-slate-200 fill-none"
                        }`}
                        stroke="currentColor"
                        strokeWidth="1.5"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.955a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.955c.3.921-.755 1.688-1.538 1.118l-3.37-2.448a1 1 0 00-1.176 0l-3.37 2.448c-.783.57-1.838-.197-1.538-1.118l1.287-3.955a1 1 0 00-.364-1.118L2.075 9.382c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.274-3.955z" />
                      </svg>
                    </button>
                  ))}
                  {ratingLoading && (
                    <span className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mr-2" />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* دکمه اکشن یا نمایش اطلاعات تماس */}
        <div className="w-full md:w-auto text-center md:text-left mt-2 md:mt-0">
          {hasAccess && phone ? (
            <div className="bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 inline-block w-full sm:w-auto">
              <span className="block text-xs font-semibold text-slate-400 mb-1">
                شماره تماس مستقیم تامین‌کننده
              </span>
              <a
                href={`tel:${phone}`}
                className="block font-black text-xl text-cyan-600 hover:text-cyan-700 tracking-widest hover:underline transition-all"
                style={{ direction: "ltr" }}
              >
                {phone}
              </a>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleContact}
              disabled={loading}
              className="relative w-full sm:w-auto group overflow-hidden bg-cyan-600 hover:bg-cyan-700 text-white font-bold px-6 py-3 rounded-2xl text-sm transition-all duration-300 active:scale-98 shadow-sm hover:shadow-cyan-100 hover:shadow-lg disabled:opacity-75 flex items-center justify-center gap-2 mx-auto"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>در حال آزادسازی...</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4 text-cyan-100"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <span>دریافت اطلاعات تماس</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
