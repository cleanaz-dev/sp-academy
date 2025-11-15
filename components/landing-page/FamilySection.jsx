"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function FamilySection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-emerald-50/30 to-sky-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-28">
      {/* background accents */}
      <motion.div
        animate={{
          opacity: [0.3, 0.5, 0.3],
          scale: [1, 1.05, 1],
        }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(56,189,248,0.2),transparent_70%)]"
      />
      <motion.div
        animate={{
          opacity: [0.2, 0.4, 0.2],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(16,185,129,0.2),transparent_70%)]"
      />

      <div className="container relative z-10 mx-auto flex flex-col-reverse items-center gap-16 px-6 md:flex-row md:gap-20">
        {/* Left content */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex-1 text-center md:text-left"
        >
          <div className="flex justify-center md:justify-start">
            <span className="inline-block rounded-full bg-gradient-to-r from-sky-400 to-emerald-400 px-5 py-2 text-sm font-semibold text-white shadow-md">
              Learning Together, Growing Together 🌱
            </span>
          </div>

          <h2 className="mt-6 text-4xl font-bold leading-tight text-gray-900 dark:text-white md:text-5xl">
            Empowering Families Through <br />
            <span className="bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-transparent">
              Connected Learning
            </span>
          </h2>

          <p className="mt-6 text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto md:mx-0">
            At Spoon Academy, we believe education works best when families learn together.
            From interactive stories to AI-guided challenges, parents can explore, assist, 
            and celebrate their child's learning journey — all in one seamless experience.
          </p>

          <ul className="mt-8 space-y-3 text-gray-600 dark:text-gray-300 inline-block text-left">
            <li>👨‍👩‍👧 Strengthen family bonds through shared activities</li>
            <li>🎯 Track growth and celebrate every milestone</li>
            <li>💬 Communicate with AI tutors to stay involved</li>
            <li>🌍 Learn languages, life skills, and creativity together</li>
          </ul>

          <div className="flex justify-center md:justify-start">
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="mt-10 rounded-full bg-gradient-to-r from-sky-400 to-emerald-400 px-8 py-4 text-lg font-semibold text-white shadow-lg hover:from-sky-500 hover:to-emerald-500 transition-all"
            >
              Join the Spoon Family 💖
            </motion.button>
          </div>
        </motion.div>

        {/* Right Image */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="relative flex-1"
        >
          <motion.div
            animate={{
              rotate: [0, 1.5, -1.5, 0],
            }}
            transition={{ duration: 6, repeat: Infinity }}
            className="relative rounded-3xl overflow-hidden "
          >
            <Image
              src="/family-01.png"
              alt="Family learning together"
              width={600}
              height={600}
              className="rounded-3xl object-cover"
            />
          </motion.div>

          <div className="absolute -inset-6 rounded-3xl bg-gradient-to-r from-sky-400/30 to-emerald-400/30 blur-3xl" />
        </motion.div>
      </div>
    </section>
  );
}