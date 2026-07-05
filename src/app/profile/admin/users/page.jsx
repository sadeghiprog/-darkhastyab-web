"use client";

import { useEffect, useState } from "react";
import UserCard from "../../../../components/common/UserCard";

export default function AdminUsersPage() {

  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const API = process.env.NEXT_PUBLIC_API_URL;

  async function fetchUsers(p = 1) {
    try {
      setLoading(true);

      const res = await fetch(`${API}/admin/users?page=${p}&limit=10`, {
        credentials: "include",
      });

      const data = await res.json();

      setUsers(data.users);
      setPage(data.page);
      setTotalPages(data.totalPages);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers(1);
  }, []);

  async function changeRole(userId, role) {
    try {

      await fetch(`${API}/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          status: role,
        }),
      });

      fetchUsers(page);

    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6">

      <h1 className="text-2xl font-bold mb-6">
        مدیریت کاربران
      </h1>

      {loading && (
        <div className="text-center py-10">
          در حال بارگذاری...
        </div>
      )}

      <div className="space-y-4">

        {users.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            onRoleChange={changeRole}
          />
        ))}

      </div>

      <div className="flex justify-center gap-4 mt-8">

        <button
          disabled={page === 1}
          onClick={() => fetchUsers(page - 1)}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          قبلی
        </button>

        <span className="px-4 py-2">
          {page} / {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => fetchUsers(page + 1)}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          بعدی
        </button>

      </div>

    </div>
  );
}
