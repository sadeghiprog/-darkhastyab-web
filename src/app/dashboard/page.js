"use client";

import ProtectedRoute from "../../components/auth/ProtectedRoute";
import { useAuth } from "../../context/AuthContext";

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-3xl rounded-xl bg-white p-6 shadow">
          <h1 className="text-2xl font-bold">داشبورد</h1>

          <div className="mt-6 space-y-2">
            <p>شماره موبایل: {user?.phone}</p>
            <p>نام: {user?.name || "تکمیل نشده"}</p>
          </div>

          <button
            type="button"
            onClick={async () => {
              await logout();
            }}
            className="mt-6 rounded-lg bg-red-600 px-4 py-2 text-white"
          >
            خروج از حساب
          </button>
        </div>
      </main>
    </ProtectedRoute>
  );
}
