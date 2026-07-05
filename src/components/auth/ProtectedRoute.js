"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "../../context/AuthContext";
import { ROUTES } from "../../constants/routes";
import { authSession } from "../../lib/auth-session";


export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
       authSession.setRedirectAfterLogin(
             window.location.pathname + window.location.search
             );
      router.push(ROUTES.LOGIN);
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        در حال بررسی ورود...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return children;
}
