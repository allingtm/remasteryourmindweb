"use client";

import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AIGenerateButtonProps {
  onClick: () => void;
  isGenerating: boolean;
  disabled?: boolean;
  contentLength: number;
  className?: string;
}

const MIN_CONTENT_LENGTH = 100;

export function AIGenerateButton({
  onClick,
  isGenerating,
  disabled,
  contentLength,
  className,
}: AIGenerateButtonProps) {
  const isTooShort = contentLength < MIN_CONTENT_LENGTH;
  const isDisabled = disabled || isGenerating || isTooShort;

  return (
    <div className={cn("space-y-2", className)}>
      <Button
        type="button"
        variant="outline"
        onClick={onClick}
        disabled={isDisabled}
        className={cn(
          "w-full justify-center gap-2",
          !isDisabled && "border-primary/50 hover:border-primary hover:bg-primary/5"
        )}
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Generate with AI
          </>
        )}
      </Button>
      {isTooShort && (
        <p className="text-xs text-muted-foreground text-center">
          Write at least {MIN_CONTENT_LENGTH} characters to enable AI generation
          <br />
          <span className="text-muted-foreground/70">
            ({contentLength}/{MIN_CONTENT_LENGTH})
          </span>
        </p>
      )}
    </div>
  );
}
