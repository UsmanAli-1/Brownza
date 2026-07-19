"use client";

import * as React from "react";
import { motion, type Variants } from "framer-motion";

const EASE_LUX = [0.22, 1, 0.36, 1] as const;

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Seconds to wait before animating in. */
  delay?: number;
  /** Vertical offset (px) the element rises from. */
  y?: number;
  /** Replay each time it enters the viewport (default: animate once). */
  repeat?: boolean;
}

/**
 * Tasteful, reduced-motion-aware scroll reveal. Fades + rises children into
 * view once they enter the viewport. Framer Motion respects the user's
 * `prefers-reduced-motion` setting automatically.
 */
function Reveal({ children, className, delay = 0, y = 24, repeat = false }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: !repeat, amount: 0.2 }}
      transition={{ duration: 0.6, ease: EASE_LUX, delay }}
    >
      {children}
    </motion.div>
  );
}

/** Container that staggers the reveal of its `RevealItem` children. */
const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: EASE_LUX },
  },
};

interface StaggerProps {
  children: React.ReactNode;
  className?: string;
}

function Stagger({ children, className }: StaggerProps) {
  return (
    <motion.div
      className={className}
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
    >
      {children}
    </motion.div>
  );
}

function StaggerItem({ children, className }: StaggerProps) {
  return (
    <motion.div className={className} variants={staggerItem}>
      {children}
    </motion.div>
  );
}

export { Reveal, Stagger, StaggerItem };
