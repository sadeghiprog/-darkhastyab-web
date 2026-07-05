"use client";

import { useState } from "react";

export default function SupplyModal({ open, onClose, onSubmit }) {
  const [quantity, setQuantity] = useState("");
  const [unitId, setUnitId] = useState("");
  const [price, setPrice] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-3xl p-6 w-[420px]">
        <h3 className="font-black mb-4">ارسال پیشنهاد تامین</h3>

        <input
          placeholder="مقدار"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="w-full border rounded-xl p-3 mb-3"
        />

        <input
          placeholder="شناسه واحد"
          value={unitId}
          onChange={(e) => setUnitId(e.target.value)}
          className="w-full border rounded-xl p-3 mb-3"
        />

        <input
          placeholder="قیمت پیشنهادی"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full border rounded-xl p-3 mb-4"
        />

        <div className="flex gap-2">
          <button
            onClick={() => onSubmit({ quantity, unitId, price })}
            className="bg-cyan-500 text-white px-4 py-2 rounded-xl"
          >
            ارسال
          </button>

          <button
            onClick={onClose}
            className="border px-4 py-2 rounded-xl"
          >
            انصراف
          </button>
        </div>
      </div>
    </div>
  );
}
