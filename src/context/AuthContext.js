"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { authService } from "../services/auth.service";
import { ROUTES } from "../constants/routes";
import { authSession } from "../lib/auth-session";


const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function refreshUser() {
    setLoading(true);

    try {
      const data = await authService.me();

      if (data?.user) {
        setUser(data.user);
        return data.user;
      }

      setUser(null);
      return null;
    } catch (error) {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    try {
      await authService.logout();
    } catch (e) {
      console.error(e);
    } finally {
      // پاک کردن توکن ذخیره شده
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
      }

      setUser(null);

      // ریدایرکت
     authSession.setRedirectAfterLogin(
       window.location.pathname + window.location.search
       );
      router.replace(ROUTES.LOGIN);
    }
  }

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        refreshUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
