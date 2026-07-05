"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import {
  Search,
  MapPin,
  LayoutGrid,
  Clock,
  CircleDollarSign,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { COLORS } from "../../constants/colors";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";

const BUDGET_OPTIONS = [
  { value: "", label: "همه بودجه‌ها" },
  { value: "10000000", label: "بالای ۱۰ میلیون" },
  { value: "100000000", label: "بالای ۱۰۰ میلیون" },
  { value: "500000000", label: "بالای ۵۰۰ میلیون" },
  { value: "1000000000", label: "بالای ۱ میلیارد" },
  { value: "3000000000", label: "بالای ۳ میلیارد" },
  { value: "5000000000", label: "بالای ۵ میلیارد" },
  { value: "10000000000", label: "بالای ۱۰ میلیارد" },
];

const DEADLINE_OPTIONS = [
  { value: "", label: "همه مهلت‌ها" },
  { value: "1day", label: "۱ روز" },
  { value: "3days", label: "۳ روز" },
  { value: "1week", label: "۱ هفته" },
  { value: "2weeks", label: "۲ هفته" },
  { value: "1month", label: "۱ ماه" },
  { value: "3months", label: "۳ ماه" },
  { value: "6months", label: "۶ ماه" },
  { value: "1year", label: "۱ سال" },
];

function FilterBarContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [categories, setCategories] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const [filters, setFilters] = useState({
    category: "",
    province: "",
    budget: "",
    deadline: "",
  });

  const initialFilters = useMemo(
    () => ({
      category: searchParams.get("category") || "",
      province: searchParams.get("province") || "",
      budget: searchParams.get("budget") || "",
      deadline: searchParams.get("deadline") || "",
    }),
    [searchParams]
  );

  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  useEffect(() => {
    let isMounted = true;

    const fetchFilterData = async () => {
      setLoading(true);
      setFetchError("");

      try {
        const [catRes, provRes] = await Promise.all([
          fetch(`${API_BASE}/categories`, { cache: "no-store" }),
          fetch(`${API_BASE}/locations/provinces`, { cache: "no-store" }),
        ]);

        if (!catRes.ok) throw new Error(`Categories API failed: ${catRes.status}`);
        if (!provRes.ok) throw new Error(`Provinces API failed: ${provRes.status}`);

        const [catData, provData] = await Promise.all([catRes.json(), provRes.json()]);

        if (!isMounted) return;

        setCategories(Array.isArray(catData?.categories) ? catData.categories : []);
        setProvinces(Array.isArray(provData?.provinces) ? provData.provinces : []);
      } catch (error) {
        console.error("Error fetching filter data:", error);

        if (!isMounted) return;

        setCategories([]);
        setProvinces([]);
        setFetchError("دریافت اطلاعات فیلترها با مشکل مواجه شد.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchFilterData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const buildQueryString = () => {
    const params = new URLSearchParams();

    if (filters.category) params.set("category", filters.category);
    if (filters.province) params.set("province", filters.province);
    if (filters.budget) params.set("budget", filters.budget);
    if (filters.deadline) params.set("deadline", filters.deadline);

    return params.toString();
  };

  const applyFilters = () => {
    const queryString = buildQueryString();
    router.push(queryString ? `/filter?${queryString}` : "/filter");
  };

  return (
    <div className="rounded-2xl bg-[#1a2238] p-5 shadow-xl">
      <div className="flex flex-col gap-4">
        {/* گرید را در موبایل ۲ ستونه و در نمایشگر بزرگ ۵ ستونه می‌کنیم */}
        <div className="grid grid-cols-2 items-end gap-3.5 xl:grid-cols-5">
          <FilterItem icon={<LayoutGrid size={18} className="text-cyan-400" />} label="دسته‌بندی">
            <select
              name="category"
              value={filters.category}
              onChange={handleChange}
              disabled={loading}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500 disabled:opacity-60"
            >
              <option value="">همه دسته‌بندی‌ها</option>
              {categories.map((item) => (
                <option key={item.id} value={String(item.id)}>
                  {item.name}
                </option>
              ))}
            </select>
          </FilterItem>

          <FilterItem icon={<MapPin size={18} className="text-cyan-400" />} label="استان">
            <select
              name="province"
              value={filters.province}
              onChange={handleChange}
              disabled={loading}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500 disabled:opacity-60"
            >
              <option value="">همه استان‌ها</option>
              {provinces.map((item) => (
                <option key={item.id} value={String(item.id)}>
                  {item.name}
                </option>
              ))}
            </select>
          </FilterItem>

          <FilterItem icon={<CircleDollarSign size={18} className="text-cyan-400" />} label="بودجه">
            <select
              name="budget"
              value={filters.budget}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
            >
              {BUDGET_OPTIONS.map((option) => (
                <option key={option.value || "all-budget"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FilterItem>

          <FilterItem icon={<Clock size={18} className="text-cyan-400" />} label="مهلت">
            <select
              name="deadline"
              value={filters.deadline}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
            >
              {DEADLINE_OPTIONS.map((option) => (
                <option key={option.value || "all-deadline"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FilterItem>

          {/* دکمه جستجو: در موبایل col-span-2 می‌شود تا تمام‌عرض باشد و لیبل نامرئی آن در موبایل مخفی می‌شود */}
          <div className="col-span-2 flex flex-col gap-2 xl:col-span-1">
            <span className="hidden text-xs xl:block xl:invisible">actions</span>
            <button
              type="button"
              onClick={applyFilters}
              disabled={loading}
              style={{ backgroundColor: COLORS.accent }}
              className="flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Search size={18} />
              {loading ? "در حال بارگذاری..." : "جستجو"}
            </button>
          </div>
        </div>

        {fetchError && (
          <div className="text-sm text-red-300">
            {fetchError}
          </div>
        )}
      </div>
    </div>
  );
}

// کامپوننت اصلی با مرز Suspense جهت برطرف کردن خطای ساخت بیلد پروداکشن
export default function FilterBar() {
  return (
    <Suspense
      fallback={
        <div className="rounded-2xl bg-[#1a2238] p-5 shadow-xl animate-pulse">
          <div className="h-32 rounded-xl bg-slate-800/50" />
        </div>
      }
    >
      <FilterBarContent />
    </Suspense>
  );
}

function FilterItem({ icon, label, children }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="flex items-center gap-2 text-xs text-slate-300">
        {icon}
        <span>{label}</span>
      </label>
      {children}
    </div>
  );
}
