"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, RefreshCw, ArrowRight, Smartphone } from "lucide-react";

import Button from "../ui/Button";
import Alert from "../ui/Alert";

import { authService } from "../../services/auth.service";
import { authSession } from "../../lib/auth-session";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../context/AuthContext";

const OTP_LENGTH = 6;
const TIMER_SECONDS = 120;

export default function VerifyOtpForm() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const inputRefs = useRef([]);

  const [phone, setPhone] = useState("");
  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(""));
  const [secondsLeft, setSecondsLeft] = useState(TIMER_SECONDS);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");

  const code = digits.join("");
  const isCodeComplete = digits.every(Boolean);

  useEffect(() => {
    const pendingPhone = authSession.getPendingPhone();
    if (!pendingPhone) {
      router.push(ROUTES.LOGIN);
      return;
    }
    setPhone(pendingPhone);
  }, [router]);

  useEffect(() => {
    if (secondsLeft <= 0) return;

    const timer = setInterval(() => {
      setSecondsLeft((s) => s - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft]);

  function formatTimer(totalSeconds) {
    const m = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
    const s = String(totalSeconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  }

  function handleDigitChange(index, value) {
    const digit = value.replace(/\D/g, "").slice(-1);

    const nextDigits = [...digits];
    nextDigits[index] = digit;
    setDigits(nextDigits);
    setError("");

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index, event) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(event) {
    event.preventDefault();

    const text = event.clipboardData.getData("text").replace(/\D/g, "");
    if (!text) return;

    const next = Array(OTP_LENGTH).fill("");
    text
      .slice(0, OTP_LENGTH)
      .split("")
      .forEach((d, i) => (next[i] = d));

    setDigits(next);
    setError("");

    const last = Math.min(text.length - 1, OTP_LENGTH - 1);
    inputRefs.current[last]?.focus();
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!isCodeComplete) {
      setError("کد تأیید را کامل وارد کنید");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await authService.verifyOtp(phone, code);

      authSession.clearPendingPhone();

      await refreshUser();

      const redirectUrl = authSession.getRedirectAfterLogin();
      authSession.clearRedirectAfterLogin();

      if (data.needsProfileCompletion) {
        router.push(ROUTES.COMPLETE_PROFILE);
      } else {
        router.push(redirectUrl || "/");
      }
    } catch (err) {
      setError(err.message || "خطا در تایید کد");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (secondsLeft > 0 || resending) return;

    try {
      setResending(true);
      setError("");

      await authService.sendOtp(phone);

      setDigits(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
      setSecondsLeft(TIMER_SECONDS);
    } catch (err) {
      setError(err.message || "خطا در ارسال مجدد کد");
    } finally {
      setResending(false);
    }
  }

  function handleWrongNumber() {
    authSession.clearPendingPhone();
    router.push(ROUTES.LOGIN);
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
                تأیید امن ورود
              </div>

              <div className="space-y-1">
                <h1 className="text-2xl font-black tracking-tight text-gray-950 sm:text-3xl">
                  کد تأیید را وارد کنید
                </h1>
                <p className="text-sm leading-6 text-gray-500 sm:text-base">
                  کد ۶ رقمی ارسال‌شده به شماره زیر را وارد کنید.
                </p>
              </div>
            </div>

            <div className="hidden h-14 w-14 items-center justify-center rounded-2xl bg-gray-950 text-white shadow-lg sm:flex">
              <Smartphone className="h-6 w-6" />
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/80 bg-white/80 px-4 py-3">
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500">شماره دریافت‌کننده کد</p>
                <p className="text-sm font-bold tracking-[0.08em] text-gray-900 sm:text-base" dir="ltr">
                  {phone}
                </p>
              </div>

              <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-4 flex justify-center gap-2 sm:gap-3" dir="ltr">
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="h-12 w-12 rounded-2xl border border-gray-200 bg-white text-center text-xl font-black text-gray-950 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100 sm:h-14 sm:w-14 sm:text-2xl"
                />
              ))}
            </div>
          </div>

          {error ? <Alert message={error} /> : null}

          <div className="rounded-2xl border border-gray-100 bg-gray-50/80 px-4 py-3 text-center text-sm text-gray-600">
            {secondsLeft > 0 ? (
              <div>
                ارسال مجدد کد تا{" "}
                <span className="font-extrabold tracking-wider text-gray-950">
                  {formatTimer(secondsLeft)}
                </span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="inline-flex items-center gap-2 font-semibold text-blue-600 transition hover:text-blue-700 disabled:opacity-50"
              >
                <RefreshCw className="h-4 w-4" />
                {resending ? "در حال ارسال..." : "ارسال مجدد کد"}
              </button>
            )}
          </div>

          <Button
            loading={loading}
            disabled={!isCodeComplete}
            className="w-full !rounded-2xl !py-3.5 !text-sm !font-bold sm:!text-base"
          >
            تایید کد
          </Button>

          <button
            type="button"
            onClick={handleWrongNumber}
            className="inline-flex w-full items-center justify-center gap-2 text-center text-sm font-medium text-gray-500 transition hover:text-gray-900"
          >
            <ArrowRight className="h-4 w-4" />
            شماره موبایل اشتباه است؟
          </button>
        </div>
      </div>
    </form>
  );
}
