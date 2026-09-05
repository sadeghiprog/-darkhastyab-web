"use client";

import { useEffect, useState, useCallback } from "react";
import UserCard from "../../../../components/common/UserCard";
import CreditAdjustModal from "../../../../components/common/CreditAdjustModal"; // جدید

const ROLE_TABS = [
  { label: "همه", value: "ALL" },
  { label: "کاربران عادی", value: "USER" },
  { label: "تامین‌کنندگان", value: "SUPPLIER" },
  { label: "همکاران (Partner)", value: "PARTNER" },
  { label: "مدیران", value: "ADMIN" },
  { label: "مسدود شده", value: "BANNED" },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [bulkModalOpen, setBulkModalOpen] = useState(false); // جدید
  const [toast, setToast] = useState(null); // جدید — پیغام موفقیت/خطا

  const API = process.env.NEXT_PUBLIC_API_URL;

  const fetchUsers = useCallback(
    async (targetPage = 1, targetStatus = "ALL", targetSearch = "") => {
      try {
        setLoading(true);
        const url = new URL(`${API}/admin/users`);
        url.searchParams.set("page", String(targetPage));
        url.searchParams.set("limit", "10");
        if (targetStatus && targetStatus !== "ALL") {
          url.searchParams.set("status", targetStatus);
        }
        if (targetSearch && targetSearch.trim() !== "") {
          url.searchParams.set("search", targetSearch.trim());
        }

        const res = await fetch(url.toString(), { credentials: "include" });
        if (!res.ok) throw new Error(`Fetch users failed: ${res.status}`);

        const data = await res.json();
        setUsers(data.users || []);
        setPage(data.page || targetPage);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        console.error("Fetch users error:", err);
        setUsers([]);
        setPage(1);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    },
    [API]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(1, "ALL", "");
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  async function changeRole(userId, role) {
    try {
      const res = await fetch(`${API}/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: role }),
      });
      if (!res.ok) throw new Error(`Change role failed: ${res.status}`);
      fetchUsers(page, selectedStatus, searchQuery);
    } catch (err) {
      console.error("Change role error:", err);
    }
  }

  // ====== جدید: تغییر اعتبار یک کاربر ======
  async function handleCreditAdjust(userId, amount, description) {
    const res = await fetch(`${API}/admin/users/${userId}/credit`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ amount, description }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message || "تغییر اعتبار ناموفق بود");
    }

    setToast({ type: "success", message: "اعتبار با موفقیت بروزرسانی شد" });
    fetchUsers(page, selectedStatus, searchQuery);
  }

  // ====== جدید: تغییر اعتبار برای همه کاربران ======
  async function handleBulkCreditAdjust(amount, description) {
    const res = await fetch(`${API}/admin/users/credit/all`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ amount, description }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message || "اعمال اعتبار گروهی ناموفق بود");
    }

    const failedCount = data.failed?.length || 0;
    setToast({
      type: failedCount > 0 ? "warning" : "success",
      message: `برای ${data.success} کاربر اعمال شد${
        failedCount > 0 ? ` — ${failedCount} مورد ناموفق` : ""
      }`,
    });

    fetchUsers(page, selectedStatus, searchQuery);
  }

  const handleTabChange = (status) => {
    setSelectedStatus(status);
    setPage(1);
    fetchUsers(1, status, searchQuery);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const nextSearch = searchInput.trim();
    setSearchQuery(nextSearch);
    setPage(1);
    fetchUsers(1, selectedStatus, nextSearch);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
    setPage(1);
    fetchUsers(1, selectedStatus, "");
  };

  // جدید: مخفی کردن خودکار toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  return (
    <div className="max-w-7xl mx-auto p-6" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">مدیریت کاربران</h1>

        {/* دکمه جدید: اعمال اعتبار برای همه */}
        <button
          type="button"
          onClick={() => setBulkModalOpen(true)}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm transition font-medium"
        >
          اعمال اعتبار برای همه کاربران
        </button>
      </div>

      {/* Toast جدید */}
      {toast && (
        <div
          className={`mb-4 px-4 py-3 rounded-lg text-sm ${
            toast.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : toast.type === "warning"
              ? "bg-amber-50 text-amber-700 border border-amber-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="bg-white p-4 rounded-lg shadow mb-6 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder="جستجو بر اساس نام، نام خانوادگی، شماره همراه یا ایمیل..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm transition">
            جستجو
          </button>
          {searchQuery && (
            <button type="button" onClick={handleClearSearch} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm transition">
              پاک کردن
            </button>
          )}
        </form>

        <div className="flex flex-wrap gap-2 pt-2 border-t">
          {ROLE_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => handleTabChange(tab.value)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition ${
                selectedStatus === tab.value ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">در حال بارگذاری...</div>
      ) : users.length === 0 ? (
        <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg">کاربری با این مشخصات یافت نشد.</div>
      ) : (
        <div className="space-y-4">
          {users.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              onRoleChange={changeRole}
              onCreditAdjust={handleCreditAdjust} // جدید
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8" dir="ltr">
          <button disabled={page === 1 || loading} onClick={() => fetchUsers(page - 1, selectedStatus, searchQuery)} className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 transition text-sm">
            قبلی
          </button>
          <span className="px-4 py-2 text-sm font-medium">{page} / {totalPages}</span>
          <button disabled={page === totalPages || loading} onClick={() => fetchUsers(page + 1, selectedStatus, searchQuery)} className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 transition text-sm">
            بعدی
          </button>
        </div>
      )}

      {/* Modal جدید برای اعمال گروهی */}
      <CreditAdjustModal
        open={bulkModalOpen}
        onClose={() => setBulkModalOpen(false)}
        targetLabel="همه کاربران — این عملیات روی تمام کاربران سیستم اعمال می‌شود"
        onSubmit={handleBulkCreditAdjust}
      />
    </div>
  );
}