"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

// Make sure these paths match your actual files
const HERO_IMAGES = [
  "/journal/Journal1.png",
  "/journal/Journal2.png",
  "/journal/Journal3.png",
  "/journal/Journal4.png",
  "/journal/Journal5.png",
  "/journal/Journal6.png",
  "/journal/Journal7.png",
  "/journal/Journal8.png",
  "/journal/Journal9.png",
  "/journal/Journal10.png",
  "/journal/Journal11.png",
  "/journal/Journal12.png",
  "/journal/Journal13.png",
];

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // 7000ms = 7 seconds per slide
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 7000); 
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="aspect-[21/9] w-full bg-bg-raised border border-theme relative overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          // Slowed down transition for a more "luxurious" feel
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2.0, ease: "easeInOut" }} 
          className="absolute inset-0"
        >
          <Image 
            src={HERO_IMAGES[index]} 
            alt={`Hero Slide ${index + 1}`} 
            fill 
            className="object-cover mix-blend-luminosity opacity-90" 
            priority 
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}