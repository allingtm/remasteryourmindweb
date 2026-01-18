"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface CalendlyConfig {
  eventTypeUri: string;
  schedulingUrl: string;
  postId: string;
  ctaTitle: string;
  ctaDescription?: string | null;
}

interface CalendlyContextValue {
  config: CalendlyConfig | null;
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const CalendlyContext = createContext<CalendlyContextValue | null>(null);

interface CalendlyProviderProps {
  children: ReactNode;
  config: CalendlyConfig | null;
}

export function CalendlyProvider({ children, config }: CalendlyProviderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = useCallback(() => {
    if (config) {
      setIsModalOpen(true);
    }
  }, [config]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  return (
    <CalendlyContext.Provider value={{ config, isModalOpen, openModal, closeModal }}>
      {children}
    </CalendlyContext.Provider>
  );
}

export function useCalendly() {
  const context = useContext(CalendlyContext);
  if (!context) {
    throw new Error("useCalendly must be used within a CalendlyProvider");
  }
  return context;
}

// Safe version that doesn't throw - useful for shortcode components
export function useCalendlySafe() {
  return useContext(CalendlyContext);
}
