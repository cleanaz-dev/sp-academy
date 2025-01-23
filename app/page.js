import FeaturesSection from "@/components/landing-page/FeaturesSection";
import HeroSection from "@/components/landing-page/HeroSection";
import Navbar from "@/components/landing-page/Navbar";
import StatsSection from "@/components/landing-page/StatsSection";
import { ScrollArea } from "@/components/ui/scroll-area-landing";
import React from "react";

export default function Home() {
  return (
        <div>
      
        {/* <LandingPage /> */}
        {/* <Navbar /> */}
        <HeroSection />
        <FeaturesSection />
        <StatsSection />
        </div>
  );
}
