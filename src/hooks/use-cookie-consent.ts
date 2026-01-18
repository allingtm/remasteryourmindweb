"use client";

import { useState, useCallback, useEffect } from "react";
import { getStoredConsent, setStoredConsent } from "@/lib/cookies/storage";
import type { CookiePreferences } from "@/lib/cookies/types";

const DEFAULT_PREFERENCES: CookiePreferences = {
  essential: true,
  analytics: false,
  marketing: false,
};

export function useCookieConsent() {
  const [hasConsented, setHasConsented] = useState(false);
  const [preferences, setPreferences] =
    useState<CookiePreferences>(DEFAULT_PREFERENCES);
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = getStoredConsent();
    if (stored) {
      setHasConsented(true);
      setPreferences(stored.preferences);
      setShowBanner(false);
    } else {
      setShowBanner(true);
    }
    setIsLoaded(true);
  }, []);

  const acceptAll = useCallback(() => {
    const allAccepted: CookiePreferences = {
      essential: true,
      analytics: true,
      marketing: true,
    };
    setStoredConsent(allAccepted);
    setPreferences(allAccepted);
    setHasConsented(true);
    setShowBanner(false);
    setShowPreferences(false);
  }, []);

  const rejectAll = useCallback(() => {
    const essentialOnly: CookiePreferences = {
      essential: true,
      analytics: false,
      marketing: false,
    };
    setStoredConsent(essentialOnly);
    setPreferences(essentialOnly);
    setHasConsented(true);
    setShowBanner(false);
    setShowPreferences(false);
  }, []);

  const savePreferences = useCallback((newPreferences: CookiePreferences) => {
    const safePreferences: CookiePreferences = {
      ...newPreferences,
      essential: true,
    };
    setStoredConsent(safePreferences);
    setPreferences(safePreferences);
    setHasConsented(true);
    setShowBanner(false);
    setShowPreferences(false);
  }, []);

  const openPreferences = useCallback(() => {
    setShowPreferences(true);
  }, []);

  const closePreferences = useCallback(() => {
    setShowPreferences(false);
  }, []);

  return {
    hasConsented,
    preferences,
    showBanner: isLoaded && showBanner,
    showPreferences,
    acceptAll,
    rejectAll,
    savePreferences,
    openPreferences,
    closePreferences,
    isLoaded,
  };
}
