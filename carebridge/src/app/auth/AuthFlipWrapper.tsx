"use client";

import { motion, AnimatePresence } from "framer-motion";

export default function AuthFlipWrapper({
  children,
  flipKey,
}: {
  children: React.ReactNode;
  flipKey: string;
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={flipKey}
        initial={{
          rotateY: 90,
          opacity: 0,
          scale: 0.8
        }}
        animate={{
          rotateY: 0,
          opacity: 1,
          scale: 1
        }}
        exit={{
          rotateY: -90,
          opacity: 0,
          scale: 0.8
        }}
        transition={{
          duration: 0.7,
          ease: [0.25, 0.46, 0.45, 0.94],
          opacity: { duration: 0.4 },
          scale: { duration: 0.5 }
        }}
        style={{
          perspective: 1200,
          transformStyle: "preserve-3d",
        }}
        className="auth-flip-container"
      >
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
