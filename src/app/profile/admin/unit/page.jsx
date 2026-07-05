"use client";

import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function AdminUnitsPage() {
  const [units, setUnits] = useState([]);

  const [form, setForm] = useState({
    name: "",
    symbol: "",
    sortOrder: 0,
    isActive: true,
  });

  const [editingId, setEditingId] = useState(null);

  const fetchUnits = async () => {
    const res = await fetch(`${API}/admin/units`, {
      credentials: "include",
    });
    const data = await res.json();
    setUnits(data.units);
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const method = editingId ? "PATCH" : "POST";
    const url = editingId
      ? `${API}/admin/units/${editingId}`
      : `${API}/admin/units`;

    await fetch(url, {
      method,
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        sortOrder: Number(form.sortOrder),
      }),
    });

    setForm({
      name: "",
      symbol: "",
      sortOrder: 0,
      isActive: true,
    });

    setEditingId(null);
    fetchUnits();
  };

  const handleDelete = async (id) => {
    if (!confirm("حذف شود؟")) return;

    await fetch(`${API}/admin/units/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    fetchUnits();
  };

  const startEdit = (unit) => {
    setEditingId(unit.id);
    setForm(unit);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">مدیریت واحدها</h1>
          <p className="text-sm text-gray-500 mt-1">
            تعریف واحدهای اندازه‌گیری برای درخواست‌ها
          </p>
        </div>

        <span className="text-xs bg-gray-100 px-3 py-1 rounded-full">
          {units.length} واحد
        </span>
      </div>

      {/* Form Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 items-end">

          <div className="flex-1 min-w-[180px]">
            <label className="text-xs text-gray-500 block mb-1">
              نام واحد
            </label>
            <input
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
              required
            />
          </div>

          <div className="w-[140px]">
            <label className="text-xs text-gray-500 block mb-1">
              نماد
            </label>
            <input
              value={form.symbol}
              onChange={(e) =>
                setForm({ ...form, symbol: e.target.value })
              }
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-black"
              required
            />
          </div>

          <div className="w-[110px]">
            <label className="text-xs text-gray-500 block mb-1">
              ترتیب
            </label>
            <input
              type="number"
              value={form.sortOrder}
              onChange={(e) =>
                setForm({ ...form, sortOrder: e.target.value })
              }
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          <div className="w-[130px]">
            <label className="text-xs text-gray-500 block mb-1">
              وضعیت
            </label>
            <select
              value={form.isActive}
              onChange={(e) =>
                setForm({
                  ...form,
                  isActive: e.target.value === "true",
                })
              }
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
            >
              <option value="true">فعال</option>
              <option value="false">غیرفعال</option>
            </select>
          </div>

          <button className="bg-black text-white text-sm px-6 py-2.5 rounded-xl hover:opacity-90 transition">
            {editingId ? "ذخیره" : "افزودن"}
          </button>

        </form>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">

        {units.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-400">
            هنوز واحدی ثبت نشده است
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500">
              <tr>
                <th className="p-4 text-right font-medium">نام</th>
                <th className="p-4 text-right font-medium">نماد</th>
                <th className="p-4 text-right font-medium">ترتیب</th>
                <th className="p-4 text-right font-medium">وضعیت</th>
                <th className="p-4 text-right font-medium w-28">عملیات</th>
              </tr>
            </thead>

            <tbody>
              {units.map((unit) => (
                <tr
                  key={unit.id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="p-4">{unit.name}</td>

                  <td className="p-4 font-mono text-gray-600">
                    {unit.symbol}
                  </td>

                  <td className="p-4">{unit.sortOrder}</td>

                  <td className="p-4">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        unit.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {unit.isActive ? "فعال" : "غیرفعال"}
                    </span>
                  </td>

                  <td className="p-4 flex gap-4 text-xs">
                    <button
                      onClick={() => startEdit(unit)}
                      className="text-gray-600 hover:text-black transition"
                    >
                      ویرایش
                    </button>

                    <button
                      onClick={() => handleDelete(unit.id)}
                      className="text-gray-400 hover:text-red-600 transition"
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
