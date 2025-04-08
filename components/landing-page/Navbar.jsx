// components/Navbar.tsx
"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed top-0 z-50 w-full px-4 py-4"
    >
      <div className="container mx-auto">
        <div className="relative">
          {/* Blur background */}
          <div className="absolute inset-0 rounded-full bg-white/10 backdrop-blur-[1px]" />

          {/* Gradient border */}
          <div className="absolute inset-0 rounded-full bg-white/20 p-[1px]" />

          {/* Content */}
          <div className="relative flex items-center justify-between px-6 py-3">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-xl font-bold text-transparent"
            >
              Spoon Academy
            </motion.div>

            {/* Navigation Links */}
            <div className="hidden items-center space-x-8 md:flex">
              {["Home", "Features", "Success", "About"].map((item) => (
                <motion.a
                  key={item}
                  href="#"
                  className={`rounded-md px-4 py-2 text-gray-700 transition-all dark:text-gray-200 ${
                    item === "Home"
                      ? "bg-sky-400/50 hover:bg-sky-500"
                      : item === "Features"
                        ? "bg-emerald-400/50 hover:bg-emerald-500"
                        : item === "Success"
                          ? "bg-amber-400/50 hover:bg-amber-500"
                          : "bg-purple-400/50 hover:bg-purple-500"
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {item}
                </motion.a>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center space-x-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="ghost"
                  className="text-gray-700 dark:text-gray-200"
                >
                  Login
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button className="rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700">
                  Get Started
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
