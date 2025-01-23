// components/StatsSection.tsx
"use client";

import { motion } from "framer-motion";
import { Users, Star, Trophy, Heart } from "lucide-react"; // Using Lucide icons

const stats = [
  {
    icon: <Users className="w-6 h-6" />,
    value: "10,000+",
    label: "Happy Students",
    gradient: "from-sky-400 to-emerald-400",
  },
  {
    icon: <Star className="w-6 h-6" />,
    value: "4.9/5",
    label: "Parent Rating",
    gradient: "from-amber-400 to-purple-400",
  },
  {
    icon: <Trophy className="w-6 h-6" />,
    value: "95%",
    label: "Success Rate",
    gradient: "from-purple-400 to-sky-400",
  },
  {
    icon: <Heart className="w-6 h-6" />,
    value: "50+",
    label: "Subjects Covered",
    gradient: "from-emerald-400 to-amber-400",
  },
];

const testimonials = [
  {
    content: "My daughter's confidence in math has skyrocketed since joining Spoon Academy!",
    author: "Sarah M.",
    role: "Parent of 9-year-old",
    avatar: "😊",
  },
  {
    content: "The AI tutoring is like having a personal teacher available 24/7. Amazing!",
    author: "Michael R.",
    role: "Parent of 12-year-old",
    avatar: "🌟",
  },
  {
    content: "The interactive lessons make learning fun. My son actually looks forward to studying!",
    author: "Lisa K.",
    role: "Parent of 8-year-old",
    avatar: "💫",
  },
];

export default function StatsSection() {
  return (
    <section className="min-h-screen md:h-screen relative overflow-hidden py-24 md:py-0">
      {/* Background Elements */}
      <div className="absolute inset-0 w-full h-full">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
          className="absolute top-[20%] left-[20%] w-72 h-72 bg-gradient-to-r from-sky-400 to-emerald-400 rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 3, repeat: Infinity, repeatType: "reverse", delay: 1 }}
          className="absolute bottom-[20%] right-[20%] w-72 h-72 bg-gradient-to-r from-amber-400 to-purple-400 rounded-full blur-3xl"
        />
      </div>

      {/* Content Container */}
      <div className="relative container mx-auto max-w-5xl h-full px-4">
        <div className="h-full flex flex-col justify-center gap-16">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="text-center"
              >
                <div className={`w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-r ${stat.gradient} p-3 text-white shadow-lg`}>
                  {stat.icon}
                </div>
                <motion.h3
                  className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-emerald-400"
                  initial={{ scale: 0.5 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  {stat.value}
                </motion.h3>
                <p className="text-gray-600 dark:text-gray-300 mt-2">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Testimonials */}
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <span className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-400 to-sky-400 text-white text-sm font-medium shadow-lg shadow-purple-400/20 inline-block">
                Success Stories 🌈
              </span>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  whileHover={{ scale: 1.05 }}
                  className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20"
                >
                  <div className="text-4xl mb-4">{testimonial.avatar}</div>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    "{testimonial.content}"
                  </p>
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <p className="font-semibold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-emerald-400">
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
            <button className="px-8 py-3 rounded-full bg-gradient-to-r from-sky-400 to-emerald-400 text-white font-medium shadow-lg shadow-sky-400/20 hover:scale-105 transition-transform duration-300">
              Join Our Success Story
            </button>
          </motion.div>
        </div>
      </div>

      {/* Animated particles */}
      {[...Array(15)].map((_, i) => (
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
      <div className="absolute inset-0 bg-white/10 backdrop-blur-[0px] pointer-events-none" />
    </section>
  );
}