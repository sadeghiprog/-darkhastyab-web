"use client";

import { CheckCircle, UserPlus, FilePlus2, Factory, BadgeCheck, Phone, Sparkles } from "lucide-react";

export default function GuidePage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-16 space-y-20" dir="rtl">
      
      {/* هدر صفحه */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black text-slate-800">
          راهنمای استفاده از پلتفرم
        </h1>
        <p className="text-slate-500 text-sm leading-relaxed max-w-md mx-auto">
          در این صفحه تمام مراحل استفاده از پلتفرم (از ثبت‌نام تا دریافت پیشنهاد قیمت) را به صورت کامل و تصویری مرور می‌کنیم.
        </p>
      </div>

      {/* بخش 1 - معرفی */}
      <Section 
        icon={<Sparkles size={32} className="text-cyan-600" />}
        title="معرفی پلتفرم"
        content="این پلتفرم خریداران را به تأمین‌کنندگان واقعی کالا و خدمات متصل می‌کند. شما می‌توانید درخواست خرید ثبت کنید، پیشنهاد قیمت بگیرید، یا به عنوان تأمین‌کننده ثبت‌نام کرده و مشتری جذب کنید."
      />

      {/* بخش 2 - ثبت نام */}
      <Section
        icon={<UserPlus size={32} className="text-cyan-600" />}
        title="مرحله ۱: ثبت‌نام / ورود"
        content={
          <>
            <p>برای ورود فقط به یک شماره موبایل نیاز دارید:</p>
            <ul className="list-disc pr-5 space-y-1 text-slate-600">
              <li>شماره موبایل خود را وارد کنید</li>
              <li>کد یکبار مصرف (OTP) برای شما ارسال می‌شود</li>
              <li>پس از تایید وارد پنل کاربری می‌شوید</li>
            </ul>
          </>
        }
      />

      {/* بخش 3 - ثبت درخواست */}
      <Section
        icon={<FilePlus2 size={32} className="text-cyan-600" />}
        title="مرحله ۲: ثبت درخواست خرید"
        content={
          <>
            <p>اگر خریدار هستید:</p>
            <ul className="list-disc pr-5 space-y-1 text-slate-600">
              <li>به صفحه «ثبت درخواست» بروید</li>
              <li>عنوان کالا/خدمت را وارد کنید</li>
              <li>عکس، توضیحات، فایل یا مشخصات را اضافه کنید</li>
              <li>درخواست شما منتشر می‌شود و تامین‌کنندگان آن را می‌بینند</li>
            </ul>
          </>
        }
      />

      {/* بخش 4 - تامین‌کننده شدن */}
      <Section
        icon={<Factory size={32} className="text-cyan-600" />}
        title="مرحله ۳: درخواست تأمین‌کننده شدن"
        content={
          <>
            <p>اگر تولیدکننده یا فروشنده هستید:</p>
            <ul className="list-disc pr-5 space-y-1 text-slate-600">
              <li>به بخش «تأمین‌کننده شوید» بروید</li>
              <li>اطلاعات کسب‌وکار خود را ثبت کنید</li>
              <li>پس از تایید، دسترسی به پنل تامین‌کنندگان فعال می‌شود</li>
            </ul>
          </>
        }
      />

      {/* بخش 5 - ثبت پیشنهاد */}
      <Section
        icon={<BadgeCheck size={32} className="text-cyan-600" />}
        title="مرحله ۴: ثبت پیشنهاد قیمت"
        content={
          <>
            <p>تامین‌کنندگان می‌توانند روی درخواست‌ها پیشنهاد ارسال کنند:</p>
            <ul className="list-disc pr-5 space-y-1 text-slate-600">
              <li>قیمت، شرایط، توضیحات یا فایل فنی ارسال کنید</li>
              <li>خریدار پیشنهاد شما را می‌بیند و تصمیم می‌گیرد</li>
              <li>با افزایش اعتبار حساب می‌توانید اطلاعات تماس را ببینید</li>
            </ul>
          </>
        }
      />

      {/* بخش 6 - اطلاعات تماس */}
      <div className="rounded-3xl border border-slate-200 bg-white/70 backdrop-blur-lg p-10 shadow-xl space-y-5">
        <div className="flex items-center gap-3">
          <Phone className="text-cyan-600" size={30} />
          <h2 className="text-2xl font-extrabold text-slate-800">اطلاعات تماس پشتیبانی</h2>
        </div>
        <p className="text-slate-600 text-sm leading-relaxed">
          هر زمان نیاز به کمک داشتید، تیم پشتیبانی کنار شماست.
        </p>

        <div className="space-y-2 text-slate-700 text-sm">
          <p>• موبایل: <strong>0912-000-0000</strong></p>
          <p>• واتساپ: <strong>0912-000-0000</strong></p>
          <p>• ایمیل: <strong>support@example.com</strong></p>
        </div>
      </div>
    </div>
  );
}



function Section({ icon, title, content }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white/70 backdrop-blur-xl p-10 shadow-xl space-y-6 transition-all hover:shadow-2xl hover:-translate-y-1">
      <div className="flex items-center gap-4">
        {icon}
        <h2 className="text-2xl font-extrabold text-slate-800">{title}</h2>
      </div>
      <div className="text-slate-600 text-sm leading-7">{content}</div>
    </div>
  );
}
