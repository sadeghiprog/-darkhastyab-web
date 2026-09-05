"use client";

import { useState } from "react";
import CreditAdjustModal from "./CreditAdjustModal";

export default function UserCard({ user, onRoleChange, onCreditAdjust }) {
  const [loadingRole, setLoadingRole] = useState(null);
  const [creditModalOpen, setCreditModalOpen] = useState(false);

  const roles = [
    { key: "USER", label: "کاربر" },
    { key: "SUPPLIER", label: "تامین‌کننده" },
    { key: "PARTNER", label: "همکار" },
    { key: "ADMIN", label: "مدیر" },
    { key: "BANNED", label: "مسدود" },
  ];

  const roleColors = {
    USER: "bg-gray-100 text-gray-700 ring-gray-200",
    SUPPLIER: "bg-blue-50 text-blue-700 ring-blue-200",
    PARTNER: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    ADMIN: "bg-purple-50 text-purple-700 ring-purple-200",
    BANNED: "bg-red-50 text-red-700 ring-red-200",
  };

  const baseAvatar = process.env.NEXT_PUBLIC_AVATAR_URL;
  const avatarSrc = user.profile?.avatarUrl
    ? `${baseAvatar}${user.profile?.avatarUrl}`
    : `${baseAvatar}/uploads/avatars/avatar.webp`;

  async function handleChange(role) {
    if (role === user.status) return;

    const targetRoleLabel = roles.find((r) => r.key === role)?.label || role;
    const isConfirmed = confirm(
      `آیا از تغییر نقش «${user.name || "کاربر بدون نام"}» به «${targetRoleLabel}» اطمینان دارید؟`
    );
    if (!isConfirmed) return;

    setLoadingRole(role);
    try {
      await onRoleChange(user.id, role);
    } catch (error) {
      console.error("Failed to change user role:", error);
    } finally {
      setLoadingRole(null);
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4 hover:shadow-md hover:border-gray-300 transition-all duration-200">
      <div className="flex flex-col lg:flex-row lg:items-center gap-5">
        {/* بخش ۱: آواتار + اطلاعات کاربر */}
        <div className="flex items-center gap-4 lg:w-[240px] lg:shrink-0">
          <div className="relative shrink-0">
            <img
              src={avatarSrc}
              alt="avatar"
              className="w-16 h-16 rounded-full object-cover border-2 border-white ring-2 ring-gray-100"
            />
            <span
              className={`absolute -bottom-1 -left-1 w-5 h-5 rounded-full border-2 border-white ${
                user.status === "BANNED" ? "bg-red-500" : "bg-emerald-500"
              }`}
              title={user.status === "BANNED" ? "مسدود" : "فعال"}
            />
          </div>

          <div className="min-w-0">
            <h3 className="font-bold text-gray-900 truncate">
              {user.name || "بدون نام"}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5" dir="ltr">
              {user.phone}
            </p>
            <span
              className={`inline-block mt-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ring-1 ${
                roleColors[user.status] || "bg-gray-100 text-gray-700 ring-gray-200"
              }`}
            >
              {roles.find((r) => r.key === user.status)?.label || user.status}
            </span>
          </div>
        </div>

        {/* خط جداکننده عمودی - فقط در دسکتاپ */}
        <div className="hidden lg:block w-px h-14 bg-gray-100 shrink-0" />

        {/* بخش ۲: آمار */}
        <div className="flex items-center gap-6 lg:gap-8 shrink-0 border-t lg:border-t-0 pt-4 lg:pt-0 border-gray-100">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">
              {user._count?.purchaseRequests || 0}
            </div>
            <div className="text-[11px] text-gray-400 mt-0.5">درخواست</div>
          </div>

          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">
              {user._count?.supplyOffers || 0}
            </div>
            <div className="text-[11px] text-gray-400 mt-0.5">پیشنهاد</div>
          </div>

          <div className="text-center">
            <div className="text-lg font-bold text-amber-600">
              {user.wallet?.balance || 0}
            </div>
            <div className="text-[11px] text-gray-400 mt-0.5">اعتبار</div>
          </div>
        </div>

        {/* خط جداکننده عمودی - فقط در دسکتاپ */}
        <div className="hidden lg:block w-px h-14 bg-gray-100 shrink-0" />

        {/* بخش ۳: تغییر نقش - فضای باقی‌مانده رو پر می‌کنه */}
        <div className="flex-1 min-w-0">
          <div className="flex bg-gray-50 rounded-xl p-1 gap-1 flex-wrap">
            {roles.map((role) => {
              const isActive = user.status === role.key;
              return (
                <button
                  key={role.key}
                  disabled={isActive || loadingRole === role.key}
                  onClick={() => handleChange(role.key)}
                  className={`
                    flex-1 text-xs py-2 px-2 rounded-lg transition-all min-w-[64px] text-center font-medium
                    ${isActive
                      ? "bg-white shadow-sm text-gray-900"
                      : "text-gray-500 hover:bg-white hover:text-gray-800"}
                    ${loadingRole === role.key ? "opacity-50 cursor-wait" : ""}
                  `}
                >
                  {loadingRole === role.key ? "..." : role.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* بخش ۴: دکمه تغییر اعتبار */}
        <div className="shrink-0 border-t lg:border-t-0 pt-4 lg:pt-0 border-gray-100">
          <button
            type="button"
            onClick={() => setCreditModalOpen(true)}
            className="w-full lg:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-l from-amber-500 to-amber-400 text-white rounded-xl hover:from-amber-600 hover:to-amber-500 transition-all font-semibold text-sm shadow-sm hover:shadow"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V6m0 12v-2m9-4a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            تغییر اعتبار
          </button>
        </div>
      </div>

      <CreditAdjustModal
        open={creditModalOpen}
        onClose={() => setCreditModalOpen(false)}
        targetLabel={`${user.name || "کاربر بدون نام"} — ${user.phone}`}
        onSubmit={(amount, description) => onCreditAdjust(user.id, amount, description)}
      />
    </div>
  );
}