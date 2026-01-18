"use client";

import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FieldSuggestionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export function FieldSuggestionButton({
  onClick,
  disabled,
  className,
}: FieldSuggestionButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10",
        className
      )}
      title="Get AI suggestions"
    >
      <Sparkles className="h-3.5 w-3.5" />
    </Button>
  );
}
