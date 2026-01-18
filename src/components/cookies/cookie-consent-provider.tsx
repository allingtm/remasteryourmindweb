"use client";

import * as React from "react";
import { useCookieConsent } from "@/hooks/use-cookie-consent";
import type { CookieConsentContextValue } from "@/lib/cookies/types";

const CookieConsentContext = React.createContext<
  CookieConsentContextValue | undefined
>(undefined);

export function CookieConsentProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const consent = useCookieConsent();

  return (
    <CookieConsentContext.Provider value={consent}>
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsentContext() {
  const context = React.useContext(CookieConsentContext);
  if (context === undefined) {
    throw new Error(
      "useCookieConsentContext must be used within a CookieConsentProvider"
    );
  }
  return context;
}
