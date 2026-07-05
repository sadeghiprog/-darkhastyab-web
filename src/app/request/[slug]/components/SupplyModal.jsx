"use client";

import React, { useEffect, useState } from "react";
import { API_BASE } from "../utils/constants";

export default function SupplyModal({ open, onClose, onSubmit }) {
  const [quantity, setQuantity] = useState("");
  const [unitId, setUnitId] = useState("");
  const [price, setPrice] = useState("");

  const [units, setUnits] = useState([]);
  const [loadingUnits, setLoadingUnits] = useState(false);

  useEffect(() => {
    if (!open) return;

    const fetchUnits = async () => {
      try {
        setLoadingUnits(true);

        const res = await fetch(`${API_BASE}/units`, {
          cache: "no-store",
          credentials: "include",
        });

        if (!res.ok) throw new Error();

        const data = await res.json();
        setUnits(data.units || data || []);
      } catch {
        setUnits([]);
      } finally {
        setLoadingUnits(false);
      }
    };

    fetchUnits();
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-[420px] rounded-3xl bg-white p-6 shadow-2xl">
        <h3 className="mb-5 text-sm font-black text-slate-800">
          ارسال پیشنهاد تامین
        </h3>

        <input
          placeholder="مقدار"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="mb-3 w-full rounded-2xl border border-slate-200 p-3 text-sm"
        />

        <select
          value={unitId}
          onChange={(e) => setUnitId(e.target.value)}
          className="mb-3 w-full rounded-2xl border border-slate-200 p-3 text-sm"
        >
          <option value="">انتخاب واحد</option>

          {loadingUnits ? (
            <option>در حال بارگذاری...</option>
          ) : (
            units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))
          )}
        </select>

        <input
          placeholder="قیمت پیشنهادی"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="mb-4 w-full rounded-2xl border border-slate-200 p-3 text-sm"
        />

        <div className="flex gap-3">
          <button
            onClick={() =>
              onSubmit({
                quantity,
                unitId,
                price,
              })
            }
            className="flex-1 rounded-2xl bg-cyan-500 py-2 text-xs font-black text-white"
          >
            ارسال پیشنهاد
          </button>

          <button
            onClick={onClose}
            className="flex-1 rounded-2xl border border-slate-200 py-2 text-xs font-black text-slate-600"
          >
            انصراف
          </button>
        </div>
      </div>
    </div>
  );
}
