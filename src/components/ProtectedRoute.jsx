"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../lib/api";
import { authSession } from "../lib/auth-session";

export default function ProtectedRoute({ children }) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      try {
        await apiFetch("/auth/me");

        if (!mounted) return;

        setAllowed(true);
      } catch (error) {
        if (!mounted) return;

        setAllowed(false);
        authSession.setRedirectAfterLogin(
               window.location.pathname + window.location.search
               );
        router.replace("/auth/login");
      } finally {
        if (!mounted) return;

        setLoading(false);
      }
    }

    checkAuth();

    return () => {
      mounted = false;
    };
  }, [router]);

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-600">
        در حال بررسی ورود کاربر...
      </div>
    );
  }

  if (!allowed) {
    return null;
  }

  return children;
}
