"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Sparkles, ArrowRight, PlayCircle, Globe2, Zap, Users, Star } from "lucide-react";

const BOTTOM_FEATURES = [
  {
    id: 1,
    icon: Globe2,
    iconColor: "text-blue-500",
    bgColor: "bg-blue-50",
    title: "Real Conversations",
    desc: "Practice what you'll actually use",
  },
  {
    id: 2,
    icon: Zap,
    iconColor: "text-green-500",
    bgColor: "bg-green-50",
    title: "Personalized Learning",
    desc: "Built for your goals and level",
  },
  {
    id: 3,
    icon: Users,
    iconColor: "text-purple-500",
    bgColor: "bg-purple-50",
    title: "Expert Teachers",
    desc: "Native speakers, real support",
  },
  {
    id: 4,
    icon: Star,
    iconColor: "text-amber-500",
    bgColor: "bg-amber-50",
    title: "Learn Anywhere",
    desc: "On your phone, tablet or computer",
  },
];

export default function HeroSection() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-white selection:bg-blue-100">
      
      {/* Background blobs / subtle gradients can go here */}
      <div className="pointer-events-none absolute inset-0 z-0 h-full w-full">
        {/* We will build out the background graphics when we do the right side */}
      </div>

      <div className="container relative mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-4 md:px-8">
        
        {/* Main Content Split */}
        <div className="flex w-full flex-col gap-12 py-10 lg:flex-row lg:items-center lg:gap-8 lg:py-20">
          
          {/* ========================================= */}
          {/* LEFT SIDE CONTENT                         */}
          {/* ========================================= */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative z-20 flex flex-1 flex-col items-center text-center lg:items-start lg:text-left pt-12 lg:pt-0"
          >
            {/* Top Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-8 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 border border-blue-100/50"
            >
              <Sparkles className="h-4 w-4" />
              Learn a new language, your way
            </motion.div>

            {/* Main Headline */}
            <h1 className="text-5xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl text-[#0B192C]">
              <motion.span 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="block mb-2"
              >
                Real Conversations.
              </motion.span>
              
              <motion.span 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="block text-blue-500 mb-2"
              >
                Real Progress.
              </motion.span>
              
              <motion.span 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="block"
              >
                A <span className="text-green-500">Brighter</span> <span className="text-amber-500">You.</span>
              </motion.span>
            </h1>

            {/* Description Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-6 max-w-lg text-lg text-gray-500 sm:text-xl leading-relaxed"
            >
              SPOON makes language learning simple, fun, and effective.
              Build real-world skills, speak with confidence, and open
              the door to new cultures — one lesson at a time.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mt-10 flex w-full flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start"
            >
              <Link href="/signup">
                <Button className="h-14 w-full rounded-full bg-blue-500 px-8 text-lg font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-105 hover:bg-blue-600 sm:w-auto">
                  Start Learning Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              
              <Button
                variant="outline"
                className="h-14 w-full rounded-full border-gray-200 px-8 text-lg font-semibold text-gray-700 transition-all hover:bg-gray-50 sm:w-auto"
              >
                <PlayCircle className="mr-2 h-5 w-5 text-blue-500" />
                Watch How It Works
              </Button>
            </motion.div>

            {/* Bottom Mini Features List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="mt-16 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4 lg:gap-x-8"
            >
              {BOTTOM_FEATURES.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.id} className="flex flex-col items-center text-center lg:items-start lg:text-left">
                    <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-full ${feature.bgColor}`}>
                      <Icon className={`h-5 w-5 ${feature.iconColor}`} />
                    </div>
                    <h3 className="mb-1 text-sm font-bold text-gray-900">{feature.title}</h3>
                    <p className="text-xs text-gray-500 leading-tight">{feature.desc}</p>
                  </div>
                );
              })}
            </motion.div>
          </motion.div>

          {/* ========================================= */}
          {/* RIGHT SIDE PLACEHOLDER (For Next Step)    */}
          {/* ========================================= */}
          <div className="relative z-10 flex flex-1 items-center justify-center hidden lg:flex">
             <div className="h-[600px] w-full rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center text-gray-400 font-medium">
               Right Side Graphics / Phone Mockup Will Go Here
             </div>
          </div>

        </div>
      </div>
    </main>
  );
}