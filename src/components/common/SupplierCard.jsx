"use client";

import Link from "next/link";
import RatingStars from "./RatingStars"; 

export default function SupplierCard({ supplier }) {
  // اصلاح منطق خواندن داده‌ها بر اساس ساختار جدید بک‌اند
  const avgRating = supplier.rating?.avg; // مستقیم به avg دسترسی پیدا می‌کنیم
  const ratingCount = supplier.rating?.count ?? 0; // مستقیم به count دسترسی پیدا می‌کنیم

  const baseAvatar = process.env.NEXT_PUBLIC_AVATAR_URL;
  const avatarSrc = supplier.profile?.avatarUrl
    ? `${baseAvatar}${supplier.profile?.avatarUrl}`
    : `${baseAvatar}/uploads/avatars/avatar.webp`;

  const contactCount = supplier.contactCount || 0;
  const supplyOfferCount = supplier._count?.supplyOffers || 0;

  // فیلتر کردن اسلاگ برای جلوگیری از خطا
  const supplierId = supplier.id;

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col justify-between h-full">
      <div className="p-5 pb-3">
        <div className="flex justify-center mb-4">
          <img
            src={avatarSrc}
            alt={`تصویر پروفایل ${supplier.name || 'تأمین‌کننده'}`}
            className="w-24 h-24 rounded-full object-cover border-4 border-blue-500/40 shadow-inner"
          />
        </div>

        <div className="text-center">
          <h3 className="font-bold text-lg text-gray-800 mb-1 truncate">
            {supplier.name || "نامعلوم"}
          </h3>
          <p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto">
            {"تامین کننده "+supplier.profile.activityField || "شرکت نامعلوم"}
          </p>
        </div>

        {/* بخش امتیازدهی اصلاح شده */}
        <div className="flex items-center justify-center gap-2 mt-3">
          {avgRating && avgRating > 0 ? (
            <>
              <RatingStars rating={avgRating} starSize={16} />
              <span className="text-sm font-semibold text-gray-800">
                {Number(avgRating).toFixed(1)}
              </span>
              <span className="text-xs text-gray-400 font-medium">
                ({ratingCount} رأی)
              </span>
            </>
          ) : (
            <span className="text-xs text-gray-400">
              هنوز امتیازی ثبت نشده
            </span>
          )}
        </div>
      </div>

      <div className="p-5 pt-3 bg-gradient-to-b from-gray-50 to-white border-t border-gray-100">
        <div className="flex justify-around items-center mb-4">
          <div className="text-center">
            <span className="block font-bold text-base text-blue-600">
              {supplyOfferCount}
            </span>
            <span className="text-xs text-gray-500">پیشنهاد</span>
          </div>
          <div className="text-center">
            <span className="block font-bold text-base text-green-600">
              {contactCount}
            </span>
            <span className="text-xs text-gray-500">تماس</span>
          </div>
        </div>

        <Link
          href={`/suppliers/${supplierId}`}
          className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg transition duration-300 text-sm shadow-md"
        >
          مشاهده جزئیات
        </Link>
      </div>
    </div>
  );
}
