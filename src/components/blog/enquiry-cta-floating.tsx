"use client";

import { useState, useEffect } from "react";
import { MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface EnquiryCTAFloatingProps {
  ctaTitle: string;
  onOpenModal: () => void;
}

export function EnquiryCTAFloating({ ctaTitle, onOpenModal }: EnquiryCTAFloatingProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Show button after scrolling 300px
  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-6 right-6 z-40"
        >
          <button
            onClick={onOpenModal}
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
            className="flex items-center gap-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            <motion.div
              className="flex items-center gap-2 px-4 py-3"
              animate={{ paddingRight: isExpanded ? 24 : 16 }}
            >
              <MessageSquare className="h-5 w-5 flex-shrink-0" />
              <AnimatePresence mode="wait">
                {isExpanded && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="font-medium whitespace-nowrap overflow-hidden"
                  >
                    {ctaTitle}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
