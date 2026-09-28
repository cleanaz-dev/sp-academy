
import FooterSection from "@/components/landing-page/FooterSection";



import FeaturesSection from "@/components/ui/site/feature-section";
import HeroSection from "@/components/ui/site/hero-section";
import NavigationBar from "@/components/ui/site/nav-bar";
import PricingSection from "@/components/ui/site/pricing-section";
import StatsSection from "@/components/ui/site/stats-section";


export default function Home() {
  return (
    <div>
      {/* <LandingPage /> */}
      <NavigationBar />
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      <StatsSection />
      <FooterSection />
    </div>
  );
}
