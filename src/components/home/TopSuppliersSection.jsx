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
      direction: "rtl", // برای سازگاری کامل با جهت صفحه
      skipSnaps: false,
      containScroll: "trimSnaps",
    },
    [
      Autoplay({
        delay: 3500,
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

  if (loading || !suppliers.length) return null;

  return (
    <section className="mt-10 w-full px-4 sm:px-6 lg:px-8 mb-16" dir="rtl">
      <div className="mx-auto max-w-7xl mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg md:text-xl font-bold text-slate-900">
            تأمین‌کنندگان برتر
          </h2>
          <p className="mt-1 text-[11px] sm:text-xs text-slate-500">
            برترین تأمین‌کنندگان بر اساس امتیاز و تعامل واقعی
          </p>
        </div>

        <Link
          href="/suppliers"
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full transition-colors"
        >
          مشاهده همه
        </Link>
      </div>

      {/* کانتینر اصلی Embla */}
      <div className="overflow-hidden cursor-grab active:cursor-grabbing" ref={emblaRef}>
        <div className="flex -ml-4"> {/* استفاده از منفی برای جبران فاصله بین اسلایدها */}
          {suppliers.map((supplier) => (
            <div
              key={supplier.id}
              className="
                flex-[0_0_85%] 
                min-w-0 
                pl-4 
                sm:flex-[0_0_50%] 
                lg:flex-[0_0_33.33%] 
                xl:flex-[0_0_25%]
              "
            >
              <div className="h-full py-2"> {/* فضای اضافه برای سایه کارت‌ها */}
                <SupplierCard supplier={supplier} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
