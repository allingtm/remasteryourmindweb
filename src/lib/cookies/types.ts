export interface CookieCategory {
  id: "essential" | "analytics" | "marketing";
  name: string;
  description: string;
  required: boolean;
}

export interface CookiePreferences {
  essential: true;
  analytics: boolean;
  marketing: boolean;
}

export interface StoredConsent {
  version: number;
  consentedAt: string;
  updatedAt: string;
  preferences: CookiePreferences;
}

export interface CookieConsentContextValue {
  hasConsented: boolean;
  preferences: CookiePreferences;
  showBanner: boolean;
  showPreferences: boolean;
  isLoaded: boolean;
  acceptAll: () => void;
  rejectAll: () => void;
  savePreferences: (preferences: CookiePreferences) => void;
  openPreferences: () => void;
  closePreferences: () => void;
}
