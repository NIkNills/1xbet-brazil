"use client";

import { useMemo } from "react";

type Props = {
  baseUrl: string;
  variant: "A" | "B";
  placement: string; // e.g. hero, header, bonus_card, footer, floating
  className: string;
  children: React.ReactNode;
};

function buildUrl(baseUrl: string, variant: "A" | "B") {
  const u = new URL(baseUrl);
  const utmDefaults = {
    utm_source: process.env.NEXT_PUBLIC_UTM_SOURCE || "seo",
    utm_medium: process.env.NEXT_PUBLIC_UTM_MEDIUM || "affiliate",
    utm_campaign: process.env.NEXT_PUBLIC_UTM_CAMPAIGN || "1xbet_bonus_br",
  };

  Object.entries(utmDefaults).forEach(([k, v]) => v && u.searchParams.set(k, v));

  // Merge current page UTMs if present
  try {
    const cur = new URL(window.location.href);
    ["utm_source","utm_medium","utm_campaign","utm_term","utm_content"].forEach((k) => {
      const v = cur.searchParams.get(k);
      if (v) u.searchParams.set(k, v);
    });
  } catch {}

  u.searchParams.set("exp_cta", variant);
  return u.toString();
}

export default function CTAButton({ baseUrl, variant, placement, className, children }: Props) {
  const href = useMemo(() => {
    if (typeof window === "undefined") return baseUrl;
    return buildUrl(baseUrl, variant);
  }, [baseUrl, variant]);

  function track() {
    // GA4
    try {
      window.gtag?.("event", "cta_click", {
        placement,
        variant,
        link_url: href,
      });
    } catch {}

    // Meta Pixel
    try {
      window.fbq?.("trackCustom", "CTA_Click", {
        placement,
        variant,
        link_url: href,
      });
    } catch {}
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="sponsored nofollow noopener"
      className={className}
      onClick={track}
      data-cta-placement={placement}
      data-cta-variant={variant}
    >
      {children}
    </a>
  );
}
