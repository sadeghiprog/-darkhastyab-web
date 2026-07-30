"use client";

import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL;
const AVATAR_BASE = process.env.NEXT_PUBLIC_AVATAR_URL || "";

const statusStyles = {
  PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
  APPROVED: "bg-green-100 text-green-700 border-green-200",
  REJECTED: "bg-red-100 text-red-700 border-red-200",
};

// تابع کمکی برای ساخت آدرس تصویر آواتار
function getAvatarUrl(url) {
  const baseAvatar = process.env.NEXT_PUBLIC_AVATAR_URL;
  const avatarSrc = url
  ? `${baseAvatar}${url}`
  :`${baseAvatar}/uploads/avatars/avatar.webp`;
  return avatarSrc;
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

      const res = await fetch(`${API}/supplier-requests/admin`, {
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setRequests(data.requests);
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
      alert(err.message);
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
    return <div className="p-8 text-gray-500 text-center">در حال بارگذاری...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-6" dir="rtl">

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          مدیریت درخواست تامین‌کنندگان
        </h1>

        <span className="text-sm text-gray-500 font-bold">
          {requests.length} درخواست
        </span>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-5">
        {requests.map((req) => {
          const profile = req.user?.profile;
          const profileComplete = isProfileComplete(profile);
          const avatarUrl = getAvatarUrl(profile?.avatarUrl);

          return (
            <div
              key={req.id}
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition"
            >

              {/* header */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-5">

                <div className="flex items-center gap-3">
                  
                  {/* عکس پروفایل یا آواتار پیش‌فرض */}
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200 bg-slate-100 flex items-center justify-center">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={profile?.firstName || "user"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-slate-500 text-sm font-black">
                        {profile?.firstName?.[0] || "U"}
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="font-semibold text-gray-900">
                      {profile?.firstName} {profile?.lastName}
                    </p>

                    <p className="text-xs text-gray-500">
                      {req.user.phone}
                    </p>
                  </div>
                </div>

                <span
                  className={`px-3 py-1 text-xs rounded-full border font-medium ${statusStyles[req.status]}`}
                >
                  {req.status}
                </span>
              </div>

              {/* info grid */}
              <div className="grid md:grid-cols-2 gap-6 text-sm mb-5">

                <div className="space-y-2">
                  <p className="text-gray-500 text-xs">اطلاعات فردی</p>

                  <p>
                    <span className="text-gray-400 font-bold">کد ملی:</span>{" "}
                    {profile?.nationalCode || "-"}
                  </p>

                  <p>
                    <span className="text-gray-400 font-bold">آدرس:</span>{" "}
                    {profile?.address || "-"}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-gray-500 text-xs">اطلاعات شرکت</p>

                  <p>
                    <span className="text-gray-400 font-bold">نام شرکت:</span>{" "}
                    {profile?.companyName || "-"}
                  </p>

                  <p>
                    <span className="text-gray-400 font-bold">شماره ثبت:</span>{" "}
                    {profile?.companyRegNo || "-"}
                  </p>
                </div>
              </div>

              {/* profile status */}
              <div className="mb-4">
                {profileComplete ? (
                  <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700 font-bold">
                    پروفایل کامل
                  </span>
                ) : (
                  <span className="text-xs px-3 py-1 rounded-full bg-red-100 text-red-700 font-bold">
                    پروفایل ناقص
                  </span>
                )}
              </div>

              {/* admin note */}
              {req.adminNote && (
                <div className="bg-gray-50 border rounded-xl p-3 text-sm mb-4">
                  <span className="text-gray-500 text-xs">توضیح مدیریت</span>
                  <p className="mt-1 text-gray-700">{req.adminNote}</p>
                </div>
              )}

              {/* actions */}
              <div className="space-y-3">

                <textarea
                  placeholder="توضیحات مدیریت (برای رد درخواست الزامی است)"
                  value={notes[req.id] || ""}
                  onChange={(e) =>
                    setNotes((prev) => ({
                      ...prev,
                      [req.id]: e.target.value,
                    }))
                  }
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                />

                <div className="flex gap-2 flex-wrap">

                  <button
                    onClick={() => handleStatusChange(req.id, "APPROVED")}
                    disabled={updatingId === req.id}
                    className="px-4 py-2 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 font-bold"
                  >
                    تایید
                  </button>

                  <button
                    onClick={() => handleStatusChange(req.id, "REJECTED")}
                    disabled={updatingId === req.id}
                    className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 font-bold"
                  >
                    رد
                  </button>

                  <button
                    onClick={() => handleStatusChange(req.id, "PENDING")}
                    disabled={updatingId === req.id}
                    className="px-4 py-2 text-sm rounded-lg bg-gray-800 text-white hover:bg-black disabled:opacity-50 font-bold"
                  >
                    بازگشت به بررسی
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
