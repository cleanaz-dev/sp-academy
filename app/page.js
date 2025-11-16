import FamilySection from "@/components/landing-page/FamilySection";
import FeaturesSection from "@/components/landing-page/FeaturesSection";
import FooterSection from "@/components/landing-page/FooterSection";
import HeroSection from "@/components/landing-page/HeroSection";
import NavigationBar from "@/components/landing-page/nav-bar";
import StatsSection from "@/components/landing-page/StatsSection";
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
