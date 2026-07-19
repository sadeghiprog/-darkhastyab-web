"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu,
  X,
  Search,
  User,
  LogIn,
  ChevronLeft,
} from "lucide-react";

import { COLORS } from "../../constants/colors";
import { useAuth } from "../../context/AuthContext";
import { authSession } from "../../lib/auth-session";


export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [mobileSearch, setMobileSearch] = useState("");

  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  // ===== ثبت درخواست (اگر لاگین نباشد → Login) =====
  const handleCreateRequestClick = (e) => {
    if (!isAuthenticated) {
      e.preventDefault();
      authSession.setRedirectAfterLogin(
             window.location.pathname + window.location.search
             );
      router.push("/auth/login");
      setIsMenuOpen(false);
    }
  };

   const handleLoginClick = () => {
     authSession.setRedirectAfterLogin(
       window.location.pathname + window.location.search
       );
    setIsMenuOpen(false);
  };

  // ===== Submit سرچ دسکتاپ =====
  const handleDesktopSearch = (e) => {
    if (e) e.preventDefault();

    const q = searchText.trim();
    if (!q) return;

    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  // ===== Submit سرچ موبایل =====
  const handleMobileSearch = (e) => {
    if (e) e.preventDefault();

    const q = mobileSearch.trim();
    if (!q) return;

    setIsMenuOpen(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const menuItems = [
    { title: "خانه", href: "/" },
    { title: "درخواست‌ها", href: "/filter" },
    { title: "تأمین‌کنندگان", href: "/suppliers" },
    { title: "تعرفه ها", href: "/tariffs" },
    { title: "راهنما", href: "/help" },
    { title: "تماس با ما", href: "/contact" },
  ];

  return (
    <>
      <header
        style={{ backgroundColor: COLORS.primary }}
        className="sticky top-0 z-50 w-full px-4 py-4 shadow-lg border-b border-white/5"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* =================== دسکتاپ =================== */}
          <div className="hidden lg:flex items-center gap-8 w-full justify-between">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2">
                <div
                  style={{ backgroundColor: COLORS.accent }}
                  className="w-8 h-8 rounded-full flex items-center justify-center shadow-md"
                >
                  <div className="w-3.5 h-3.5 border-2 border-white rounded-md rotate-45" />
                </div>
                <span className="text-white font-bold text-lg">درخواست یاب</span>
              </Link>

              <nav className="flex items-center gap-6">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-slate-300 hover:text-white transition-colors text-sm font-medium"
                  >
                    {item.title}
                  </Link>
                ))}

                {isAuthenticated ? (
                  <Link
                    href="/profile/dashboard"
                    className="text-slate-300 hover:text-white transition-colors text-sm font-medium flex items-center gap-1.5 border-r border-white/10 pr-4"
                  >
                    <User size={16} style={{ color: COLORS.accent }} />
                    <span>پروفایل ({user?.name || "کاربر"})</span>
                  </Link>
                ) : (
                  <Link
                    href="/auth/login"
                    onClick={handleLoginClick}
                    className="text-slate-300 hover:text-white transition-colors text-sm font-medium flex items-center gap-1.5 border-r border-white/10 pr-4"
                  >
                    <LogIn size={16} style={{ color: COLORS.accent }} />
                    <span>ورود / ثبت‌نام</span>
                  </Link>
                )}
              </nav>
            </div>

            {/* ====== سرچ دسکتاپ ====== */}
            <div className="flex items-center gap-4">
              <form
                onSubmit={handleDesktopSearch}
                className="flex items-center bg-white/5 rounded-xl px-3 py-2 gap-2 border border-white/10 focus-within:border-cyan-500/50 transition-all"
              >
                <Search
                  size={18}
                  className="text-slate-400 cursor-pointer"
                  onClick={handleDesktopSearch}
                />

                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="جستجو..."
                  className="bg-transparent border-none outline-none text-white text-xs w-52 placeholder:text-slate-500"
                />
              </form>

              <Link
                href="/request/create"
                onClick={handleCreateRequestClick}
                style={{ backgroundColor: COLORS.accent }}
                className="text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:scale-[1.02] transition-all shadow-lg"
              >
                ثبت درخواست
              </Link>
            </div>
          </div>

          {/* =================== موبایل =================== */}
          <div className="flex lg:hidden items-center justify-between w-full relative h-10">
            <button className="text-white p-1 z-10" onClick={() => setIsMenuOpen(true)}>
              <Menu size={28} />
            </button>

            <div className="absolute left-1/2 -translate-x-1/2">
              <Link href="/" className="flex items-center gap-2">
                <div
                  style={{ backgroundColor: COLORS.accent }}
                  className="w-7 h-7 rounded-full flex items-center justify-center"
                >
                  <div className="w-3 h-3 border-2 border-white rounded-md rotate-45"></div>
                </div>
                <span className="text-white font-bold text-base">درخواست یاب</span>
              </Link>
            </div>

            <Link
              href="/request/create"
              onClick={handleCreateRequestClick}
              style={{ backgroundColor: COLORS.accent }}
              className="text-white px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-md z-10"
            >
              ثبت درخواست
            </Link>
          </div>
        </div>
      </header>

      {/* =================== منوی موبایل =================== */}
      <div
        className={`fixed inset-0 z-[100] lg:hidden transition-opacity duration-300 ${
          isMenuOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />

        <aside
          className={`absolute right-0 top-0 h-full w-80 bg-slate-900 border-l border-white/10 shadow-2xl transition-transform duration-300 ${
            isMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
          dir="rtl"
        >
          {/* Header menu */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-950">
            <span className="font-bold text-white text-sm">منوی اصلی</span>
            <button onClick={() => setIsMenuOpen(false)} className="text-slate-400">
              <X size={22} />
            </button>
          </div>

          <div className="p-4 flex flex-col gap-5 overflow-y-auto flex-1">
            {/* ====== سرچ موبایل ====== */}
            <form onSubmit={handleMobileSearch}>
              <div className="flex items-center bg-slate-800 rounded-xl px-3 py-2.5 gap-2 border border-white/10">
                <Search
                  size={18}
                  className="text-slate-400 cursor-pointer"
                  onClick={handleMobileSearch}
                />
                <input
                  type="text"
                  value={mobileSearch}
                  onChange={(e) => setMobileSearch(e.target.value)}
                  placeholder="جستجو..."
                  className="bg-transparent border-none outline-none text-white text-sm w-full"
                />
              </div>
            </form>

            {/* Links */}
            <nav className="flex flex-col gap-2">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-xl text-slate-300 font-medium"
                >
                  <span>{item.title}</span>
                  <ChevronLeft size={16} className="text-slate-500" />
                </Link>
              ))}

              <div className="border-t border-white/10 mt-4 pt-4">
                {isAuthenticated ? (
                  <Link
                    href="/profile/dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 text-white font-bold"
                  >
                    <User size={20} style={{ color: COLORS.accent }} />
                    <span>پروفایل کاربری</span>
                  </Link>
                ) : (
                  <Link
                    href="/auth/login"
                    onClick={handleLoginClick}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 text-white font-bold"
                  >
                    <LogIn size={20} style={{ color: COLORS.accent }} />
                    <span>ورود / ثبت‌نام</span>
                  </Link>
                )}
              </div>
            </nav>
          </div>
        </aside>
      </div>
    </>
  );
}
