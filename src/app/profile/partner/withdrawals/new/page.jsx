"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../../../../../lib/api2";
import PageHeader from "../../../../../components/ui/PageHeader";

const MIN_AMOUNT = 100000;

const toEnglishDigits = (value = "") =>
  String(value)
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));

const normalizeCardNumber = (value = "") =>
  toEnglishDigits(value).replace(/[^\d]/g, "").slice(0, 16);

const formatCardNumber = (value = "") =>
  normalizeCardNumber(value).replace(/(\d{4})(?=\d)/g, "$1-");

export default function NewWithdrawalPage() {
  const router = useRouter();

  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState("");

  // bankName فعلاً در بک‌اند ذخیره نمی‌شود؛ فقط برای UI نگه داشته شده است.
  const [bankInfo, setBankInfo] = useState({
    cardNumber: "",
    bankName: "",
    accountHolder: "",
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadWallet = async () => {
      try {
        const response = await apiFetch("/partner/wallet");

        const walletBalance = Number(
          response?.data?.balance ?? response?.balance ?? 0
        );

        setBalance(Number.isFinite(walletBalance) ? walletBalance : 0);
      } catch {
        setBalance(0);
      } finally {
        setLoading(false);
      }
    };

    loadWallet();
  }, []);

  const amountNum = useMemo(() => {
    const normalizedAmount = toEnglishDigits(amount).replace(/[^\d]/g, "");
    return Number(normalizedAmount) || 0;
  }, [amount]);

  const normalizedCardNumber = useMemo(
    () => normalizeCardNumber(bankInfo.cardNumber),
    [bankInfo.cardNumber]
  );

  const cardHolderName = bankInfo.accountHolder.trim();

  const exceedsBalance = amountNum > balance;
  const belowMinimum = amountNum > 0 && amountNum < MIN_AMOUNT;
  const invalidCardNumber =
    bankInfo.cardNumber.length > 0 && normalizedCardNumber.length !== 16;
  const invalidCardHolder =
    bankInfo.accountHolder.length > 0 && cardHolderName.length < 3;

  const isFormInvalid =
    amountNum <= 0 ||
    exceedsBalance ||
    belowMinimum ||
    normalizedCardNumber.length !== 16 ||
    cardHolderName.length < 3;

  const handleAmountChange = (event) => {
    setError("");
    setAmount(toEnglishDigits(event.target.value).replace(/[^\d]/g, ""));
  };

  const handleCardNumberChange = (event) => {
    setError("");

    setBankInfo((previous) => ({
      ...previous,
      cardNumber: formatCardNumber(event.target.value),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (amountNum < MIN_AMOUNT) {
      setError("حداقل مبلغ قابل برداشت ۱۰۰,۰۰۰ تومان است.");
      return;
    }

    if (amountNum > balance) {
      setError("مبلغ درخواستی از موجودی قابل برداشت بیشتر است.");
      return;
    }

    if (normalizedCardNumber.length !== 16) {
      setError("شماره کارت باید دقیقاً ۱۶ رقم باشد.");
      return;
    }

    if (cardHolderName.length < 3) {
      setError("نام صاحب کارت باید حداقل ۳ کاراکتر باشد.");
      return;
    }

    setSubmitting(true);

    try {
      // بک‌اند فیلدهای تخت (flat) می‌خواهد؛ bankInfo ارسال نمی‌شود.
      const payload = {
        amount: amountNum,
        cardNumber: normalizedCardNumber,
        cardHolderName,
      };

      await apiFetch("/partner/withdrawals", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      router.push("/profile/partner/withdrawals");
    } catch (err) {
      setError(err?.message || "ثبت درخواست برداشت با خطا مواجه شد.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-sm text-slate-400">
        در حال بارگذاری…
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="ثبت درخواست برداشت"
        description="حداقل مبلغ قابل برداشت ۱۰,۰۰۰ تومان است"
      />

      <div className="mb-6 rounded-2xl border border-cyan-100 bg-cyan-50 p-4">
        <p className="text-sm text-slate-600">
          موجودی قابل برداشت:{" "}
          <span className="font-black text-cyan-700">
            {balance.toLocaleString("fa-IR")} تومان
          </span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
        <div>
          <label
            htmlFor="amount"
            className="mb-1 block text-xs font-medium text-slate-600"
          >
            مبلغ برداشت (تومان)
          </label>

          <input
            id="amount"
            required
            inputMode="numeric"
            type="text"
            value={amount}
            onChange={handleAmountChange}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-cyan-400"
            placeholder="مثال: 500000"
          />

          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setError("");
                setAmount(String(balance));
              }}
              disabled={balance <= 0}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              کل موجودی
            </button>

            <button
              type="button"
              onClick={() => {
                setError("");
                setAmount(String(MIN_AMOUNT));
              }}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 transition hover:bg-slate-200"
            >
              حداقل مبلغ
            </button>
          </div>

          {exceedsBalance && (
            <p className="mt-1 text-xs text-red-500">
              مبلغ درخواستی از موجودی بیشتر است.
            </p>
          )}

          {belowMinimum && (
            <p className="mt-1 text-xs text-amber-600">
              حداقل مبلغ قابل برداشت ۱۰,۰۰۰ تومان است.
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="cardHolderName"
            className="mb-1 block text-xs font-medium text-slate-600"
          >
            نام صاحب کارت
          </label>

          <input
            id="cardHolderName"
            required
            minLength={3}
            value={bankInfo.accountHolder}
            onChange={(event) => {
              setError("");
              setBankInfo((previous) => ({
                ...previous,
                accountHolder: event.target.value,
              }));
            }}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-cyan-400"
            placeholder="مثال: علی رضایی"
          />

          {invalidCardHolder && (
            <p className="mt-1 text-xs text-red-500">
              نام صاحب کارت باید حداقل ۳ کاراکتر باشد.
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="cardNumber"
            className="mb-1 block text-xs font-medium text-slate-600"
          >
            شماره کارت
          </label>

          <input
            id="cardNumber"
            required
            dir="ltr"
            inputMode="numeric"
            autoComplete="cc-number"
            value={bankInfo.cardNumber}
            onChange={handleCardNumberChange}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-left text-sm outline-none transition focus:border-cyan-400"
            placeholder="6219-8619-1234-5678"
          />

          {invalidCardNumber && (
            <p className="mt-1 text-xs text-red-500">
              شماره کارت باید دقیقاً ۱۶ رقم باشد.
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="bankName"
            className="mb-1 block text-xs font-medium text-slate-600"
          >
            نام بانک{" "}
            <span className="font-normal text-slate-400">(اختیاری)</span>
          </label>

          <input
            id="bankName"
            value={bankInfo.bankName}
            onChange={(event) =>
              setBankInfo((previous) => ({
                ...previous,
                bankName: event.target.value,
              }))
            }
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-cyan-400"
            placeholder="مثال: ملت"
          />

          <p className="mt-1 text-xs text-slate-400">
            نام بانک در نسخه فعلی توسط بک‌اند ذخیره نمی‌شود.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600"
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || isFormInvalid}
          className="w-full rounded-xl bg-cyan-500 py-3 text-sm font-bold text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "در حال ثبت درخواست…" : "ثبت درخواست برداشت"}
        </button>
      </form>
    </div>
  );
}
