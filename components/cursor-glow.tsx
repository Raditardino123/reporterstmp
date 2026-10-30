"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect } from "react";

export function CursorGlow() {
  const pointerX = useMotionValue(-100);
  const pointerY = useMotionValue(-100);
  const x = useSpring(pointerX, { stiffness: 280, damping: 32, mass: 0.35 });
  const y = useSpring(pointerY, { stiffness: 280, damping: 32, mass: 0.35 });

  useEffect(() => {
    const media = window.matchMedia("(pointer: fine)");
    if (!media.matches) return;

    function handlePointerMove(event: PointerEvent) {
      pointerX.set(event.clientX);
      pointerY.set(event.clientY);
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, [pointerX, pointerY]);

  return (
    <motion.span
      aria-hidden="true"
      className="cursor-glow"
      style={{ x, y }}
    />
  );
}
