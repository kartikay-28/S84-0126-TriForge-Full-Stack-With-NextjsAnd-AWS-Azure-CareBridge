"use client";

import { motion } from "framer-motion";

export default function AuthFlipWrapper({
  children,
  flipKey,
}: {
  children: React.ReactNode;
  flipKey: string;
}) {
  return (
    <motion.div
      key={flipKey}
      initial={{ rotateY: 90, opacity: 0 }}
      animate={{ rotateY: 0, opacity: 1 }}
      exit={{ rotateY: -90, opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      style={{
        perspective: 1200,
        transformStyle: "preserve-3d",
      }}
    >
      {children}
    </motion.div>
  );
}
