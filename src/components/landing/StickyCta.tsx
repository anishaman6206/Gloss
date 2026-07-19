"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Camera } from "lucide-react";

export function StickyCta() {
  const { scrollYProgress } = useScroll();
  const [visible, setVisible] = useState(false);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setVisible(v > 0.5 && v < 0.95);
  });

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-5 right-5 z-40"
          data-testid="sticky-cta"
        >
          <Link
            href="/scan"
            data-testid="cta-sticky-scan"
            className="btn-tactile bg-brand !py-3 !px-5 text-sm shadow-tactile shadow-brand-shadow"
          >
            <Camera size={16} /> Try Gloss free
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
