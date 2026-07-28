"use client";

import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import SupplierCard from "../common/SupplierCard";
import Link from "next/link";

export default function TopSuppliersSection() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [emblaRef] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      dragplus: false,
      skipSnaps: false,
      containScroll: "trimSnaps",
    },
    [
      Autoplay({
        delay: 3000,
        stopOnMouseEnter: true,
        stopOnInteraction: false,
      }),
    ]
  );

  useEffect(() => {
    fetchTopSuppliers();
  }, []);

  async function fetchTopSuppliers() {
    try {
      setLoading(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/suppliers?page=1&limit=10`
      );

      const data = await res.json();
      setSuppliers(data.suppliers || []);
    } catch (err) {
      console.error("Error fetching suppliers:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return null;
  if (!suppliers.length) return null;

  return (
    <section className="mt-10 w-full px-4 sm:px-6 lg:px-8 mb-10" dir="rtl">
      <div className="mx-auto max-w-7xl mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg md:text-xl font-bold text-slate-900">
            تأمین‌کنندگان برتر
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            برترین تأمین‌کنندگان بر اساس امتیاز و تعامل واقعی
          </p>
        </div>

        <Link
          href="/suppliers"
          className="text-xs font-semibold text-blue-600 hover:text-blue-700"
        >
          مشاهده همه
        </Link>
      </div>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-3 sm:gap-4 touch-pan-y">
          {suppliers.map((supplier) => (
            <div
              key={supplier.id}
              className="
                flex-shrink-0
                basis-[82%]
                sm:basis-[48%]
                lg:basis-[31%]
                xl:basis-[24%]
              "
            >
              <SupplierCard supplier={supplier} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
