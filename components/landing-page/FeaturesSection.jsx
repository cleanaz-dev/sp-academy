"use client";

import { motion } from "framer-motion";
import { Bot, BookOpen, Award, Globe } from "lucide-react";
import Image from "next/image";

const features = [
  {
    icon: <Bot className="h-8 w-8" />,
    title: "Conversational AI",
    description:
      "Practice real conversations with an intelligent AI tutor that helps you learn new languages naturally. Get instant pronunciation feedback, adaptive dialogue, and confidence in English or French.",
    gradient: "from-sky-400 to-emerald-400",
    imageSrc: "/feature-02.png",
  },
  {
    icon: <BookOpen className="h-8 w-8" />,
    title: "AI-Generated Lessons",
    description:
      "Smart, evolving lessons built just for you — every quiz, challenge, and game crafted in real time around your goals and learning style.",
    gradient: "from-amber-400 to-purple-400",
    imageSrc: "/feature-03.png",
  },
  {
    icon: <Award className="h-8 w-8" />,
    title: "Certificates & Achievements",
    description:
      "Earn verified certificates for your progress. Track milestones, unlock trophies, and showcase your achievements with pride.",
    gradient: "from-purple-400 to-sky-400",
    imageSrc: "/feature-04.png",
  },
  {
    icon: <Globe className="h-8 w-8" />,
    title: "Learn Anywhere",
    description:
      "Stay connected wherever you go — continue lessons seamlessly on mobile, tablet, or desktop with real-time progress syncing.",
    gradient: "from-emerald-400 to-sky-400",
    imageSrc: "/feature-01.png",
  },
];

export default function FeaturesSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-sky-50/50 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-32">
      {/* floating gradients */}
      <motion.div
        animate={{
          background: [
            "radial-gradient(circle at 20% 30%, rgba(56,189,248,0.2), transparent 70%)",
            "radial-gradient(circle at 80% 70%, rgba(192,132,252,0.2), transparent 70%)",
            "radial-gradient(circle at 30% 80%, rgba(16,185,129,0.2), transparent 70%)",
          ],
        }}
        transition={{ duration: 10, repeat: Infinity, repeatType: "mirror" }}
        className="absolute inset-0 z-0"
      />

      <div className="container relative z-10 mx-auto max-w-6xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <span className="inline-block rounded-full bg-gradient-to-r from-sky-400 to-emerald-400 px-6 py-2 text-lg font-semibold text-white shadow-md">
            Explore What Makes Us Different
          </span>
          <h2 className="mt-6 bg-gradient-to-r from-purple-400 via-amber-400 to-sky-400 bg-clip-text text-transparent text-5xl font-bold">
            Learning That Adapts To You
          </h2>
        </motion.div>

        <div className="space-y-32">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: i * 0.15 }}
              className={`relative flex flex-col md:flex-row items-center gap-10 ${
                i % 2 === 1 ? "md:flex-row-reverse" : ""
              }`}
            >
              {/* image */}
              <div className="relative flex-1">
                <motion.div
                  animate={{
                    rotate: [0, 2, -2, 0],
                  }}
                  transition={{ duration: 6, repeat: Infinity }}
                  className="rounded-3xl overflow-hidden "
                >
                  <Image
                    src={feature.imageSrc}
                    alt={feature.title}
                    width={550}
                    height={400}
                    className="rounded-3xl object-cover"
                  />
                </motion.div>

                <div
                  className={`absolute -inset-4 rounded-3xl bg-gradient-to-r ${feature.gradient} opacity-20 blur-3xl`}
                />
              </div>

              {/* text */}
              <div className="flex-1 relative z-10">
                <div
                  className={`inline-flex items-center justify-center rounded-xl bg-gradient-to-r ${feature.gradient} p-3 text-white shadow-lg mb-6`}
                >
                  {feature.icon}
                </div>
                <h3
                  className={`text-2xl md:text-3xl font-semibold mb-4 bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent`}
                >
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-32 text-center"
        >
          <span className="inline-block rounded-full bg-gradient-to-r from-sky-400 to-emerald-400 px-8 py-4 text-white text-lg font-semibold shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer">
            Start Learning With Spoon Academy 🚀
          </span>
        </motion.div>
      </div>
    </section>
  );
}
