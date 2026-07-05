"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, User, ArrowRight } from "lucide-react";

import Input from "../ui/Input";
import Button from "../ui/Button";
import Alert from "../ui/Alert";

import { authService } from "../../services/auth.service";
import { authSession } from "../../lib/auth-session";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../context/AuthContext";

export default function CompleteProfileForm() {
  const router = useRouter();
  const { refreshUser } = useAuth();

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    if (name.trim().length < 2) {
      setError("نام باید حداقل ۲ کاراکتر باشد");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await authService.completeProfile(name.trim());
      await refreshUser();

      const redirectUrl = authSession.getRedirectAfterLogin();
      authSession.clearRedirectAfterLogin();

      router.push(redirectUrl || "/");
    } catch (err) {
      setError(err.message || "خطا در تکمیل پروفایل");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full" dir="rtl">
      <div className="relative overflow-hidden rounded-3xl border border-gray-200/80 bg-white/95 p-6 shadow-[0_20px_60px_-25px_rgba(0,0,0,0.18)] backdrop-blur sm:p-8">
        
        {/* Gradient top strip */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-blue-50 via-sky-50/70 to-transparent" />

        <div className="relative space-y-6">
          
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              
              {/* Secure badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                <ShieldCheck className="h-4 w-4" />
                تکمیل اطلاعات کاربری
              </div>

              <div className="space-y-1">
                <h1 className="text-2xl font-black tracking-tight text-gray-950 sm:text-3xl">
                  مشخصات خود را کامل کنید
                </h1>
                <p className="text-sm leading-6 text-gray-500 sm:text-base">
                  وارد کردن نام باعث شخصی‌سازی بهتر حساب کاربری شما می‌شود.
                </p>
              </div>

            </div>

            {/* Icon right */}
            <div className="hidden h-14 w-14 items-center justify-center rounded-2xl bg-gray-950 text-white shadow-lg sm:flex">
              <User className="h-6 w-6" />
            </div>
          </div>

          {/* Input section */}
          <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 sm:p-5">
            <Input
              label="نام و نام خانوادگی"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثلاً علی رضایی"
              className="font-medium"
            />
          </div>

          {error ? <Alert message={error} /> : null}

          {/* Submit button */}
          <Button
            loading={loading}
            disabled={loading || name.trim().length < 2}
            className="w-full !rounded-2xl !py-3.5 !text-sm !font-bold sm:!text-base"
          >
            تکمیل پروفایل
          </Button>

          {/* Back link */}
          <button
            type="button"
            onClick={() => router.push(ROUTES.LOGIN)}
            className="inline-flex w-full items-center justify-center gap-2 text-center text-sm font-medium text-gray-500 transition hover:text-gray-900"
          >
            <ArrowRight className="h-4 w-4" />
            بازگشت به ورود
          </button>

        </div>
      </div>
    </form>
  );
}
