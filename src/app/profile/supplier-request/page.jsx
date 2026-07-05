"use client";

import { useEffect, useState } from "react";

export default function SupplierRequestTab({ userStatus }) {
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const API = process.env.NEXT_PUBLIC_API_URL;

  const fetchMyRequest = async () => {
    try {
      setLoading(true);
      setError("");

      

      const res = await fetch(`${API}/supplier-requests/me`, {
        method: "GET",
       credentials: "include",
      });

      if (!res.ok) {
        throw new Error("دریافت اطلاعات درخواست با خطا مواجه شد.");
      }

      const data = await res.json();
      setRequest(data?.supplierRequest || null);
    } catch (err) {
      setError(err.message || "خطایی رخ داده است.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRequest = async () => {
    try {
      setSubmitting(true);
      setError("");
      setSuccessMessage("");

     const res = await fetch(`${API}/supplier-requests/me`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "ثبت درخواست با خطا مواجه شد.");
      }

      setRequest(data?.supplierRequest || null);
      setSuccessMessage(data?.message || "درخواست شما با موفقیت ثبت شد.");
    } catch (err) {
      setError(err.message || "خطایی رخ داده است.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchMyRequest();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <p className="text-sm text-gray-500">در حال بارگذاری...</p>
      </div>
    );
  }

  if (userStatus === "SUPPLIER") {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-6">
        <h3 className="text-lg font-semibold text-green-700">
          شما تامین‌کننده هستید
        </h3>
        <p className="mt-2 text-sm text-green-700/80">
          حساب کاربری شما به عنوان تامین‌کننده تایید شده است.
        </p>
      </div>
    );
  }

  if (userStatus === "ADMIN") {
    return (
      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6">
        <h3 className="text-lg font-semibold text-blue-700">
          حساب مدیر سیستم
        </h3>
        <p className="mt-2 text-sm text-blue-700/80">
          شما مدیر سیستم هستید و نیازی به ثبت درخواست تامین‌کننده شدن ندارید.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900">
          درخواست تامین‌کننده شدن
        </h2>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          اگر تمایل دارید به عنوان تامین‌کننده در پلتفرم فعالیت کنید، می‌توانید
          درخواست خود را ثبت کنید. پس از بررسی توسط مدیریت، نتیجه از همین بخش
          قابل مشاهده خواهد بود.
        </p>
      </div>

      {error ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {successMessage ? (
        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMessage}
        </div>
      ) : null}

      {!request && (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                هنوز درخواستی ثبت نکرده‌اید
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                برای شروع همکاری، درخواست تامین‌کننده شدن خود را ثبت کنید.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSubmitRequest}
              disabled={submitting}
              className="inline-flex items-center justify-center rounded-xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "در حال ثبت..." : "ثبت درخواست تامین‌کننده شدن"}
            </button>
          </div>
        </div>
      )}

      {request?.status === "PENDING" && (
        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
          <div className="flex flex-col gap-3">
            <div>
              <h3 className="text-base font-semibold text-yellow-800">
                درخواست شما در حال بررسی است
              </h3>
              <p className="mt-1 text-sm text-yellow-700">
                درخواست شما ثبت شده و توسط مدیریت بررسی خواهد شد.
              </p>
            </div>

            <div className="text-xs text-yellow-700/80">
              آخرین بروزرسانی:{" "}
              {new Date(request.updatedAt).toLocaleString("fa-IR")}
            </div>
          </div>
        </div>
      )}

      {request?.status === "APPROVED" && (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-5">
          <h3 className="text-base font-semibold text-green-800">
            درخواست شما تایید شده است
          </h3>
          <p className="mt-1 text-sm text-green-700">
            حساب شما توسط مدیریت تایید شده و به زودی به عنوان تامین‌کننده فعال
            خواهد شد.
          </p>

          <div className="mt-3 text-xs text-green-700/80">
            تاریخ تایید/بروزرسانی:{" "}
            {new Date(request.updatedAt).toLocaleString("fa-IR")}
          </div>
        </div>
      )}

      {request?.status === "REJECTED" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
            <h3 className="text-base font-semibold text-red-800">
              درخواست شما رد شده است
            </h3>
            <p className="mt-1 text-sm text-red-700">
              در حال حاضر درخواست شما مورد تایید قرار نگرفته است.
            </p>

            {request.adminNote ? (
              <div className="mt-4 rounded-xl border border-red-200 bg-white p-4">
                <p className="mb-1 text-xs font-medium text-gray-500">
                  توضیحات مدیریت
                </p>
                <p className="text-sm text-gray-700">{request.adminNote}</p>
              </div>
            ) : null}

            <div className="mt-3 text-xs text-red-700/80">
              تاریخ بروزرسانی:{" "}
              {new Date(request.updatedAt).toLocaleString("fa-IR")}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSubmitRequest}
              disabled={submitting}
              className="inline-flex items-center justify-center rounded-xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "در حال ثبت..." : "ثبت مجدد درخواست"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
