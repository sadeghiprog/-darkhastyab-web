"use client";

import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    parentId: "",
    sortOrder: 0,
  });
  const [editingId, setEditingId] = useState(null);

  const fetchCategories = async () => {
    const res = await fetch(`${API}/admin/categories`, {
      credentials: "include",
    });
    const data = await res.json();
    setCategories(data.categories);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const method = editingId ? "PATCH" : "POST";
    const url = editingId
      ? `${API}/admin/categories/${editingId}`
      : `${API}/admin/categories`;

    await fetch(url, {
      method,
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        parentId: form.parentId || null,
      }),
    });

    setForm({
      name: "",
      slug: "",
      parentId: "",
      sortOrder: 0,
    });

    setEditingId(null);
    fetchCategories();
  };

  const handleDelete = async (id) => {
    if (!confirm("حذف شود؟")) return;

    await fetch(`${API}/admin/categories/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    fetchCategories();
  };

  const startEdit = (cat) => {
    setEditingId(cat.id);
    setForm({
      name: cat.name,
      slug: cat.slug,
      parentId: cat.parentId || "",
      sortOrder: cat.sortOrder,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">
          مدیریت دسته‌بندی‌ها
        </h1>

        <span className="text-xs text-gray-400">
          {categories.length} دسته
        </span>
      </div>

      {/* FORM */}
      <div className="bg-white border rounded-xl p-5">

        <form onSubmit={handleSubmit} className="space-y-4">

          <div className="grid md:grid-cols-2 gap-4">

            <input
              placeholder="نام دسته"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-gray-300"
              required
            />

            <input
              placeholder="slug"
              value={form.slug}
              onChange={(e) =>
                setForm({ ...form, slug: e.target.value })
              }
              className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-gray-300"
              required
            />

            <select
              value={form.parentId}
              onChange={(e) =>
                setForm({ ...form, parentId: e.target.value })
              }
              className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-gray-300"
            >
              <option value="">بدون والد</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="sort"
              value={form.sortOrder}
              onChange={(e) =>
                setForm({
                  ...form,
                  sortOrder: Number(e.target.value),
                })
              }
              className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-gray-300"
            />

          </div>

          <button className="bg-black text-white text-sm px-4 py-2 rounded-lg">
            {editingId ? "ذخیره" : "افزودن"}
          </button>

        </form>
      </div>

      {/* TABLE */}
      <div className="bg-white border rounded-xl overflow-hidden">

        {categories.length === 0 ? (
          <div className="p-6 text-center text-gray-400 text-sm">
            دسته‌ای وجود ندارد
          </div>
        ) : (
          <table className="w-full text-sm">

            <thead className="bg-gray-50 text-gray-500 text-xs">
              <tr>
                <th className="p-3 text-right">نام</th>
                <th className="p-3 text-right">slug</th>
                <th className="p-3 text-right">والد</th>
                <th className="p-3 text-right">عملیات</th>
              </tr>
            </thead>

            <tbody>
              {categories.map((cat) => (
                <tr
                  key={cat.id}
                  className="border-t hover:bg-gray-50"
                >
                  <td className="p-3">{cat.name}</td>

                  <td className="p-3 text-gray-500">
                    {cat.slug}
                  </td>

                  <td className="p-3 text-gray-500">
                    {cat.parent?.name || "-"}
                  </td>

                  <td className="p-3 flex gap-3">
                    <button
                      onClick={() => startEdit(cat)}
                      className="text-blue-600 text-xs"
                    >
                      ویرایش
                    </button>

                    <button
                      onClick={() => handleDelete(cat.id)}
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
