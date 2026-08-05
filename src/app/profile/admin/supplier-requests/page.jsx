"use client";

import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL;

const statusStyles = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REJECTED: "bg-rose-50 text-rose-700 border-rose-200",
};

function getAvatarUrl(url) {
  const baseAvatar = process.env.NEXT_PUBLIC_AVATAR_URL || "";
  return url
    ? `${baseAvatar}${url}`
    : `${baseAvatar}/uploads/avatars/avatar.webp`;
}

function formatValue(value) {
  if (typeof value !== "string") return "خالی";
  return value.trim() ? value.trim() : "خالی";
}

export default function AdminSupplierRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [notes, setNotes] = useState({});

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API}/supplier-requests/admin`, {
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setRequests(data.requests || []);
    } catch (err) {
      setError(err.message || "خطا در دریافت لیست درخواست‌ها");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      setUpdatingId(id);

      const res = await fetch(`${API}/supplier-requests/admin/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          adminNote: notes[id],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setNotes((prev) => ({ ...prev, [id]: "" }));
      fetchRequests();
    } catch (err) {
      alert(err.message || "خطا در بروزرسانی درخواست");
    } finally {
      setUpdatingId(null);
    }
  };

  const isProfileComplete = (profile) => {
    if (!profile) return false;
    return (
      profile.firstName &&
      profile.lastName &&
      profile.nationalCode &&
      profile.companyName &&
      profile.companyRegNo &&
      profile.address
    );
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-xs text-gray-500">
        در حال بارگذاری...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-4 p-4 md:p-6" dir="rtl">
      <div className="flex items-center justify-between border-b border-gray-150 pb-3">
        <h1 className="text-lg font-bold text-gray-900">
          مدیریت درخواست تامین‌کنندگان
        </h1>
        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-bold text-gray-600">
          {requests.length} درخواست
        </span>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          {error}
        </div>
      )}

      {/* نمایش کارتی شبکه‌ای (Grid) برای اشغال کمتر فضا در ارتفاع */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {requests.map((req) => {
          const profile = req.user?.profile || {};
          const profileComplete = isProfileComplete(profile);
          const avatarUrl = getAvatarUrl(profile?.avatarUrl);

          return (
            <div
              key={req.id}
              className="flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md"
            >
              <div>
                {/* هدر کارت */}
                <div className="mb-3 flex items-center justify-between border-b border-gray-100 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-slate-50">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={profile?.firstName || "user"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="text-xs font-black text-slate-400">
                          {profile?.firstName?.[0] || "U"}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-950">
                        {profile?.firstName || "-"} {profile?.lastName || ""}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {req.user?.phone || "-"}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${statusStyles[req.status]}`}
                  >
                    {req.status}
                  </span>
                </div>

                {/* مشخصات فردی و شرکتی */}
                <div className="mb-3 grid grid-cols-2 gap-2 text-[11px] text-gray-600">
                  <div className="space-y-1 rounded-lg bg-gray-50 p-2">
                    <p className="text-[9px] font-bold text-gray-400">اطلاعات فردی</p>
                    <p className="truncate"><span className="text-gray-400">کد ملی:</span> {formatValue(profile?.nationalCode)}</p>
                    <p className="truncate"><span className="text-gray-400">آدرس:</span> {formatValue(profile?.address)}</p>
                  </div>

                  <div className="space-y-1 rounded-lg bg-gray-50 p-2">
                    <p className="text-[9px] font-bold text-gray-400">اطلاعات شرکت</p>
                    <p className="truncate"><span className="text-gray-400">نام:</span> {formatValue(profile?.companyName)}</p>
                    <p className="truncate"><span className="text-gray-400">ثبت:</span> {formatValue(profile?.companyRegNo)}</p>
                  </div>
                </div>

                {/* اطلاعات تکمیلی (حوزه فعالیت و رزومه) */}
                <div className="mb-3 rounded-lg border border-indigo-50 bg-indigo-50/30 p-2.5 text-[11px]">
                  <div className="mb-1 flex items-center justify-between text-[10px] font-bold text-indigo-700">
                    <span>حوزه فعالیت و رزومه</span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] ${profileComplete ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                      {profileComplete ? "پروفایل کامل" : "پروفایل ناقص"}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div>
                      <span className="text-[9px] font-bold text-gray-400 block">حوزه فعالیت:</span>
                      <p className="text-gray-700 leading-relaxed line-clamp-2">
                        {formatValue(profile?.activityField)}
                      </p>
                    </div>

                    <div className="border-t border-indigo-50/50 pt-1">
                      <span className="text-[9px] font-bold text-gray-400 block">رزومه:</span>
                      <p className="whitespace-pre-line text-gray-700 leading-relaxed line-clamp-3">
                        {formatValue(profile?.resume)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* یادداشت ادمین قبلی */}
                {req.adminNote && (
                  <div className="mb-3 rounded-lg border border-amber-100 bg-amber-50/40 p-2 text-[11px]">
                    <span className="text-[9px] font-bold text-amber-800">توضیح قبلی مدیریت:</span>
                    <p className="text-gray-700 mt-0.5">{req.adminNote}</p>
                  </div>
                )}
              </div>

              {/* فرم اکشن‌ها */}
              <div className="mt-2 space-y-2 border-t border-gray-100 pt-2.5">
                <textarea
                  placeholder="توضیحات جدید مدیریت..."
                  rows={2}
                  value={notes[req.id] || ""}
                  onChange={(e) =>
                    setNotes((prev) => ({
                      ...prev,
                      [req.id]: e.target.value,
                    }))
                  }
                  className="w-full resize-none rounded-lg border border-gray-200 p-2 text-[11px] focus:outline-none focus:ring-1 focus:ring-black/10"
                />

                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleStatusChange(req.id, "APPROVED")}
                    disabled={updatingId === req.id}
                    className="flex-1 rounded-md bg-emerald-600 py-1 text-[11px] font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    تایید
                  </button>

                  <button
                    onClick={() => handleStatusChange(req.id, "REJECTED")}
                    disabled={updatingId === req.id}
                    className="flex-1 rounded-md bg-rose-600 py-1 text-[11px] font-bold text-white hover:bg-rose-700 disabled:opacity-50"
                  >
                    رد
                  </button>

                  <button
                    onClick={() => handleStatusChange(req.id, "PENDING")}
                    disabled={updatingId === req.id}
                    className="rounded-md bg-gray-100 px-2 py-1 text-[11px] font-bold text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                  >
                    بررسی مجدد
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
