"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useReducedMotion } from "@valenor/design-system";

/**
 * Replaces the system cursor with a small pin — a tailor's pin, not a
 * decorative blob. Widens on interactive targets. Disabled on touch
 * devices and when the user prefers reduced motion.
 */
export function Cursor() {
  const reducedMotion = useReducedMotion();
  const [isFinePointer, setIsFinePointer] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const springX = useSpring(x, { stiffness: 500, damping: 40, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 500, damping: 40, mass: 0.4 });

  useEffect(() => {
    setIsFinePointer(window.matchMedia("(pointer: fine)").matches);
  }, []);

  useEffect(() => {
    if (!isFinePointer || reducedMotion) return;

    document.body.classList.add("has-custom-cursor");

    const move = (event: PointerEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);
    };

    const over = (event: PointerEvent) => {
      const target = event.target as HTMLElement;
      setIsHovering(Boolean(target.closest("a, button, [data-cursor-catch]")));
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerover", over);
    return () => {
      document.body.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
    };
  }, [isFinePointer, reducedMotion, x, y]);

  if (!isFinePointer || reducedMotion) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[100] mix-blend-difference"
      style={{ x: springX, y: springY }}
    >
      <motion.div
        animate={{
          scale: isHovering ? 2.2 : 1,
          opacity: isHovering ? 0.9 : 0.7,
        }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="-ml-[3px] -mt-[3px] h-[6px] w-[6px] rounded-full bg-fg"
      />
    </motion.div>
  );
}
