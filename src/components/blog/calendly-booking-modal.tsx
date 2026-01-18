"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { X, CheckCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { InlineWidget, useCalendlyEventListener } from "react-calendly";
import { useCalendly } from "./calendly-context";

export function CalendlyBookingModal() {
  const { config, isModalOpen, closeModal } = useCalendly();
  const { resolvedTheme } = useTheme();
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Calendly pageSettings for dark/light mode (requires Calendly Pro plan)
  const pageSettings = {
    backgroundColor: resolvedTheme === "dark" ? "0a0a0a" : "ffffff",
    textColor: resolvedTheme === "dark" ? "fafafa" : "0a0a0a",
    primaryColor: resolvedTheme === "dark" ? "3b82f6" : "2563eb",
  };

  // Fallback timeout to hide loading state if Calendly events don't fire
  useEffect(() => {
    if (!isModalOpen) return;

    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 3000); // Hide loader after 3 seconds max

    return () => clearTimeout(timeout);
  }, [isModalOpen]);

  // Listen for Calendly events
  useCalendlyEventListener({
    onProfilePageViewed: () => {
      setIsLoading(false);
    },
    onDateAndTimeSelected: () => {
      setIsLoading(false);
    },
    onEventScheduled: async (e) => {
      // Save booking to database
      try {
        await fetch("/api/calendly/booking-confirmed", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventUri: e.data.payload.event?.uri,
            inviteeUri: e.data.payload.invitee?.uri,
            postId: config?.postId,
          }),
        });
      } catch (error) {
        console.error("Failed to save booking:", error);
      }

      setBookingConfirmed(true);

      // Close modal after showing success
      setTimeout(() => {
        handleClose();
      }, 3000);
    },
  });

  const handleClose = () => {
    closeModal();
    // Reset state after animation
    setTimeout(() => {
      setBookingConfirmed(false);
      setIsLoading(true);
    }, 300);
  };

  if (!config) return null;

  return (
    <AnimatePresence>
      {isModalOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={handleClose}
          />

          {/* Modal - MOBILE FIRST: full screen on mobile, centered on desktop */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-xl md:h-[85vh] md:rounded-2xl bg-background z-50 overflow-hidden flex flex-col"
          >
            {/* Header with close button */}
            <div className="shrink-0 px-4 py-3 border-b border-border flex justify-between items-center bg-background">
              <h3 className="font-semibold text-lg">{config.ctaTitle}</h3>
              <button
                type="button"
                onClick={handleClose}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content area */}
            <div className="flex-1 overflow-hidden relative">
              {/* Loading state */}
              {isLoading && !bookingConfirmed && (
                <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Loading calendar...</p>
                  </div>
                </div>
              )}

              {/* Success state */}
              {bookingConfirmed ? (
                <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center px-6"
                  >
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Booking Confirmed!</h3>
                    <p className="text-muted-foreground">
                      You'll receive a calendar invite shortly.
                    </p>
                  </motion.div>
                </div>
              ) : (
                /* Calendly Embed - fills remaining space */
                <InlineWidget
                  url={config.schedulingUrl}
                  styles={{
                    height: "100%",
                    minWidth: "100%",
                  }}
                  pageSettings={pageSettings}
                />
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
