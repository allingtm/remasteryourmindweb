"use client";

import { cn } from "@/lib/utils";

interface OnlineToggleProps {
  isOnline: boolean;
  onToggle: () => void;
  isLoading?: boolean;
}

export function OnlineToggle({ isOnline, onToggle, isLoading = false }: OnlineToggleProps) {
  return (
    <button
      onClick={onToggle}
      disabled={isLoading}
      className={cn(
        "flex items-center gap-3 px-4 py-2 rounded-lg transition-all",
        "border",
        isOnline
          ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800"
          : "bg-muted/50 border-border",
        isLoading && "opacity-50 cursor-not-allowed"
      )}
    >
      {/* Status indicator dot */}
      <div className="relative">
        <div
          className={cn(
            "w-3 h-3 rounded-full transition-colors",
            isOnline ? "bg-green-500" : "bg-muted-foreground"
          )}
        />
        {isOnline && (
          <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-500 animate-ping opacity-75" />
        )}
      </div>

      {/* Status text */}
      <div className="text-left">
        <div className={cn(
          "text-sm font-medium",
          isOnline ? "text-green-700 dark:text-green-400" : "text-muted-foreground"
        )}>
          {isOnline ? "Online" : "Offline"}
        </div>
        <div className="text-xs text-muted-foreground">
          {isOnline ? "Taking live chats" : "Click to go online"}
        </div>
      </div>

      {/* Toggle switch */}
      <div
        className={cn(
          "relative w-11 h-6 rounded-full transition-colors ml-auto",
          isOnline ? "bg-green-500" : "bg-muted"
        )}
      >
        <div
          className={cn(
            "absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform",
            isOnline ? "translate-x-6" : "translate-x-1"
          )}
        />
      </div>
    </button>
  );
}
