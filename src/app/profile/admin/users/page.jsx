"use client";

import { useEffect, useState, useCallback } from "react";
import UserCard from "../../../../components/common/UserCard";

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

  const API = process.env.NEXT_PUBLIC_API_URL;

  const fetchUsers = useCallback(
    async (targetPage = 1, targetStatus = "ALL", targetSearch = "") => {
      try {
        setLoading(true);

        const url = new URL(`${API}/admin/users`);
        url.searchParams.set("page", String(targetPage));
        url.searchParams.set("limit", "10");

        // برای ALL چیزی نفرست تا بک‌اند همه را برگرداند
        if (targetStatus && targetStatus !== "ALL") {
          url.searchParams.set("status", targetStatus);
        }

        if (targetSearch && targetSearch.trim() !== "") {
          url.searchParams.set("search", targetSearch.trim());
        }

        console.log("Admin users URL:", url.toString());

        const res = await fetch(url.toString(), {
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error(`Fetch users failed: ${res.status}`);
        }

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

  // فقط لود اولیه، بدون setState مستقیم در بدنه effect
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
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          status: role,
        }),
      });

      if (!res.ok) {
        throw new Error(`Change role failed: ${res.status}`);
      }

      fetchUsers(page, selectedStatus, searchQuery);
    } catch (err) {
      console.error("Change role error:", err);
    }
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

  return (
    <div className="max-w-5xl mx-auto p-6" dir="rtl">
      <h1 className="text-2xl font-bold mb-6">مدیریت کاربران</h1>

      <div className="bg-white p-4 rounded-lg shadow mb-6 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder="جستجو بر اساس نام، نام خانوادگی، شماره همراه یا ایمیل..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />

          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm transition"
          >
            جستجو
          </button>

          {searchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm transition"
            >
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
                selectedStatus === tab.value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">
          در حال بارگذاری...
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg">
          کاربری با این مشخصات یافت نشد.
        </div>
      ) : (
        <div className="space-y-4">
          {users.map((user) => (
            <UserCard key={user.id} user={user} onRoleChange={changeRole} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8" dir="ltr">
          <button
            type="button"
            disabled={page === 1 || loading}
            onClick={() => fetchUsers(page - 1, selectedStatus, searchQuery)}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 transition text-sm"
          >
            قبلی
          </button>

          <span className="px-4 py-2 text-sm font-medium">
            {page} / {totalPages}
          </span>

          <button
            type="button"
            disabled={page === totalPages || loading}
            onClick={() => fetchUsers(page + 1, selectedStatus, searchQuery)}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 transition text-sm"
          >
            بعدی
          </button>
        </div>
      )}
    </div>
  );
}
