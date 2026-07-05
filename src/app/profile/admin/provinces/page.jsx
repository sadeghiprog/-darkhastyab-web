"use client";

import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function AdminProvincesPage() {
  const [provinces, setProvinces] = useState([]);
  const [form, setForm] = useState({
    name: "",
  });
  const [editingId, setEditingId] = useState(null);

  const fetchProvinces = async () => {
    const res = await fetch(`${API}/admin/provinces`, {
      credentials: "include",
    });
    const data = await res.json();
    setProvinces(data.provinces);
  };

  useEffect(() => {
    fetchProvinces();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const method = editingId ? "PATCH" : "POST";
    const url = editingId
      ? `${API}/admin/provinces/${editingId}`
      : `${API}/admin/provinces`;

    await fetch(url, {
      method,
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setForm({
      name: "",
    });

    setEditingId(null);
    fetchProvinces();
  };

  const handleDelete = async (id) => {
    if (!confirm("حذف شود؟")) return;

    await fetch(`${API}/admin/provinces/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    fetchProvinces();
  };

  const startEdit = (province) => {
    setEditingId(province.id);
    setForm({
      name: province.name,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">

      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">
          مدیریت استان‌ها
        </h1>

        <span className="text-xs text-gray-400">
          {provinces.length} استان
        </span>
      </div>

      <div className="bg-white border rounded-xl p-5">

        <form onSubmit={handleSubmit} className="space-y-4">

          <div className="grid md:grid-cols-2 gap-4">

            <input
              placeholder="نام استان"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-gray-300"
              required
            />

          </div>

          <button className="bg-black text-white text-sm px-4 py-2 rounded-lg">
            {editingId ? "ذخیره" : "افزودن"}
          </button>

        </form>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden">

        {provinces.length === 0 ? (
          <div className="p-6 text-center text-gray-400 text-sm">
            استانی وجود ندارد
          </div>
        ) : (
          <table className="w-full text-sm">

            <thead className="bg-gray-50 text-gray-500 text-xs">
              <tr>
                <th className="p-3 text-right">نام استان</th>
                <th className="p-3 text-right">عملیات</th>
              </tr>
            </thead>

            <tbody>
              {provinces.map((province) => (
                <tr
                  key={province.id}
                  className="border-t hover:bg-gray-50"
                >
                  <td className="p-3">{province.name}</td>

                  <td className="p-3 flex gap-3">
                    <button
                      onClick={() => startEdit(province)}
                      className="text-blue-600 text-xs"
                    >
                      ویرایش
                    </button>

                    <button
                      onClick={() => handleDelete(province.id)}
                      className="text-red-600 text-xs"
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
