"use client";

import Link from "next/link";
import { Plus, FileText, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { COLORS } from "../../constants/colors";
import { authSession } from "../../lib/auth-session";


export default function Hero() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const handleClick = (e) => {
    if (!isAuthenticated) {
      e.preventDefault();
       authSession.setRedirectAfterLogin(
       window.location.pathname + window.location.search
       );
      router.push("/auth/login");
    }
  };

  return (
    <section className="w-full bg-white py-10 lg:py-14">
      <div className="mx-auto max-w-5xl px-6 sm:px-8 lg:px-10">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          {/* متن */}
          <div className="text-center lg:text-right">
            <h1 className="text-2xl font-extrabold leading-relaxed text-slate-900 lg:text-4xl">
              درخواست خریدت رو منتشر کن
              <br />
              <span style={{ color: COLORS.accent }}>
                بهترین تامین‌کننده
              </span>{" "}
              رو انتخاب کن
            </h1>

            <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-slate-500 lg:mx-0">
              بازار درخواست، پل ارتباطی بین خریداران و تامین‌کنندگان
            </p>

            <div className="mt-6 flex justify-center">
              <Link
                href="/request/create"
                onClick={handleClick}
                style={{ backgroundColor: COLORS.accent }}
                className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:opacity-95 active:scale-95"
              >
                <Plus size={16} />
                ثبت درخواست جدید
              </Link>
            </div>
          </div>

          {/* تصویر/آیکون */}
          <div className="flex justify-center">
            <div className="relative flex h-52 w-52 items-center justify-center rounded-2xl border border-slate-100 bg-white shadow-sm lg:h-64 lg:w-64">
              <FileText size={90} strokeWidth={1.2} className="text-slate-200 lg:size-[110px]" />

              <div
                style={{ backgroundColor: COLORS.accent }}
                className="absolute -bottom-2 -right-2 flex h-12 w-12 items-center justify-center rounded-full border-4 border-white"
              >
                <CheckCircle2 size={22} className="text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
