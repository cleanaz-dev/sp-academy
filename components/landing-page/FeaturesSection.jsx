// components/FeaturesSection.tsx
"use client";

import { motion } from "framer-motion";
import { Bot, BookOpen, Sparkles } from "lucide-react"; // Make sure to install lucide-react

const features = [
  {
    icon: <Bot className="w-8 h-8" />,
    title: "Conversational AI",
    description:
      "Engage with our intelligent AI tutors that adapt to each student's learning style and pace, providing personalized conversations and guidance.",
    gradient: "from-sky-400 to-emerald-400",
  },
  {
    icon: <BookOpen className="w-8 h-8" />,
    title: "AI Generated Lessons",
    description:
      "Dynamic lesson plans created in real-time, perfectly tailored to your child's interests and learning objectives.",
    gradient: "from-amber-400 to-purple-400",
  },
  {
    icon: <Sparkles className="w-8 h-8" />,
    title: "Interactive Learning",
    description:
      "Immersive educational experiences that combine games, quizzes, and interactive exercises to make learning fun and effective.",
    gradient: "from-purple-400 to-sky-400",
  },
];

export default function FeaturesSection() {
  return (
    <section className="min-h-screen md:h-screen relative overflow-hidden py-24 md:py-0">
      {/* Background Elements */}
      <div className="absolute inset-0 w-full h-full">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
          className="absolute top-[10%] right-[10%] w-72 h-72 bg-gradient-to-r from-emerald-400 to-sky-400 rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 3, repeat: Infinity, repeatType: "reverse", delay: 1 }}
          className="absolute bottom-[10%] left-[10%] w-72 h-72 bg-gradient-to-r from-purple-400 to-amber-400 rounded-full blur-3xl"
        />
      </div>

      {/* Content Container */}
      <div className="relative container mx-auto max-w-5xl h-full px-4">
        <div className="h-full flex flex-col justify-center">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <span className="px-4 py-2 rounded-full bg-gradient-to-r from-sky-400 to-emerald-400 text-white text-sm font-medium shadow-lg shadow-sky-400/20 inline-block mb-4">
              Our Magic Features ✨
            </span>
            <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-amber-400 to-sky-400">
              Learning Reimagined
            </h2>
          </motion.div>

          {/* Features Grid */}absolute inset-0 -z-10
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                whileHover={{ scale: 1.05 }}
                className="relative group cursor-default"
              >
                <div className="relative z-10 bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
                  {/* Feature Icon */}
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${feature.gradient} p-4 mb-6 text-white shadow-lg`}>
                    {feature.icon}
                  </div>

                  {/* Feature Content */}
                  <h3 className="text-lg md:text-xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-emerald-400">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </p>

                  {/* Hover Effect */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    className="absolute inset-0 z-10 bg-gradient-to-r from-sky-400/20 to-emerald-400/20 rounded-2xl blur-xl transition-opacity"
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
            className="text-center mt-16"
          >
            <span className="inline-block text-lg text-gray-600 dark:text-gray-300 bg-white/50 backdrop-blur-sm px-6 py-3 rounded-full">
              Experience the future of education with Spoon Academy 🚀
            </span>
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
      <div className="absolute inset-0 bg-white/10  pointer-events-none" />
    </section>
  );
}