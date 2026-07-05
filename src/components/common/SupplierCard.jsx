"use client";

import Link from "next/link";
import RatingStars from "./RatingStars"; // فرض بر این است که این کامپوننت وجود دارد

export default function SupplierCard({ supplier }) {
  // محاسبه میانگین امتیاز و تعداد آراء
  const avgRating = supplier.rating?._avg?.score;
  const ratingCount = supplier.rating?._count?.score || supplier.rating?.count || 0; // پشتیبانی از دو فرمت احتمالی

  const baseAvatar = process.env.NEXT_PUBLIC_AVATAR_URL;
  const avatarSrc = supplier.profile?.avatarUrl
    ? `${baseAvatar}${supplier.profile?.avatarUrl}`
    : `${baseAvatar}/uploads/avatars/avatar.png`;

  // تعداد تماس‌ها و پیشنهادات
  const contactCount = supplier.contactCount || 0;
  const supplyOfferCount = supplier._count?.supplyOffers || 0;

  // تولید اسلاگ برای لینک جزئیات (با فرض وجود فیلد name یا id)
  const supplierSlug = supplier.name
    ? supplier.name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "")
    : supplier.id;

    const supplierId = supplier.id;

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col justify-between h-full">
      {/* بخش بالایی کارت: تصویر و اطلاعات اصلی */}
      <div className="p-5 pb-3">
        {/* تصویر پروفایل */}
        <div className="flex justify-center mb-4">
          <img
            src={avatarSrc} // مسیر پیش‌فرض برای آواتار
            alt={`تصویر پروفایل ${supplier.name || 'تأمین‌کننده'}`}
            className="w-24 h-24 rounded-full object-cover border-4 border-blue-500/40 shadow-inner"
            // استایل اضافه شده برای جذابیت بصری بیشتر
          />
        </div>

        {/* نام و توضیحات کوتاه */}
        <div className="text-center">
          <h3 className="font-bold text-lg text-gray-800 mb-1 truncate">
            {supplier.name || "نامعلوم"}
          </h3>
          <p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto">
            {/* در صورت نیاز می‌توانید توضیحات کوتاهی از تأمین‌کننده اضافه کنید */}
            {supplier.companyName || "شرکت نامعلوم"}
          </p>
        </div>

        {/* بخش امتیازدهی */}
        <div className="flex items-center justify-center gap-2 mt-3">
          {avgRating ? (
            <>
              <RatingStars value={avgRating} starSize={16} />
              <span className="text-sm font-semibold text-gray-800">
                {avgRating.toFixed(1)}
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

      {/* بخش پایینی کارت: آمارها و دکمه */}
      <div className="p-5 pt-3 bg-gradient-to-b from-gray-50 to-white border-t border-gray-100">
        <div className="flex justify-around items-center mb-4">
          {/* تعداد پیشنهادات */}
          <div className="text-center">
            <span className="block font-bold text-base text-blue-600">
              {supplyOfferCount}
            </span>
            <span className="text-xs text-gray-500">پیشنهاد</span>
          </div>
          {/* تعداد تماس */}
          <div className="text-center">
            <span className="block font-bold text-base text-green-600">
              {contactCount}
            </span>
            <span className="text-xs text-gray-500">تماس</span>
          </div>
        </div>

        {/* دکمه مشاهده جزئیات */}
        <Link
          href={`/suppliers/${supplierId}`} // لینک به صفحه جزئیات تأمین‌کننده
          className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg transition duration-300 text-sm shadow-md"
        >
          مشاهده جزئیات
        </Link>
      </div>
    </div>
  );
}
