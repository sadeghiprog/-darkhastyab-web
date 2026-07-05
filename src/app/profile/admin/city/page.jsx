"use client";

import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function AdminCitiesPage() {
  const [cities, setCities] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [provinceId, setProvinceId] = useState("");

  const [form, setForm] = useState({
    name: "",
    provinceId: "",
  });

  const [editingId, setEditingId] = useState(null);

  const selectedProvince = provinces.find(
    (p) => p.id == provinceId
  );

  const fetchCities = async (pid) => {
    if (!pid) {
      setCities([]);
      return;
    }

    const res = await fetch(
      `${API}/admin/cities?provinceId=${pid}`,
      { credentials: "include" }
    );

    const data = await res.json();
    setCities(data.cities);
  };

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

  useEffect(() => {
    fetchCities(provinceId);
  }, [provinceId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const method = editingId ? "PATCH" : "POST";
    const url = editingId
      ? `${API}/admin/cities/${editingId}`
      : `${API}/admin/cities`;

    await fetch(url, {
      method,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    setForm({
      name: "",
      provinceId: provinceId,
    });

    setEditingId(null);
    fetchCities(provinceId);
  };

  const handleDelete = async (id) => {
    if (!confirm("حذف شود؟")) return;

    await fetch(`${API}/admin/cities/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    fetchCities(provinceId);
  };

  const startEdit = (city) => {
    setEditingId(city.id);
    setForm({
      name: city.name,
      provinceId: city.provinceId,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">
            مدیریت شهرها
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            مدیریت شهرها بر اساس استان
          </p>
        </div>

        {provinceId && (
          <div className="text-xs bg-gray-100 px-3 py-1 rounded-full">
            {selectedProvince?.name} • {cities.length} شهر
          </div>
        )}
      </div>

      {/* Province Filter */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-2">
        <label className="text-xs text-gray-500">
          انتخاب استان
        </label>

        <select
          value={provinceId}
          onChange={(e) => {
            setProvinceId(e.target.value);
            setForm({
              ...form,
              provinceId: e.target.value,
            });
          }}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
        >
          <option value="">انتخاب کنید</option>
          {provinces.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Form */}
      {provinceId && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <form
            onSubmit={handleSubmit}
            className="flex gap-3 items-end"
          >
            <div className="flex-1">
              <label className="text-xs text-gray-500 block mb-1">
                نام شهر
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

            <button className="bg-black text-white text-sm px-5 py-2.5 rounded-xl hover:opacity-90 transition">
              {editingId ? "ذخیره" : "افزودن"}
            </button>
          </form>
        </div>
      )}

      {/* Cities Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">

        {!provinceId ? (
          <div className="p-10 text-center text-sm text-gray-400">
            برای مشاهده شهرها یک استان انتخاب کنید
          </div>
        ) : cities.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-400">
            شهری ثبت نشده است
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs">
              <tr>
                <th className="p-4 text-right font-medium">
                  نام شهر
                </th>
                <th className="p-4 text-right font-medium w-32">
                  عملیات
                </th>
              </tr>
            </thead>

            <tbody>
              {cities.map((city) => (
                <tr
                  key={city.id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="p-4">
                    {city.name}
                  </td>

                  <td className="p-4 flex gap-4 text-xs">
                    <button
                      onClick={() => startEdit(city)}
                      className="text-gray-600 hover:text-black transition"
                    >
                      ویرایش
                    </button>

                    <button
                      onClick={() => handleDelete(city.id)}
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
