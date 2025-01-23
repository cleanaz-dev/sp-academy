//components/NewLandingPage.jsx
"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HeroSection() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-400/10 via-emerald-400/10 to-purple-400/10 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 w-full h-full">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
          className="absolute top-[10%] left-[10%] w-72 h-72 bg-gradient-to-r from-sky-400 to-emerald-400 rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 3, repeat: Infinity, repeatType: "reverse", delay: 1 }}
          className="absolute bottom-[10%] right-[10%] w-72 h-72 bg-gradient-to-r from-amber-400 to-purple-400 rounded-full blur-3xl"
        />
      </div>

      {/* Main Container */}
      <div className="relative container mx-auto max-w-5xl h-screen px-4">
        {/* Content Wrapper */}
        <div className="h-full flex flex-col md:flex-row items-center gap-12 py-32 md:py-8 md:mx-24">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            className="flex-1"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className=""
            >
              <span className="px-4 py-2 rounded-full bg-gradient-to-r from-sky-400 to-emerald-400 text-white text-sm font-medium shadow-lg shadow-sky-400/20">
                Learning Made Magical ✨
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-8 text-4xl sm:text-5xl lg:text-7xl font-bold"
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-emerald-400 to-amber-400">
                Spoon
              </span>
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-purple-400 to-sky-400">
                Academy
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-6 text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-xl mx-auto lg:mx-0"
            >
              Where every child's potential unfolds through playful learning and
              creative discovery. Join us on a journey of wonder and growth!
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link href="/sign-up">
              <Button className="border-2 bg-gradient-to-r from-sky-400 to-emerald-400 hover:from-sky-500 hover:to-emerald-500 text-white px-8 py-6 rounded-full text-lg shadow-lg shadow-sky-400/20 transition-all duration-300 hover:scale-105">
                Begin the Adventure
              </Button>
              </Link>
              <Button
                variant="outline"
                className="border-2 border-purple-400 text-purple-400 px-8 py-6 rounded-full text-lg hover:bg-purple-50 transition-all duration-300 hover:scale-105"
              >
                Take a Tour 🎯
              </Button>
             
            </motion.div>
          </motion.div>

          {/* Right Content - Floating Elements */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="relative w-full h-1/2 aspect-square"
          >
            {/* Animated floating elements */}
            <motion.div
              animate={{
                y: [0, -20, 0],
                rotate: [0, 5, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute top-[20%] left-[20%] w-[30%] aspect-square bg-gradient-to-r from-sky-400 to-emerald-400 rounded-2xl shadow-xl backdrop-blur-sm"
            />
            <motion.div
              animate={{
                y: [0, 20, 0],
                rotate: [0, -5, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              }}
              className="absolute bottom-[20%] right-[60%] w-[30%] aspect-square bg-gradient-to-r from-amber-400 to-purple-400 rounded-full shadow-xl backdrop-blur-sm"
            />
            <motion.div
              animate={{
                y: [-10, 10, -10],
                x: [-10, 10, -10],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[40%] aspect-square bg-gradient-to-r from-purple-400 to-sky-400 rounded-3xl shadow-xl backdrop-blur-sm"
            />

            {/* Additional floating element */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 360],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute top-[40%] right-[40%] w-[15%] aspect-square bg-gradient-to-r from-emerald-400 to-amber-400 rounded-lg shadow-lg"
            />
          </motion.div>
        </div>
      </div>

      {/* Animated particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [-10, -30, -10],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
          className="absolute w-2 h-2 bg-white rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        />
      ))}

      {/* Glass effect overlay */}
      <div className="absolute inset-0 bg-white/10  pointer-events-none" />
    </main>
  );
}