// components/FeaturesSection.tsx
"use client";

import { motion } from "framer-motion";
import { Bot, BookOpen, Sparkles } from "lucide-react"; // Make sure to install lucide-react

const features = [
  {
    icon: <Bot className="h-8 w-8" />,
    title: "Conversational AI",
    description:
      "Engage with our intelligent AI tutors that adapt to each student's learning style and pace, providing personalized conversations and guidance.",
    gradient: "from-sky-400 to-emerald-400",
  },
  {
    icon: <BookOpen className="h-8 w-8" />,
    title: "AI Generated Lessons",
    description:
      "Dynamic lesson plans created in real-time, perfectly tailored to your child's interests and learning objectives.",
    gradient: "from-amber-400 to-purple-400",
  },
  {
    icon: <Sparkles className="h-8 w-8" />,
    title: "Interactive Learning",
    description:
      "Immersive educational experiences that combine games, quizzes, and interactive exercises to make learning fun and effective.",
    gradient: "from-purple-400 to-sky-400",
  },
];

export default function FeaturesSection() {
  return (
    <section className="relative min-h-screen overflow-hidden py-24 md:h-screen md:py-0">
      {/* Background Elements */}
      <div className="absolute inset-0 h-full w-full">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
          className="absolute right-[10%] top-[10%] h-72 w-72 rounded-full bg-gradient-to-r from-emerald-400 to-sky-400 blur-3xl"
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
          className="absolute bottom-[10%] left-[10%] h-72 w-72 rounded-full bg-gradient-to-r from-purple-400 to-amber-400 blur-3xl"
        />
      </div>

      {/* Content Container */}
      <div className="container relative mx-auto h-full max-w-5xl px-4">
        <div className="flex h-full flex-col justify-center">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-16 text-center"
          >
            <span className="mb-4 inline-block rounded-full bg-gradient-to-r from-sky-400 to-emerald-400 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-sky-400/20">
              Our Magic Features ✨
            </span>
            <h2 className="bg-gradient-to-r from-purple-400 via-amber-400 to-sky-400 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
              Learning Reimagined
            </h2>
          </motion.div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 gap-8 px-4 md:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                whileHover={{ scale: 1.05 }}
                className="group relative cursor-default"
              >
                <div className="relative z-10 min-h-80 rounded-2xl border border-white/20 bg-white/10 p-8 shadow-xl backdrop-blur-lg transition-all duration-300 hover:shadow-2xl">
                  {/* Feature Icon */}
                  <div
                    className={`h-16 w-16 rounded-xl bg-gradient-to-r ${feature.gradient} mb-6 p-4 text-white shadow-lg`}
                  >
                    {feature.icon}
                  </div>

                  {/* Feature Content */}
                  <h3 className="mb-4 bg-gradient-to-r from-sky-400 to-emerald-400 bg-clip-text text-lg font-bold text-transparent md:text-xl">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </p>

                  {/* Hover Effect */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    className="absolute inset-0 z-10 rounded-2xl bg-gradient-to-r from-sky-400/20 to-emerald-400/20 blur-xl transition-opacity"
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-16 text-center"
          >
            <span className="inline-block rounded-full bg-white/50 px-6 py-3 text-lg text-gray-600 backdrop-blur-sm dark:text-gray-300">
              Experience the future of education with Spoon Academy 🚀
            </span>
          </motion.div>
        </div>
      </div>

      {/* Glass effect overlay */}
      <div className="pointer-events-none absolute inset-0 bg-white/10" />
    </section>
  );
}
