import { cookies, headers } from "next/headers";

export type CtaVariant = "A" | "B";

export function getCtaVariant(): CtaVariant {
  // Read-only in Server Components. Cookie is set in middleware.ts.
  const jar = cookies();
  const existing = jar.get("exp_cta_v1")?.value;
  if (existing === "A" || existing === "B") return existing;
  return "A";
}

export function getRequestUtm(): Record<string, string> {
  const h = headers();
  const ref = h.get("referer") || "";
  const out: Record<string, string> = {};
  try {
    const u = new URL(ref);
    const keys = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];
    keys.forEach((k) => {
      const v = u.searchParams.get(k);
      if (v) out[k] = v;
    });
  } catch {}
  return out;
}

export function buildAffiliateUrl(
  baseUrl: string,
  opts?: {
    utm?: Record<string, string>;
    extra?: Record<string, string>;
    variant?: CtaVariant;
  }
): string {
  const u = new URL(baseUrl);
  const utmDefaults = {
    utm_source: process.env.NEXT_PUBLIC_UTM_SOURCE || "seo",
    utm_medium: process.env.NEXT_PUBLIC_UTM_MEDIUM || "affiliate",
    utm_campaign: process.env.NEXT_PUBLIC_UTM_CAMPAIGN || "1xbet_bonus_br",
  };

  const merged = { ...utmDefaults, ...(opts?.utm || {}) };
  Object.entries(merged).forEach(([k, v]) => v && u.searchParams.set(k, v));
  Object.entries(opts?.extra || {}).forEach(([k, v]) => v && u.searchParams.set(k, v));
  if (opts?.variant) u.searchParams.set("exp_cta", opts.variant);

  return u.toString();
}
