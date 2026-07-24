import Hero from "@/components/Hero";
import QRBuilder from "@/components/QRBuilder";
import StatsSection from "@/components/StatsSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <main>
        <Hero />
        <QRBuilder />
        <StatsSection />
      </main>
      <Footer />
    </>
  );
}
