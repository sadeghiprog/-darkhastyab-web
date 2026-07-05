"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import SupplierHeader from "../../../components/common/SupplierHeader";
import SupplierOfferCard from "../../../components/common/SupplierOfferCard";

export default function SupplierPage() {
  const { id } = useParams();

  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    let active = true;

    async function load() {
      try {
        setLoading(true);

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/supplier-profile/${id}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!res.ok) throw new Error("تامین‌کننده پیدا نشد");

        const data = await res.json();
        if (active) setSupplier(data.supplier);
      } catch (err) {
        if (active) setError(err.message || "خطا در دریافت اطلاعات تامین‌کننده");
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto py-20 text-center text-slate-500">
        در حال بارگذاری اطلاعات تامین‌کننده...
      </div>
    );
  }

  if (error || !supplier) {
    return (
      <div className="container mx-auto py-20 text-center text-red-500">
        {error || "تامین‌کننده پیدا نشد"}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-10">
        
        <SupplierHeader supplier={supplier} />

        <div className="mt-8">
          <h2 className="font-bold text-lg mb-4 text-slate-800">
            آخرین پیشنهادها
          </h2>

          <div className="space-y-3">
            {supplier.offers?.length > 0 ? (
              supplier.offers.map((offer) => (
                <SupplierOfferCard
                  key={offer.id}
                  offer={offer}
                  supplier={supplier}   // نکته مهم: پاس دادن supplier برای جلوگیری از undefined
                />
              ))
            ) : (
              <div className="text-center py-8 text-slate-500 bg-white rounded-xl border border-slate-100">
                هیچ پیشنهادی توسط این تامین‌کننده ثبت نشده است.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
