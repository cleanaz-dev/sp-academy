import FamilySection from "@/components/landing-page/FamilySection";
import FeaturesSection from "@/components/landing-page/FeaturesSection";
import FooterSection from "@/components/landing-page/FooterSection";


import StatsSection from "@/components/landing-page/StatsSection";
import HeroSection from "@/components/ui/site/hero-section";
import NavigationBar from "@/components/ui/site/nav-bar";
import React from "react";

export default function Home() {
  return (
    <div>
      {/* <LandingPage /> */}
      <NavigationBar />
      <HeroSection />
      <FeaturesSection />
      <FamilySection />
      <StatsSection />
      <FooterSection />
    </div>
  );
}
