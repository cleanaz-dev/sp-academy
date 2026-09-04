"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Check, 
  Sparkles, 
  MessageSquare, 
  BookOpen, 
  Mic, 
  Activity, 
  ArrowRight,
  Globe2
} from "lucide-react";
import Link from "next/link";

export default function PricingPage() {
  const [isHovered, setIsHovered] = useState(false);

  // We will plug Stripe into this button next!
  const handleCheckout = () => {
    console.log("Redirecting to Stripe...");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F8F9FC] font-sans selection:bg-violet-200">
      
      {/* Decorative Background Blobs */}
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-violet-400/20 blur-[120px]" />
      <div className="pointer-events-none absolute -left-40 top-40 -z-10 h-[400px] w-[400px] rounded-full bg-teal-400/10 blur-[100px]" />
      <div className="pointer-events-none absolute -right-40 top-80 -z-10 h-[500px] w-[500px] rounded-full bg-indigo-400/10 blur-[100px]" />

      <div className="mx-auto max-w-7xl px-6 pb-24 pt-20 lg:pt-32">
        
        {/* Header Section */}
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-violet-100 px-4 py-1.5 text-sm font-bold text-violet-700">
              <Sparkles className="h-4 w-4" /> The Ultimate Language Experience
            </span>
            <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-gray-900 lg:text-6xl">
              Master a new language. <br />
              <span className="animate-[gradient_6s_ease_infinite] bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 bg-clip-text text-transparent bg-[length:200%_auto]">
                Faster than ever.
              </span>
            </h1>
            <p className="mb-10 text-lg font-medium text-gray-600 lg:text-xl">
              Traditional tutors cost $40 an hour. Get 24/7 access to immersive AI conversations, personalized reviews, and bilingual books for less than a cup of coffee a week.
            </p>
          </motion.div>
        </div>

        {/* Pricing Layout */}
        <div className="mx-auto mt-8 grid max-w-6xl gap-12 lg:grid-cols-12 lg:gap-8 items-center">
          
          {/* Left Side: Value Breakdown */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-7 grid gap-6 sm:grid-cols-2"
          >
            <FeatureCard 
              icon={<MessageSquare className="h-6 w-6 text-indigo-600" />}
              title="Structured AI Conversations"
              description="Roleplay real-world scenarios. Order food, navigate airports, or ace a job interview in your target language."
              color="bg-indigo-50"
            />
            <FeatureCard 
              icon={<Mic className="h-6 w-6 text-violet-600" />}
              title="Freestyle Speaking"
              description="Ditch the script. Have open-ended, natural chats with AI native speakers that adapt to your specific level."
              color="bg-violet-50"
            />
            <FeatureCard 
              icon={<BookOpen className="h-6 w-6 text-teal-600" />}
              title="Bilingual Books"
              description="Perfect for beginners. Read engaging stories with side-by-side translations to build vocabulary naturally."
              color="bg-teal-50"
            />
            <FeatureCard 
              icon={<Activity className="h-6 w-6 text-emerald-600" />}
              title="Deep-Dive Analytics"
              description="Your personal Learning Hub tracks grammar mistakes, pronunciation scores, and fluency progress."
              color="bg-emerald-50"
            />
          </motion.div>

          {/* Right Side: The Pricing Card */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-5"
          >
            <div className="relative rounded-3xl bg-white p-8 shadow-2xl shadow-violet-500/10 border border-gray-100 xl:p-10">
              {/* Badge */}
              <div className="absolute -top-5 left-0 right-0 mx-auto w-fit rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-1.5 text-sm font-bold text-white shadow-md">
                Launch Special 🚀
              </div>

              <div className="text-center mb-8 mt-2">
                <h3 className="text-2xl font-bold text-gray-900">Pro Learner</h3>
                <p className="mt-2 text-sm text-gray-500 font-medium">Everything you need to reach fluency.</p>
                <div className="mt-6 flex items-center justify-center gap-1">
                  <span className="text-3xl font-bold text-gray-400">$</span>
                  <span className="text-6xl font-extrabold text-gray-900 tracking-tighter">20</span>
                  <span className="text-lg font-medium text-gray-500 self-end mb-2">/mo</span>
                </div>
              </div>

              <ul className="mb-8 space-y-4">
                {[
                  "Unlimited AI Conversations",
                  "Unlimited Freestyle Sessions",
                  "Access to all Bilingual Books",
                  "Advanced Grammar & Accent Review",
                  "Progress tracking in Learning Hub",
                  "Cancel anytime, no questions asked"
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-100 mt-0.5">
                      <Check className="h-4 w-4 text-violet-600 stroke-[3]" />
                    </div>
                    <span className="text-gray-700 font-medium">{feature}</span>
                  </li>
                ))}
              </ul>

              <button 
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={handleCheckout}
                className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gray-900 px-8 py-4 text-lg font-bold text-white transition-all hover:bg-gray-800 hover:shadow-xl hover:shadow-gray-900/20 active:scale-[0.98]"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Unlock Full Access
                  <ArrowRight className={`h-5 w-5 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`} />
                </span>
                {/* Subtle button gradient shine effect */}
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 ease-in-out group-hover:translate-x-full" />
              </button>

              <div className="mt-6 text-center text-sm font-medium text-gray-400 flex items-center justify-center gap-2">
                <Globe2 className="h-4 w-4" /> Join learners from 50+ countries
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}

// Reusable micro-component for the features grid
function FeatureCard({ icon, title, description, color }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 transition-all hover:-translate-y-1 hover:shadow-md">
      <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
        {icon}
      </div>
      <h4 className="mb-2 text-lg font-bold text-gray-900">{title}</h4>
      <p className="text-sm font-medium text-gray-500 leading-relaxed">
        {description}
      </p>
    </div>
  );
}