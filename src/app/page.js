import Hero from "../components/home/Hero";
import FilterBar from "../components/common/FilterBar";
import StatsCards from "../components/home/StatsCards";
import LatestRequestsSection from "../components/home/LatestRequestsSection";
import TopSuppliersSection from "../components/home/TopSuppliersSection";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Hero />

      <section className="mt-8 w-full px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-12">
            <div className="lg:col-span-9">
              <FilterBar />
            </div>

            <div className="lg:col-span-3">
              <StatsCards />
            </div>
          </div>
        </div>
      </section>

      <LatestRequestsSection />
            <TopSuppliersSection />

    </main>
  );
}
