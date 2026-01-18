"use client";

import { CONTENT_PLANNER_STEP_LABELS } from "@/types/content-planner";
import { Check } from "lucide-react";

interface ProgressIndicatorProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export function ProgressIndicator({ currentStep, onStepClick }: ProgressIndicatorProps) {
  return (
    <div className="flex items-center justify-between">
      {CONTENT_PLANNER_STEP_LABELS.map((label, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;
        const isClickable = onStepClick && stepNumber < currentStep;

        return (
          <div key={label} className="flex items-center flex-1 last:flex-initial">
            {/* Step Circle */}
            <button
              onClick={() => isClickable && onStepClick(stepNumber)}
              disabled={!isClickable}
              className={`
                flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                transition-colors
                ${
                  isCompleted
                    ? "bg-primary text-primary-foreground cursor-pointer hover:bg-primary/90"
                    : isCurrent
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }
                ${!isClickable && !isCurrent ? "cursor-default" : ""}
              `}
            >
              {isCompleted ? <Check className="h-4 w-4" /> : stepNumber}
            </button>

            {/* Step Label */}
            <span
              className={`
                ml-2 text-xs hidden sm:inline
                ${isCurrent ? "font-medium text-foreground" : "text-muted-foreground"}
              `}
            >
              {label}
            </span>

            {/* Connector Line */}
            {index < CONTENT_PLANNER_STEP_LABELS.length - 1 && (
              <div
                className={`
                  flex-1 h-0.5 mx-3
                  ${isCompleted ? "bg-primary" : "bg-muted"}
                `}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
