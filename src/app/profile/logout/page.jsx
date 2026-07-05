"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";

export default function LogoutPage() {
  const { logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const doLogout = async () => {
      await logout();
      router.replace("/");
    };

    doLogout();
  }, [logout, router]);

  return (
    <div className="text-center text-sm text-slate-500">
      در حال خروج از حساب...
    </div>
  );
}
