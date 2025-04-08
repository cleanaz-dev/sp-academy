"use client";
import { BookOpen, Bookmark } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import SpeakingModule from "@/components/lessons/SpeakingModule";

// Particle component for the hover effect (same as in Vocab component)
const Particles = ({ active }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!active || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const particles = [];
    const particleCount = 15;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: Math.random() * 1 - 0.5,
        speedY: Math.random() * 1 - 0.5,
        opacity: Math.random() * 0.5 + 0.2,
      });
    }

    let animationFrame;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        if (particle.x < 0 || particle.x > canvas.width) {
          particle.speedX = -particle.speedX;
        }

        if (particle.y < 0 || particle.y > canvas.height) {
          particle.speedY = -particle.speedY;
        }

        ctx.fillStyle = `rgba(66, 153, 225, ${particle.opacity})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
};

export const Table = ({ title = {}, tense = "", conjugations = [] }) => {
  const [hoveredRow, setHoveredRow] = useState(null);

  return (
    <section className="mx-auto max-w-4xl rounded-xl bg-white p-8 shadow-sm">
      <header className="mb-10 text-center">
        <div className="mb-3 flex items-center justify-center gap-2">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-blue-500/70"></div>
          <Bookmark className="h-5 w-5 text-blue-600" />
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-blue-500/70"></div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          {title?.french || "Conjugation Table"}
        </h1>
        <h2 className="mt-2 text-lg font-medium text-gray-600">
          {title?.english || "Verb Forms"}
        </h2>
      </header>

      {tense && (
        <div className="mb-6 flex items-center justify-center">
          <div className="inline-flex items-center rounded-full bg-blue-100 px-4 py-2 font-medium text-blue-800">
            <BookOpen className="mr-2 h-4 w-4" />
            {tense}
          </div>
        </div>
      )}

      <div className="mb-8 overflow-hidden rounded-xl border border-gray-200 shadow-sm">
        {/* Table Header */}
        <div className="grid grid-cols-2 border-b border-gray-200 bg-gray-50 px-6 py-4">
          <div className="text-sm font-medium text-gray-600">Usage</div>
          <div className="text-sm font-medium text-gray-600">Expression</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-200">
          {conjugations.map((conj, index) => (
            <div
              key={index}
              className="relative grid grid-cols-2 px-6 py-4 transition-all duration-300 hover:bg-blue-50/70"
              onMouseEnter={() => setHoveredRow(index)}
              onMouseLeave={() => setHoveredRow(null)}
            >
              {/* Particles effect */}
              {/* <Particles active={hoveredRow === index} /> */}

              {/* Pronoun/Usage column */}
              <div className="relative z-10 pr-4">
                <span className="text-sm font-medium text-gray-700">
                  {conj.pronoun}
                </span>
              </div>

              {/* Conjugation column */}
              <div className="relative z-10 flex items-center justify-between">
                <span
                  className={`font-medium transition-all duration-300 ${
                    hoveredRow === index
                      ? "scale-105 transform text-blue-600"
                      : "text-gray-800"
                  }`}
                >
                  {conj.conjugation}
                </span>

                {conj.conjugation && (
                  <div
                    className={`transition-transform duration-300 ${
                      hoveredRow === index ? "scale-110 transform" : ""
                    }`}
                  >
                    <SpeakingModule
                      text={conj.conjugation}
                      speaker="Marie"
                      language="fr-FR"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center text-sm italic text-gray-500">
        Practice these expressions to ask about someone's wellbeing in different
        contexts.
      </div>
    </section>
  );
};
