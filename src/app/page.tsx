"use client";

import { useProjectStore } from "@/store/project-store";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { HeroSection } from "@/components/home/hero-section";
import { FeatureList } from "@/components/home/feature-list";
import { AnimatedTileGrid } from "@/components/ui/animated-tile-grid";

export default function HomePage() {
  const router = useRouter();
  const { createNewProject } = useProjectStore();

  const handleNewProject = () => {
    createNewProject();
    router.push("/project/wizard");
  };

  return (
    <div className="min-h-screen bg-layit-yellow">
      {/* Header */}
      <header className="header-block flex justify-between items-center">
        <div className="brand-title">LAY-IT-RIGHT</div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-6 max-w-7xl">
        {/* Hero Section */}
        <HeroSection />

        {/* Split Layout */}
        <div className="split-container">
          {/* Left: Info Panel */}
          <FeatureList />

          {/* Right: Preview Panel */}
          <div className="preview-panel">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <AnimatedTileGrid className="mb-6" />
            </motion.div>
            <motion.h3
              className="text-2xl font-bold uppercase text-center text-layit-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              MORPHING TILE PATTERNS
            </motion.h3>
          </div>
        </div>

        {/* CTA Button */}
        <motion.button
          className="cta-mega mt-8"
          onClick={handleNewProject}
          whileHover={{
            scale: 1.02,
            boxShadow: "12px 12px 0px var(--layit-yellow)",
            transform: "translate(-6px, -6px)",
          }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          aria-label="Start new tiling project"
        >
          START PROJECT NOW
        </motion.button>
      </main>

      {/* Footer */}
      <footer className="bg-layit-white/90 border-t-6 border-layit-blue mt-8">
        <div className="container mx-auto px-6 py-8 text-center">
          <p className="text-layit-blue font-medium">
            © 2024 LayItRight. Helping you tile it right, the first time.
          </p>
        </div>
      </footer>
    </div>
  );
}
