import Hero from "./components/Hero";
import Stats from "./components/Stats";
import DashboardPreview from "./components/DashboardPreview";
import FeaturesGrid from "./components/FeaturesGrid";
import HowItWorks from "./components/HowItWorks";
import Testimonials from "./components/Testimonials";
import CTA from "./components/CTA";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <>
      <Hero />
      <Stats />
      <DashboardPreview />
      <FeaturesGrid />
      <HowItWorks />
      <Testimonials />
      <CTA />
      <Footer />
    </>
  );
}