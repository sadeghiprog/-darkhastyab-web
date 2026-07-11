"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Plus } from "lucide-react";

export default function HeroSection() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const quickSearches = ["میلگرد", "ورق آهن", "سیمان"];

  return (
    <section className="bg-white" dir="rtl">
      <div className="mx-auto max-w-5xl px-4 py-12 md:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-slate-900 leading-[1.8] md:leading-[1.7]">
            ارتباط مستقیم خریداران و فروشندگان در
            <span className="text-cyan-600"> درخواست یاب </span>
          </h1>

          <p className="mt-4 text-sm md:text-base leading-7 text-slate-600">
            در درخواست‌یاب می‌توانید درخواست خرید خود را ثبت کنید، نیازهای بازار را
            جستجو کنید و با تأمین‌کنندگان مرتبط ارتباط بگیرید.
          </p>

          <form
            onSubmit={handleSearch}
            className="mt-6 flex flex-col sm:flex-row gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2"
          >
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3">
              <Search size={18} className="shrink-0 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="مثلاً میلگرد، سیمان، پروفیل..."
                className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
              />
            </div>

            <button
              type="submit"
              className="rounded-xl bg-cyan-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-cyan-700"
            >
              جستجو
            </button>
          </form>

          <div className="mt-4 flex flex-row items-center justify-center gap-2">
            <Link
              href="/request/create"
              className="inline-flex w-1/2 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800 sm:w-auto"
            >
              <Plus size={16} />
              ثبت درخواست
            </Link>

            <Link
              href="/filter"
              className="inline-flex w-1/2 items-center justify-center rounded-xl border border-slate-300 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
            >
              مشاهده درخواست‌ها
            </Link>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
            <span>جستجوهای محبوب:</span>
            {quickSearches.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => router.push(`/search?q=${encodeURIComponent(item)}`)}
                className="rounded-full bg-slate-100 px-3 py-1 text-slate-700 transition hover:bg-slate-200"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
