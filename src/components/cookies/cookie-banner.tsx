"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";
import { useCookieConsentContext } from "./cookie-consent-provider";
import { CookiePreferencesModal } from "./cookie-preferences";
import { COMPANY_NAME, BANNER_TEXT } from "@/lib/cookies/constants";

export function CookieBanner() {
  const {
    showBanner,
    showPreferences,
    acceptAll,
    rejectAll,
    openPreferences,
  } = useCookieConsentContext();

  if (!showBanner && !showPreferences) {
    return null;
  }

  return (
    <>
      {showBanner && (
        <div
          role="dialog"
          aria-modal="false"
          aria-labelledby="cookie-banner-title"
          aria-describedby="cookie-banner-description"
          className={cn(
            "fixed bottom-0 left-0 right-0 z-50",
            "bg-background border-t border-border",
            "shadow-lg shadow-black/5 dark:shadow-black/20"
          )}
        >
          <Container className="py-4 md:py-6">
            <div className="flex flex-col gap-4">
              <div className="space-y-2">
                <h2
                  id="cookie-banner-title"
                  className="text-lg font-semibold text-foreground"
                >
                  How {COMPANY_NAME} uses Cookies
                </h2>
                <p
                  id="cookie-banner-description"
                  className="text-sm text-muted-foreground leading-relaxed"
                >
                  {BANNER_TEXT}{" "}
                  <Link
                    href="/cookie-policy"
                    className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
                  >
                    Cookie Policy
                  </Link>
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button
                  variant="outline"
                  onClick={openPreferences}
                  className="order-3 sm:order-1"
                >
                  Let Me Choose
                </Button>
                <Button
                  variant="outline"
                  onClick={rejectAll}
                  className="order-2"
                >
                  Reject All
                </Button>
                <Button onClick={acceptAll} className="order-1 sm:order-3">
                  Accept All
                </Button>
              </div>
            </div>
          </Container>
        </div>
      )}

      {showPreferences && <CookiePreferencesModal />}
    </>
  );
}
