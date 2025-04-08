// components/StatsSection.tsx
"use client";

import { motion } from "framer-motion";
import { Users, Star, Trophy, Heart } from "lucide-react"; // Using Lucide icons

const stats = [
  {
    icon: <Users className="h-6 w-6" />,
    value: "10,000+",
    label: "Happy Students",
    gradient: "from-sky-400 to-emerald-400",
  },
  {
    icon: <Star className="h-6 w-6" />,
    value: "4.9/5",
    label: "Parent Rating",
    gradient: "from-amber-400 to-purple-400",
  },
  {
    icon: <Trophy className="h-6 w-6" />,
    value: "95%",
    label: "Success Rate",
    gradient: "from-purple-400 to-sky-400",
  },
  {
    icon: <Heart className="h-6 w-6" />,
    value: "50+",
    label: "Subjects Covered",
    gradient: "from-emerald-400 to-amber-400",
  },
];

const testimonials = [
  {
    content:
      "My daughter's confidence in math has skyrocketed since joining Spoon Academy!",
    author: "Sarah M.",
    role: "Parent of 9-year-old",
    avatar: "😊",
  },
  {
    content:
      "The AI tutoring is like having a personal teacher available 24/7. Amazing!",
    author: "Michael R.",
    role: "Parent of 12-year-old",
    avatar: "🌟",
  },
  {
    content:
      "The interactive lessons make learning fun. My son actually looks forward to studying!",
    author: "Lisa K.",
    role: "Parent of 8-year-old",
    avatar: "💫",
  },
];

export default function StatsSection() {
  return (
    <section className="relative min-h-screen overflow-hidden py-24 md:h-screen md:py-0">
      {/* Background Elements */}
      <div className="absolute inset-0 h-full w-full">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
          className="absolute left-[20%] top-[20%] h-72 w-72 rounded-full bg-gradient-to-r from-sky-400 to-emerald-400 blur-3xl"
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
          className="absolute bottom-[20%] right-[20%] h-72 w-72 rounded-full bg-gradient-to-r from-amber-400 to-purple-400 blur-3xl"
        />
      </div>

      {/* Content Container */}
      <div className="container relative mx-auto h-full max-w-5xl px-4">
        <div className="flex h-full flex-col justify-center gap-16">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="text-center"
              >
                <div
                  className={`mx-auto mb-4 h-12 w-12 rounded-xl bg-gradient-to-r ${stat.gradient} p-3 text-white shadow-lg`}
                >
                  {stat.icon}
                </div>
                <motion.h3
                  className="bg-gradient-to-r from-sky-400 to-emerald-400 bg-clip-text text-3xl font-bold text-transparent md:text-4xl"
                  initial={{ scale: 0.5 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  {stat.value}
                </motion.h3>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Testimonials */}
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-12 text-center"
            >
              <span className="inline-block rounded-full bg-gradient-to-r from-purple-400 to-sky-400 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-purple-400/20">
                Success Stories 🌈
              </span>
            </motion.div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  whileHover={{ scale: 1.05 }}
                  className="rounded-2xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-lg"
                >
                  <div className="mb-4 text-4xl">{testimonial.avatar}</div>
                  <p className="mb-4 text-gray-600 dark:text-gray-300">
                    "{testimonial.content}"
                  </p>
                  <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
                    <p className="bg-gradient-to-r from-sky-400 to-emerald-400 bg-clip-text font-semibold text-transparent">
                      {testimonial.author}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {testimonial.role}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <button className="rounded-full bg-gradient-to-r from-sky-400 to-emerald-400 px-8 py-3 font-medium text-white shadow-lg shadow-sky-400/20 transition-transform duration-300 hover:scale-105">
              Join Our Success Story
            </button>
          </motion.div>
        </div>
      </div>

      {/* Glass effect overlay */}
      <div className="pointer-events-none absolute inset-0 bg-white/10 backdrop-blur-[0px]" />
    </section>
  );
}
