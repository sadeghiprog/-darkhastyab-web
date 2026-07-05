"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Smartphone, ShieldCheck } from "lucide-react";

import Input from "../ui/Input";
import Button from "../ui/Button";
import Alert from "../ui/Alert";

import { authService } from "../../services/auth.service";
import { authSession } from "../../lib/auth-session";
import { ROUTES } from "../../constants/routes";

function toEnglishDigits(value) {
  return String(value || "").replace(/[۰-۹]/g, (digit) =>
    String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit))
  );
}

export default function LoginForm() {
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    const rawVal = e.target.value;
    const cleanVal = toEnglishDigits(rawVal).replace(/\D/g, "").slice(0, 11);
    setPhone(cleanVal);
    if (error) setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!/^09\d{9}$/.test(phone)) {
      setError("لطفاً شماره موبایل را درست وارد کنید");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await authService.sendOtp(phone);
      authSession.setPendingPhone(phone);

      router.push(ROUTES.VERIFY);
    } catch (err) {
      setError(err.message || "خطا در ارسال کد");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full" dir="rtl">
      <div className="relative overflow-hidden rounded-3xl border border-gray-200/80 bg-white/95 p-6 shadow-[0_20px_60px_-25px_rgba(0,0,0,0.18)] backdrop-blur sm:p-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-blue-50 via-sky-50/70 to-transparent" />

        <div className="relative space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                <ShieldCheck className="h-4 w-4" />
                ورود امن با کد تأیید
              </div>

              <div className="space-y-1">
                <h1 className="text-2xl font-black tracking-tight text-gray-950 sm:text-3xl">
                  ورود به حساب کاربری
                </h1>
                <p className="text-sm leading-6 text-gray-500 sm:text-base">
                  شماره موبایل خود را وارد کنید تا کد تأیید برای شما ارسال شود.
                </p>
              </div>
            </div>

            <div className="hidden h-14 w-14 items-center justify-center rounded-2xl bg-gray-950 text-white shadow-lg sm:flex">
              <Smartphone className="h-6 w-6" />
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 sm:p-5">
            <Input
              label="شماره موبایل"
              value={phone}
              onChange={handleChange}
              placeholder="09123456789"
              dir="ltr"
              inputMode="numeric"
              maxLength={11}
              autoFocus
              className="text-left text-base font-semibold tracking-[0.08em]"
            />
          </div>

          {error ? <Alert message={error} /> : null}

          <Button loading={loading} disabled={loading} className="w-full !rounded-2xl !py-3.5 !text-sm !font-bold sm:!text-base">
            ارسال کد تایید
          </Button>

          <div className="flex items-center justify-center gap-2 text-center text-xs leading-6 text-gray-400 sm:text-sm">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <span>کد تأیید فقط برای احراز هویت و ورود امن استفاده می‌شود.</span>
          </div>
        </div>
      </div>
    </form>
  );
}
