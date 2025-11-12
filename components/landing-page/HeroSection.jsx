"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import HeroImage from "@/public/hero-image-01.png";

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
      <div className="container relative mx-auto h-screen max-w-7xl px-4">
        {/* Content Wrapper */}
        <div className="flex h-full flex-col items-center gap-12 py-20 md:flex-row md:gap-16 md:py-8">
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

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-8 text-4xl font-bold sm:text-5xl lg:text-7xl"
            >
              <h1 className="mt-8 text-4xl font-bold tracking-wide sm:text-5xl lg:text-7xl">
                <span className="text-white">
                  <span
                    style={{
                      textShadow: `
        0 0 10px rgba(56, 189, 248, 1),
        0 0 20px rgba(56, 189, 248, 0.8),
        0 0 30px rgba(56, 189, 248, 0.6)
      `,
                    }}
                  >
                    S
                  </span>
                  <span
                    style={{
                      textShadow: `
        0 0 10px rgba(16, 185, 129, 1),
        0 0 20px rgba(16, 185, 129, 0.8),
        0 0 30px rgba(16, 185, 129, 0.6)
      `,
                    }}
                  >
                    p
                  </span>
                  <span
                    style={{
                      textShadow: `
        0 0 10px rgba(251, 191, 36, 1),
        0 0 20px rgba(251, 191, 36, 0.8),
        0 0 30px rgba(251, 191, 36, 0.6)
      `,
                    }}
                  >
                    o
                  </span>
                  <span
                    style={{
                      textShadow: `
        0 0 10px rgba(251, 191, 36, 1),
        0 0 20px rgba(251, 191, 36, 0.8),
        0 0 30px rgba(251, 191, 36, 0.6)
      `,
                    }}
                  >
                    o
                  </span>
                  <span
                    style={{
                      textShadow: `
        0 0 10px rgba(192, 132, 252, 1),
        0 0 20px rgba(192, 132, 252, 0.8),
        0 0 30px rgba(192, 132, 252, 0.6)
      `,
                    }}
                  >
                    n
                  </span>
                </span>
                <br />

                <span>Academy</span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mx-auto mt-6 max-w-xl text-base text-gray-600 dark:text-gray-300 sm:text-lg lg:mx-0 lg:text-xl"
            >
              Where every student's potential unfolds through playful learning
              and creative discovery. Join us on a journey of wonder and growth!
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

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="rounded-full"
          >
            <motion.div
              animate={{
                borderColor: [
                  "rgba(56, 189, 248, 1)", // sky
                  "rgba(16, 185, 129, 1)", // emerald
                  "rgba(251, 191, 36, 1)", // amber
                  "rgba(192, 132, 252, 1)", // purple
                  "rgba(56, 189, 248, 1)", // back to sky
                ],
                boxShadow: [
                  "0 0 40px rgba(56, 189, 248, 0.6)",
                  "0 0 40px rgba(16, 185, 129, 0.6)",
                  "0 0 40px rgba(251, 191, 36, 0.6)",
                  "0 0 40px rgba(192, 132, 252, 0.6)",
                  "0 0 40px rgba(56, 189, 248, 0.6)",
                ],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear",
              }}
              className="rounded-full"
            >
              <Image
                src={HeroImage}
                className="rounded-full"
                height={600}
                width={600}
                priority
                alt="hero image"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Glass effect overlay */}
      <div className="pointer-events-none absolute inset-0 bg-white/10" />
    </main>
  );
}
