// app/admin/tariffs/page.jsx
"use client";

import { useState, useEffect } from "react";

export default function AdminTariffsPage() {
  const [tariffs, setTariffs] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    creditCount: "",
    price: "",
    discountPercent: "0",
    description: "",
  });
  const [loading, setLoading] = useState(false);

  // محاسبه آنی قیمت نهایی
  const price = parseFloat(formData.price) || 0;
  const discount = parseFloat(formData.discountPercent) || 0;
  const discountedPrice = Math.max(0, Math.round(price - (price * (discount / 100))));

  async function fetchTariffs() {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tariffs`);
      const data = await res.json();
      if (res.ok) setTariffs(data.data);
    } catch (err) {
      console.error("خطا در دریافت تعرفه‌ها", err);
    }
  }

  useEffect(() => {
    fetchTariffs();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tariffs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });
      if (res.ok) {
        alert("تعرفه با موفقیت ایجاد شد");
        setFormData({ title: "", creditCount: "", price: "", discountPercent: "0", description: "" });
        fetchTariffs();
      } else {
        const error = await res.json();
        alert(error.message || "خطا در ثبت تعرفه");
      }
    } catch {
      alert("خطای ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("آیا از حذف این تعرفه مطمئن هستید؟")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tariffs/${id}`, {
        method: "DELETE",credentials: "include",
      });
      if (res.ok) {
        alert("تعرفه حذف شد");
        fetchTariffs();
      }
    } catch {
      alert("خطا در حذف تعرفه");
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8" dir="rtl">
      <h1 className="text-2xl font-black text-slate-800">مدیریت تعرفه‌ها</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* فرم ثبت تعرفه جدید */}
        <form onSubmit={handleSubmit} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-700 mb-2">ثبت تعرفه جدید</h2>
          
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">عنوان تعرفه</label>
            <input
              type="text"
              required
              placeholder="مثال: بسته برنزی"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">تعداد تک (ولت)</label>
              <input
                type="number"
                required
                min="1"
                value={formData.creditCount}
                onChange={(e) => setFormData({ ...formData, creditCount: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">درصد تخفیف</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.discountPercent}
                onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">قیمت اصلی (تومان)</label>
            <input
              type="number"
              required
              min="0"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* محاسبه پویا برای نمایش به ادمین */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1">
            <div className="flex justify-between">
              <span>قیمت اصلی:</span>
              <span className="font-semibold">{price.toLocaleString()} تومان</span>
            </div>
            <div className="flex justify-between text-emerald-600">
              <span>میزان تخفیف:</span>
              <span>{discount}%</span>
            </div>
            <hr className="border-slate-200 my-1" />
            <div className="flex justify-between text-cyan-600 font-bold text-sm">
              <span>قیمت نهایی پرداخت:</span>
              <span>{discountedPrice.toLocaleString()} تومان</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">توضیحات</label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2.5 rounded-xl text-sm transition-all"
          >
            {loading ? "در حال ثبت..." : "ثبت تعرفه"}
          </button>
        </form>

        {/* لیست تعرفه‌ها برای ادمین */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-slate-700">لیست تعرفه‌های فعال</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tariffs.map((tariff) => (
              <div key={tariff.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-slate-800">{tariff.title}</h3>
                    <button
                      onClick={() => handleDelete(tariff.id)}
                      className="text-red-500 hover:text-red-700 text-xs font-medium"
                    >
                      حذف
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{tariff.description || "بدون توضیح"}</p>
                  <div className="mt-4 flex gap-4 text-xs font-semibold text-slate-600">
                    <span>تک: {tariff.creditCount} عدد</span>
                    {tariff.discountPercent > 0 && (
                      <span className="text-rose-500">تخفیف: {tariff.discountPercent}%</span>
                    )}
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-baseline">
                  <span className="text-xs text-slate-400">قیمت نهایی:</span>
                  <span className="font-black text-slate-800">{tariff.discountedPrice.toLocaleString()} تومان</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
