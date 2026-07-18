// app/layout.jsx

import { AuthProvider } from "../context/AuthContext"; // مطمئن شوید مسیر درست است
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import "../app/globals.css";

/**
 * متادیتاهای سراسری و پایه (Global Metadata) برای کل وب‌سایت.
 * Next.js از این اطلاعات برای تولید تگ‌های متا در بخش head تمام صفحات استفاده می‌کند.
 */
export const metadata = {
  // تنظیم آدرس پایه برای تولید لینک‌های مطلق سئو (مانند Canonical و تصاویر Open Graph)
  metadataBase: new URL("https://darkhastyab.com"),

  // ساختار پیش‌فرض و الگو برای عناوین صفحات داخلی
  title: {
    default: "درخواست یاب | سامانه ثبت درخواست خرید و استعلام قیمت کالا",
    template: "%s | درخواست یاب",
  },

  description:
    "درخواست یاب، پلتفرم B2B ثبت درخواست خرید کالا و خدمات است. به سادگی استعلام قیمت بگیرید، پیشنهاد تأمین‌کنندگان را دریافت کنید و بهترین تأمین‌کننده را بیابید.",

  applicationName: "درخواست یاب",

  authors: [
    {
      name: "درخواست یاب",
      url: "https://darkhastyab.com",
    },
  ],

  creator: "درخواست یاب",
  publisher: "درخواست یاب",

  // جلوگیری از فرمت‌دهی خودکار شماره تماس‌ها و آدرس‌ها توسط مرورگرهای موبایل
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

/**
 * پیکربندی نمایش اولیه در مرورگر
 */
export const viewport = {
  themeColor: "#0f172a", // رنگ سرمه‌ای متناسب با هویت برند
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl" className="scroll-smooth">
      {/* 
        توجه: در App Router نیازی به نوشتن دستی تگ <head> نیست. 
        Next.js متادیتاها را به صورت خودکار در head قرار می‌دهد.
      */}
      <body className="flex min-h-screen flex-col bg-slate-50 text-slate-900 antialiased">
        <AuthProvider>
          {/* هدر وب‌سایت در بالاترین سطح */}
          <Header />
          
          {/* 
            بخش اصلی محتوا. 
            استفاده از flex-grow باعث می‌شود فوتر همیشه در پایین صفحه (حتی در صفحات کم‌محتوا) قرار بگیرد.
          */}
          <main className="flex-grow">
            {children}
          </main>
          
          {/* فوتر وب‌سایت */}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
