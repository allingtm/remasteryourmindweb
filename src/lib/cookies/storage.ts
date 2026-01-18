import {
  CONSENT_STORAGE_KEY,
  CONSENT_COOKIE_NAME,
  CONSENT_VERSION,
  CONSENT_EXPIRY_DAYS,
} from "./constants";
import type { StoredConsent, CookiePreferences } from "./types";

export function getStoredConsent(): StoredConsent | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored) as StoredConsent;
    if (parsed.version !== CONSENT_VERSION) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function setStoredConsent(preferences: CookiePreferences): void {
  if (typeof window === "undefined") return;

  const existingConsent = getStoredConsent();
  const now = new Date().toISOString();

  const consent: StoredConsent = {
    version: CONSENT_VERSION,
    consentedAt: existingConsent?.consentedAt ?? now,
    updatedAt: now,
    preferences,
  };

  localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consent));
  setConsentCookie(preferences.analytics || preferences.marketing);
}

function setConsentCookie(hasNonEssential: boolean): void {
  const expires = new Date();
  expires.setDate(expires.getDate() + CONSENT_EXPIRY_DAYS);

  const secure = typeof window !== "undefined" && location.protocol === "https:";
  document.cookie = `${CONSENT_COOKIE_NAME}=${hasNonEssential ? "1" : "0"}; expires=${expires.toUTCString()}; path=/; SameSite=Lax${secure ? "; Secure" : ""}`;
}

export function clearConsent(): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem(CONSENT_STORAGE_KEY);
  document.cookie = `${CONSENT_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}
