"use client";

import { useCookieConsentContext } from "./cookie-consent-provider";

export function CookiePreferencesButton() {
  const { openPreferences } = useCookieConsentContext();

  return (
    <button
      onClick={openPreferences}
      className="text-sm leading-6 text-muted-foreground hover:text-foreground transition-colors"
    >
      Cookie Preferences
    </button>
  );
}
