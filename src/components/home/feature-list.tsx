"use client";

import React from "react";
import { motion } from "framer-motion";

interface Feature {
  title: string;
  description: string;
  icon: string;
}

interface FeatureListProps {
  className?: string;
}

const features: Feature[] = [
  {
    title: "ROOM DIMENSIONS",
    description: "Precise area calculations",
    icon: "✓",
  },
  {
    title: "TILE CALCULATIONS",
    description: "Exact quantity needed",
    icon: "✓",
  },
  {
    title: "PATTERN PREVIEW",
    description: "Visual layout display",
    icon: "✓",
  },
];

export function FeatureList({ className = "" }: FeatureListProps) {
  return (
    <div className={`info-panel ${className}`}>
      <motion.h3
        className="text-2xl sm:text-xl font-bold mb-4 uppercase text-layit-blue"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        WHAT YOU CAN CALCULATE?
      </motion.h3>

      <div className="space-y-4">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            className="feature-item"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ x: 5, transition: { duration: 0.2 } }}
          >
            <div className="feature-icon">
              <span className="text-2xl font-bold text-layit-white">
                {feature.icon}
              </span>
            </div>
            <div>
              <h4 className="text-lg font-bold uppercase text-layit-blue">
                {feature.title}
              </h4>
              <p className="font-medium text-layit-blue/80">
                {feature.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
