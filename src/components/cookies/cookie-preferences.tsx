"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCookieConsentContext } from "./cookie-consent-provider";
import { COOKIE_CATEGORIES } from "@/lib/cookies/constants";
import type { CookiePreferences } from "@/lib/cookies/types";

export function CookiePreferencesModal() {
  const {
    preferences,
    savePreferences,
    closePreferences,
    rejectAll,
    acceptAll,
  } = useCookieConsentContext();
  const [localPreferences, setLocalPreferences] =
    React.useState<CookiePreferences>(preferences);

  const handleToggle = (categoryId: "analytics" | "marketing") => {
    setLocalPreferences((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const handleSave = () => {
    savePreferences(localPreferences);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-preferences-title"
    >
      <div
        className={cn(
          "bg-background rounded-lg shadow-xl",
          "w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto",
          "border border-border"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 id="cookie-preferences-title" className="text-lg font-semibold">
            Cookie Preferences
          </h2>
          <button
            onClick={closePreferences}
            className="p-2 rounded-md hover:bg-muted transition-colors"
            aria-label="Close cookie preferences"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {COOKIE_CATEGORIES.map((category) => (
            <div
              key={category.id}
              className="p-4 rounded-lg border border-border"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">{category.name}</h3>
                {category.required ? (
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                    Always Active
                  </span>
                ) : (
                  <button
                    type="button"
                    role="switch"
                    aria-checked={
                      localPreferences[
                        category.id as keyof CookiePreferences
                      ] as boolean
                    }
                    onClick={() =>
                      handleToggle(category.id as "analytics" | "marketing")
                    }
                    className={cn(
                      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      localPreferences[category.id as keyof CookiePreferences]
                        ? "bg-primary"
                        : "bg-input"
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                        localPreferences[
                          category.id as keyof CookiePreferences
                        ]
                          ? "translate-x-6"
                          : "translate-x-1"
                      )}
                    />
                  </button>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {category.description}
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 p-4 border-t border-border">
          <Button variant="outline" onClick={rejectAll} className="flex-1">
            Reject All
          </Button>
          <Button variant="outline" onClick={acceptAll} className="flex-1">
            Accept All
          </Button>
          <Button onClick={handleSave} className="flex-1">
            Save Preferences
          </Button>
        </div>
      </div>
    </div>
  );
}
