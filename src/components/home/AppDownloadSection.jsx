import React from "react";

const APP_DOWNLOAD_URL =
  "https://darkhastyab.com/uploads/application/v1/app-release.apk";

function DownloadIcon({ className = "h-5 w-5" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="M7 10l5 5 5-5" />
      <path d="M12 15V3" />
    </svg>
  );
}

function AndroidIcon({ className = "h-6 w-6" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M17.523 15.34a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5m-11.046 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5m11.405-6.02.976-1.69a.406.406 0 0 0-.703-.406l-.988 1.712a8.53 8.53 0 0 0-7.334 0L8.845 7.224a.406.406 0 1 0-.703.406l.976 1.69C7.03 10.44 5.55 12.5 5.3 15h13.4c-.25-2.5-1.73-4.56-3.772-5.68" />
    </svg>
  );
}

export default function AppDownloadSection() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-cyan-100/80 bg-gradient-to-br from-[#0B192C] via-[#0f2038] to-[#0B192C] p-6 shadow-lg sm:p-8">
      {/* دایره‌های دکوراتیو پس‌زمینه */}
      <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-cyan-500/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-14 -right-10 h-48 w-48 rounded-full bg-blue-500/10 blur-2xl" />

      <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:text-right">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-400 ring-1 ring-cyan-400/30">
            <AndroidIcon className="h-8 w-8" />
          </div>

          <div>
            <h2 className="text-lg font-black text-white sm:text-xl">
              اپلیکیشن درخواست یاب را نصب کنید
            </h2>
            <p className="mt-1.5 max-w-md text-xs font-medium leading-6 text-slate-300 sm:text-sm sm:leading-7">
              با نصب اپلیکیشن اندروید، سریع‌تر به درخواست‌ها دسترسی داشته باشید،
              از پیشنهادهای جدید مطلع شوید و بدون نیاز به مرورگر با
              تأمین‌کنندگان در ارتباط باشید.
            </p>
          </div>
        </div>

        
         <a href={APP_DOWNLOAD_URL}
          download
          className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-7 py-3.5 text-sm font-black text-white shadow-lg shadow-cyan-500/20 transition hover:from-cyan-400 hover:to-blue-400 active:scale-[0.98] sm:w-auto"
        >
          <DownloadIcon className="h-5 w-5" />
          <span>دانلود اپلیکیشن (APK)</span>
        </a>
      </div>
    </div>
  );
}