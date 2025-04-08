//components/NewLandingPage.jsx
"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HeroSection() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-sky-400/10 via-emerald-400/10 to-purple-400/10">
      {/* Animated background elements */}
      <div className="absolute inset-0 h-full w-full">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
          className="absolute left-[10%] top-[10%] h-72 w-72 rounded-full bg-gradient-to-r from-sky-400 to-emerald-400 blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse",
            delay: 1,
          }}
          className="absolute bottom-[10%] right-[10%] h-72 w-72 rounded-full bg-gradient-to-r from-amber-400 to-purple-400 blur-3xl"
        />
      </div>

      {/* Main Container */}
      <div className="container relative mx-auto h-screen max-w-5xl px-4">
        {/* Content Wrapper */}
        <div className="flex h-full flex-col items-center gap-12 py-32 md:mx-24 md:flex-row md:py-8">
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
              <span className="rounded-full bg-gradient-to-r from-sky-400 to-emerald-400 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-sky-400/20">
                Learning Made Magical ✨
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-8 text-4xl font-bold sm:text-5xl lg:text-7xl"
            >
              <span className="bg-gradient-to-r from-sky-400 via-emerald-400 to-amber-400 bg-clip-text text-transparent">
                Spoon
              </span>
              <br />
              <span className="bg-gradient-to-r from-amber-400 via-purple-400 to-sky-400 bg-clip-text text-transparent">
                Academy
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mx-auto mt-6 max-w-xl text-base text-gray-600 dark:text-gray-300 sm:text-lg lg:mx-0 lg:text-xl"
            >
              Where every child's potential unfolds through playful learning and
              creative discovery. Join us on a journey of wonder and growth!
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-8 flex flex-col justify-center gap-4 sm:flex-row lg:justify-start"
            >
              <Link href="/sign-up">
                <Button className="rounded-full border-2 bg-gradient-to-r from-sky-400 to-emerald-400 px-8 py-6 text-lg text-white shadow-lg shadow-sky-400/20 transition-all duration-300 hover:scale-105 hover:from-sky-500 hover:to-emerald-500">
                  Begin the Adventure
                </Button>
              </Link>
              <Button
                variant="outline"
                className="rounded-full border-2 border-purple-400 px-8 py-6 text-lg text-purple-400 transition-all duration-300 hover:scale-105 hover:bg-purple-50"
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
            className="relative aspect-square h-1/2 w-full"
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
              className="absolute left-[20%] top-[20%] aspect-square w-[30%] rounded-2xl bg-gradient-to-r from-sky-400 to-emerald-400 shadow-xl backdrop-blur-sm"
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
              className="absolute bottom-[20%] right-[60%] aspect-square w-[30%] rounded-full bg-gradient-to-r from-amber-400 to-purple-400 shadow-xl backdrop-blur-sm"
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
              className="absolute left-1/2 top-1/2 aspect-square w-[40%] -translate-x-1/2 -translate-y-1/2 transform rounded-3xl bg-gradient-to-r from-purple-400 to-sky-400 shadow-xl backdrop-blur-sm"
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
              className="absolute right-[40%] top-[40%] aspect-square w-[15%] rounded-lg bg-gradient-to-r from-emerald-400 to-amber-400 shadow-lg"
            />
          </motion.div>
        </div>
      </div>

      {/* Glass effect overlay */}
      <div className="pointer-events-none absolute inset-0 bg-white/10" />
    </main>
  );
}
