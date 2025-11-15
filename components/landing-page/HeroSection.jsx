"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { heroConfig, generateTextShadow, generateGlowSequence } from "./landing-page-config"

export default function HeroSection() {
  return (
    <main className={`relative min-h-screen overflow-hidden bg-gradient-to-br ${heroConfig.background.gradient}`}>
      {/* Animated background elements */}
      <div className="absolute inset-0 h-full w-full">
        {heroConfig.background.blobs.map((blob, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{
              duration: blob.duration,
              repeat: Infinity,
              repeatType: "reverse",
              delay: blob.delay,
            }}
            className={`absolute ${blob.position} h-72 w-72 rounded-full bg-gradient-to-r ${blob.gradient} blur-3xl`}
          />
        ))}
      </div>

      {/* Main Container */}
      <div className="container relative mx-auto h-screen max-w-7xl px-4">
        {/* Content Wrapper */}
        <div className="flex h-full flex-col items-center gap-12 py-10 md:py-20 md:flex-row md:gap-16">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            className="flex-1 text-center md:text-left relative z-20"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center md:justify-start"
            >
              <span className={`rounded-full bg-gradient-to-r ${heroConfig.badge.gradient} px-4 md:px-8 py-2 text-sm md:text-2xl font-medium text-white shadow-lg shadow-sky-400/20`}>
                {heroConfig.badge.text}
              </span>
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h1 className="mt-8 text-5xl md:text-7xl font-bold tracking-wide">
                <span className="text-white">
                  {heroConfig.title.letters.map((letter, index) => (
                    <span
                      key={index}
                      style={{
                        textShadow: generateTextShadow(letter.color),
                      }}
                    >
                      {letter.char}
                    </span>
                  ))}
                </span>
                <br />
                <span>{heroConfig.title.plainText}</span>
              </h1>
            </motion.div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mx-auto mt-6 max-w-xl text-base text-gray-600 dark:text-gray-300 sm:text-lg md:mx-0 lg:text-xl"
            >
              {heroConfig.description}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-6 md:mt-8 flex flex-col justify-center gap-4 sm:flex-row md:justify-start"
            >
              <Link href={heroConfig.buttons.primary.href}>
                <Button 
                  className={`rounded-full border-2 bg-gradient-to-r ${heroConfig.buttons.primary.gradient} px-8 py-6 text-lg text-white md:shadow-lg shadow-sky-400/20 transition-all duration-300 hover:scale-105 hover:${heroConfig.buttons.primary.hoverGradient}`}
                >
                  {heroConfig.buttons.primary.text}
                </Button>
              </Link>
              <Button
                variant={heroConfig.buttons.secondary.variant}
                className={`hidden md:flex rounded-full border-2 ${heroConfig.buttons.secondary.borderColor} px-8 py-6 text-lg ${heroConfig.buttons.secondary.textColor} transition-all duration-300 hover:scale-105 ${heroConfig.buttons.secondary.hoverBg}`}
              >
                {heroConfig.buttons.secondary.text}
              </Button>
            </motion.div>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="rounded-full relative z-10"
          >
            <motion.div
              animate={{
                borderColor: heroConfig.animations.glowColors,
                boxShadow: generateGlowSequence(heroConfig.animations.glowColors),
              }}
              transition={{
                duration: heroConfig.animations.glowDuration,
                repeat: Infinity,
                ease: "linear",
              }}
              className="rounded-full"
            >
              <Image
                src={heroConfig.image.src}
                className="rounded-full -mt-20 md:mt-0 opacity-80 md:opacity-100"
                height={heroConfig.image.height}
                width={heroConfig.image.width}
                priority
                alt={heroConfig.image.alt}
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