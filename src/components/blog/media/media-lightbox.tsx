"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { MediaItem } from "@/types";

interface MediaLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  media: MediaItem[];
  initialIndex?: number;
}

export function MediaLightbox({
  isOpen,
  onClose,
  media,
  initialIndex = 0,
}: MediaLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : media.length - 1));
  }, [media.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < media.length - 1 ? prev + 1 : 0));
  }, [media.length]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          goToPrevious();
          break;
        case "ArrowRight":
          goToNext();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose, goToPrevious, goToNext]);

  if (!isOpen || media.length === 0) return null;

  const currentMedia = media[currentIndex];
  const showNavigation = media.length > 1;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
        onClick={onClose}
      >
        {/* Close button */}
        <button
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          onClick={onClose}
        >
          <X className="h-6 w-6 text-white" />
        </button>

        {/* Navigation - Previous */}
        {showNavigation && (
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              goToPrevious();
            }}
          >
            <ChevronLeft className="h-8 w-8 text-white" />
          </button>
        )}

        {/* Image container */}
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="relative max-w-[90vw] max-h-[90vh] w-full h-full flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <Image
            src={currentMedia.public_url}
            alt={currentMedia.alt_text || ""}
            width={currentMedia.width || 1920}
            height={currentMedia.height || 1080}
            className="max-w-full max-h-[85vh] object-contain"
            priority
          />
        </motion.div>

        {/* Navigation - Next */}
        {showNavigation && (
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
          >
            <ChevronRight className="h-8 w-8 text-white" />
          </button>
        )}

        {/* Caption and counter */}
        <div className="absolute bottom-4 left-0 right-0 text-center">
          {currentMedia.caption && (
            <p className="text-white/90 text-sm mb-2 px-4">
              {currentMedia.caption}
            </p>
          )}
          {showNavigation && (
            <p className="text-white/60 text-sm">
              {currentIndex + 1} / {media.length}
            </p>
          )}
        </div>

        {/* Thumbnail strip for galleries */}
        {showNavigation && media.length <= 10 && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2">
            {media.map((item, index) => (
              <button
                key={item.id}
                className={`relative w-12 h-12 rounded overflow-hidden transition-all ${
                  index === currentIndex
                    ? "ring-2 ring-white"
                    : "opacity-50 hover:opacity-75"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(index);
                }}
              >
                <Image
                  src={item.public_url}
                  alt=""
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
