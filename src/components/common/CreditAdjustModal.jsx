"use client";

import { useState } from "react";

export default function CreditAdjustModal({
  open,
  onClose,
  onSubmit,
  targetLabel, // مثلاً نام کاربر یا "همه کاربران"
}) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const numericAmount = Number(amount);

    if (!Number.isInteger(numericAmount) || numericAmount === 0) {
      setError("مقدار باید یک عدد صحیح و غیر صفر باشد");
      return;
    }

    if (!description.trim()) {
      setError("وارد کردن توضیحات الزامی است");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(numericAmount, description.trim());
      setAmount("");
      setDescription("");
      onClose();
    } catch (err) {
      setError(err.message || "خطایی رخ داد");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (submitting) return;
    setAmount("");
    setDescription("");
    setError("");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      dir="rtl"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold mb-1">تغییر اعتبار</h3>
        <p className="text-sm text-gray-500 mb-4">{targetLabel}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              مقدار (برای کسر عدد منفی وارد کنید)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="مثلاً 5 یا -3"
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              توضیحات
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="دلیل تغییر اعتبار را وارد کنید..."
              rows={3}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm transition disabled:opacity-50"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm transition disabled:opacity-50"
            >
              {submitting ? "در حال ثبت..." : "ثبت"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}