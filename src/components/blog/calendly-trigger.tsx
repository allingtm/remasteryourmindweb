"use client";

import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCalendlySafe } from "./calendly-context";

interface CalendlyTriggerProps {
  title?: string;
  description?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
}

export function CalendlyTrigger({
  title,
  description,
  variant = "default",
  size = "default",
  className,
}: CalendlyTriggerProps) {
  const calendly = useCalendlySafe();

  // If no Calendly context or not configured, don't render
  if (!calendly || !calendly.config) {
    return null;
  }

  const buttonTitle = title || calendly.config.ctaTitle || "Schedule a Meeting";

  return (
    <div className="my-6 not-prose">
      <Button
        variant={variant}
        size={size}
        onClick={calendly.openModal}
        className={className}
      >
        <Calendar className="h-4 w-4 mr-2" />
        {buttonTitle}
      </Button>
      {description && (
        <p className="text-sm text-muted-foreground mt-2">{description}</p>
      )}
    </div>
  );
}

// Wrapper component for markdown shortcode that handles string props
interface CalendlyShortcodeProps {
  title?: string;
  description?: string;
  variant?: string;
  size?: string;
  className?: string;
}

export function CalendlyShortcode({
  title,
  description,
  variant,
  size,
  className,
}: CalendlyShortcodeProps) {
  return (
    <CalendlyTrigger
      title={title}
      description={description}
      variant={variant as "default" | "outline" | "ghost" | undefined}
      size={size as "default" | "sm" | "lg" | undefined}
      className={className}
    />
  );
}
