import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const revalidate = 3600;

function isAllowedUrl(u: URL) {
  return u.protocol === "https:" || u.protocol === "http:";
}

function stripJinaBoilerplate(text: string) {
  // r.jina.ai returns markdown-ish text sometimes with leading metadata.
  // Keep it readable.
  return text
    .replace(/^\s*#+\s*Source:\s*.*$/gim, "")
    .replace(/^\s*\*\*Source\*\*:\s*.*$/gim, "")
    .replace(/^\s*\*\*URL\*\*:\s*.*$/gim, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function GET(req: NextRequest) {
  const urlParam = req.nextUrl.searchParams.get("url");
  if (!urlParam) return NextResponse.json({ content: "" }, { status: 400 });

  let target: URL;
  try {
    target = new URL(urlParam);
  } catch {
    return NextResponse.json({ content: "" }, { status: 400 });
  }

  if (!isAllowedUrl(target)) return NextResponse.json({ content: "" }, { status: 400 });

  // Use r.jina.ai to extract readable content (handles many paywalls/JS)
  const jina = `https://r.jina.ai/${target.toString()}`;

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 9000);

  try {
    const res = await fetch(jina, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; AffiliateSiteBot/1.0)",
        Accept: "text/plain,*/*",
      },
      next: { revalidate: 3600, tags: ["article"] },
    });

    if (!res.ok) {
      return NextResponse.json({ content: "" }, { status: 200 });
    }

    const txt = await res.text();
    const cleaned = stripJinaBoilerplate(txt);

    // Hard limit to keep payload small
    const content = cleaned.length > 12000 ? cleaned.slice(0, 12000) + "…" : cleaned;

    return NextResponse.json({ content }, { status: 200 });
  } catch {
    return NextResponse.json({ content: "" }, { status: 200 });
  } finally {
    clearTimeout(t);
  }
}
