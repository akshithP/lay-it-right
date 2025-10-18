"use client";

import React from "react";
import { motion } from "framer-motion";

interface HeroSectionProps {
  className?: string;
}

export function HeroSection({ className = "" }: HeroSectionProps) {
  return (
    <motion.div
      className={`hero-container ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h2
        className="text-5xl sm:text-6xl md:text-5xl font-bold mb-4 text-layit-blue"
        style={{ textShadow: "4px 4px 0px var(--layit-orange)" }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        LAY-IT-RIGHT
      </motion.h2>

      <motion.p
        className="text-lg sm:text-xl font-bold uppercase tracking-wide text-layit-blue"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        PLAN, CALCULATE & VISUALIZE YOUR TILING PROJECT LIKE A PRO
      </motion.p>
    </motion.div>
  );
}
