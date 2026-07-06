// فایل صفحه اصلی (HomePage)

import Hero from "../components/home/Hero";
import FilterBar from "../components/common/FilterBar";
import StatsCards from "../components/home/StatsCards";
import LatestRequestsSection from "../components/home/LatestRequestsSection";
import TopSuppliersSection from "../components/home/TopSuppliersSection";

export default function HomePage() {
  return (
    // اضافه کردن overflow-x-hidden برای جلوگیری از اسکرول عرضی ناخواسته در موبایل
    <main className="min-h-screen bg-slate-50 overflow-x-hidden pb-12">
      
      {/* هیرو سکشن */}
      <div className="relative z-10">
        <Hero />
      </div>

      {/* بخش فیلترها و آمار */}
      <section className="relative z-20 -mt-6 w-full px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
            
            {/* نوار فیلتر */}
            <div className="lg:col-span-9 transform-gpu">
              <FilterBar />
            </div>

            {/* کارت‌های آمار */}
            <div className="lg:col-span-3 transform-gpu">
              <StatsCards />
            </div>
            
          </div>
        </div>
      </section>

      {/* بخش آخرین درخواست‌ها با ایجاد فاصله و لایه مجزا */}
      <section className="relative z-10 mt-12 block clear-both">
        <LatestRequestsSection />
      </section>

      {/* تامین‌کنندگان برتر */}
      <section className="relative z-10 mt-8 block">
        <TopSuppliersSection />
      </section>

    </main>
  );
}
