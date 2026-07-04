"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

export function ConversionTracker() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.gtag) {
      window.gtag("event", "generate_lead", {
        event_category: "conversion",
        event_label: "book_demo_thank_you",
      });
    }

    if (window.fbq) {
      window.fbq("track", "Lead");
    }
  }, []);

  return null;
}
