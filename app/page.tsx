import Hero from "@/components/Hero";
import QRBuilder from "@/components/QRBuilder";
import StatsSection from "@/components/StatsSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <main>
        <Hero />
        <div className="max-md:hidden">
          <QRBuilder />
        </div>
        <StatsSection />
      </main>
      <Footer />
    </>
  );
}
