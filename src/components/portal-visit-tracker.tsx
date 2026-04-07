"use client";

import { useEffect } from "react";

const KEY = "moscasting_portal_visit_v1";

export function PortalVisitTracker() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (sessionStorage.getItem(KEY)) return;
      sessionStorage.setItem(KEY, "1");
      void fetch("/api/analytics/portal-visit", { method: "POST", credentials: "include" });
    } catch {
      /* ignore */
    }
  }, []);
  return null;
}
