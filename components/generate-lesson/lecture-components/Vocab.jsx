"use client";
import SpeakingModule from "@/components/lessons/SpeakingModule";
import { Brain } from "lucide-react";
import { Lightbulb } from "lucide-react";
import { Star, BookOpen, Bookmark, Volume2 } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";

// Particle component for the hover effect
const Particles = ({ active }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!active || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const particles = [];
    const particleCount = 20;

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

export const Vocab = ({ title = {}, items = [], context = {} }) => {
  const [hoveredItem, setHoveredItem] = useState(null);

  return (
    <section className="mx-auto max-w-4xl rounded-xl bg-white p-8">
      <header className="mb-10 text-center">
        <div className="mb-3 flex items-center justify-center gap-2">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-blue-500/70"></div>
          <Bookmark className="h-5 w-5 text-blue-600" />
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-blue-500/70"></div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          {title?.french || "Vocabulary"}
        </h1>
        <h2 className="mt-2 text-lg font-medium text-gray-600">
          {title?.english || "Words and Phrases"}
        </h2>
      </header>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        {items.map((item, index) => (
          <div
            key={index}
            className="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50/50 shadow-sm transition-all duration-300 hover:border-blue-300 hover:bg-blue-50/70 hover:shadow-md"
            onMouseEnter={() => setHoveredItem(index)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            {/* Content */}
            <div className="relative z-10 flex justify-between p-5">
              <div className="flex flex-col">
                <span
                  className={`text-lg font-semibold transition-all duration-300 ${
                    hoveredItem === index
                      ? "scale-105 transform text-blue-600"
                      : "text-gray-800"
                  }`}
                >
                  {item?.french || ""}
                </span>
                <span className="text-sm font-medium italic text-gray-600">
                  {item?.english || ""}
                </span>
              </div>

              {item?.french && (
                <>
                  <span className="sr-only">Listen</span>
                  <SpeakingModule
                    text={item.french}
                    speaker="Marie"
                    language="fr-FR"
                  />
                </>
              )}
            </div>

            {(item?.example?.french || item?.example?.english) && (
              <div
                className={`relative z-10 border-t border-gray-200 p-5 pt-2 transition-colors duration-300 ${
                  hoveredItem === index ? "bg-white/90" : "bg-white/80"
                }`}
              >
                <span
                  className={`text-sm font-medium transition-colors duration-300 ${
                    hoveredItem === index ? "text-blue-700" : "text-gray-700"
                  }`}
                >
                  {item?.example?.french || ""}
                </span>
                <span className="mt-1 block text-xs italic text-gray-500">
                  {item?.example?.english || ""}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {context && (
        <div className="relative px-6">
          <div className="group flex w-full flex-col rounded-full bg-gradient-to-tr from-transparent via-slate-50/10 to-amber-300/10 pl-6 hover:bg-gray-50/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {" "}
                <h3 className="flex gap-4 text-xl">Important</h3>
                <div>
                  <Lightbulb className="mt-4 size-10 text-white opacity-0 transition-all duration-300 group-hover:fill-amber-300 group-hover:text-amber-300/50 group-hover:opacity-100" />
                </div>
              </div>
              <div>
                {context?.french && (
                  <div
                    className="mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-amber-500 text-white shadow-sm transition-all duration-200 hover:scale-110 hover:bg-amber-600"
                    aria-label="Listen to context"
                  >
                    <Volume2 className="h-4 w-4" />
                    <span className="sr-only">Listen to context</span>
                    <div className="absolute opacity-0">
                      <SpeakingModule
                        text={context.french + " " + context.english}
                        speaker="Marie"
                        language="fr-FR"
                        buttonSize={`icon`}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col items-start">
              <div>
                {" "}
                <p className="pr-4 text-base font-medium leading-relaxed text-gray-800 transition-colors duration-300 hover:text-amber-700">
                  {context?.french || ""}
                </p>
              </div>
            </div>
            <p className="mt-1 text-sm italic text-gray-600">
              {context?.english || ""}
            </p>
          </div>
        </div>
      )}
    </section>
  );
};
