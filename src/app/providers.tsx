"use client";

import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";
import { CookieConsentBanner } from "@/components/cookie-consent-banner";
import { PortalVisitTracker } from "@/components/portal-visit-tracker";

export function Providers({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  return (
    <SessionProvider session={session}>
      <PortalVisitTracker />
      {children}
      <CookieConsentBanner />
    </SessionProvider>
  );
}
