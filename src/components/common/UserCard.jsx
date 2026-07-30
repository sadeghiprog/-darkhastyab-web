"use client";

import { useState } from "react";

export default function UserCard({ user, onRoleChange }) {

  const [loadingRole, setLoadingRole] = useState(null);

  const roles = [
    { key: "USER", label: "کاربر" },
    { key: "SUPPLIER", label: "تامین‌کننده" },
    { key: "ADMIN", label: "مدیر" },
    { key: "BANNED", label: "مسدود" },
  ];

  const roleColors = {
    USER: "bg-gray-100 text-gray-700",
    SUPPLIER: "bg-blue-100 text-blue-700",
    ADMIN: "bg-purple-100 text-purple-700",
    BANNED: "bg-red-100 text-red-700",
  };

  const baseAvatar = process.env.NEXT_PUBLIC_AVATAR_URL;
  const avatarSrc = user.profile?.avatarUrl
  ? `${baseAvatar}${user.profile?.avatarUrl}`
  :`${baseAvatar}/uploads/avatars/avatar.webp`;

  async function handleChange(role) {
    if (role === user.status) return;

    setLoadingRole(role);
    await onRoleChange(user.id, role);
    setLoadingRole(null);
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm transition">

      {/* Header */}
      <div className="flex items-center gap-4">

        <img
          src={avatarSrc}
          alt="avatar"
          className="w-14 h-14 rounded-full object-cover border"
        />

        <div className="flex-1">

          <div className="flex items-center gap-3">

            <h3 className="font-semibold text-gray-900">
              {user.name || "بدون نام"}
            </h3>

            <span
              className={`text-xs px-2.5 py-1 rounded-full ${roleColors[user.status]}`}
            >
              {roles.find(r => r.key === user.status)?.label}
            </span>

          </div>

          <p className="text-sm text-gray-500 mt-1">
            {user.phone}
          </p>

        </div>

      </div>

      {/* Stats */}
      <div className="flex gap-6 mt-4 text-sm text-gray-600">

        <div>
          <span className="font-semibold text-gray-900">
            {user._count?.purchaseRequests || 0}
          </span>
          <span className="mr-1 text-gray-400">
            درخواست
          </span>
        </div>

        <div>
          <span className="font-semibold text-gray-900">
            {user._count?.supplyOffers || 0}
          </span>
          <span className="mr-1 text-gray-400">
            پیشنهاد
          </span>
        </div>

        <div>
          <span className="font-semibold text-gray-900">
            {user.wallet?.balance || 0}
          </span>
          <span className="mr-1 text-gray-400">
            اعتبار
          </span>
        </div>

      </div>

      {/* Role Switcher */}
      <div className="flex bg-gray-100 rounded-lg p-1 mt-5 gap-1">

        {roles.map(role => {

          const isActive = user.status === role.key;

          return (
            <button
              key={role.key}
              disabled={isActive || loadingRole === role.key}
              onClick={() => handleChange(role.key)}
              className={`
                flex-1 text-sm py-1.5 rounded-md transition
                ${isActive
                  ? "bg-white shadow text-gray-900 font-medium"
                  : "text-gray-600 hover:bg-gray-200"}
                ${loadingRole === role.key ? "opacity-50" : ""}
              `}
            >
              {role.label}
            </button>
          );
        })}

      </div>

    </div>
  );
}
