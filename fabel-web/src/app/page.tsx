import Hero from "@/components/customer/Hero";
import FeaturedCategories from "@/components/customer/FeaturedCategories";
import TrendingProducts from "@/components/customer/TrendingProducts";
import Testimonials from "@/components/customer/Testimonials";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <Hero />
      <TrendingProducts />
      <FeaturedCategories />

      {/* Customer Testimonials */}
      {/* <Testimonials /> */}

      {/* Decorative Brand Section */}
      <section className="py-24 bg-background overflow-hidden border-b border-border">
        <div className="flex whitespace-nowrap overflow-hidden">
          <div className="flex animate-pulse opacity-[0.03] w-full justify-center py-10">
            <img src="/fabel.png" alt="FABEL" className="h-24 md:h-48 object-contain" />
          </div>
        </div>
      </section>
    </div>
  );
}
