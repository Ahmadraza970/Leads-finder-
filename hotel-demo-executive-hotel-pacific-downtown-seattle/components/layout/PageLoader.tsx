"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function PageLoader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 1100);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[90] flex flex-col items-center justify-center bg-cream"
          exit={{ opacity: 0, transition: { duration: 0.6, ease: "easeInOut" } }}
          aria-hidden="true"
        >
          <svg viewBox="0 0 48 48" className="size-12" fill="none">
            <path
              d="M13 36V20.5a11 11 0 0 1 22 0V36"
              stroke="#4E342E"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
            <path
              d="M13 36h22M17 36v-10h14v10"
              stroke="#8B6B4A"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="mt-5 font-display text-lg font-semibold tracking-wide text-dark">
            Grand Orion
          </p>
          <div className="mt-5 h-px w-40 overflow-hidden rounded-full bg-beige">
            <motion.div
              className="h-full bg-fawn"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 1, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}